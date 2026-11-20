"""Safety and correctness of offline validation and synthetic course data."""
import json
import sys
from contextlib import nullcontext
from datetime import date
from types import SimpleNamespace
from unittest.mock import MagicMock

import pytest

from tests.test_project_scripts import load, ScriptConnection, connect_to


@pytest.mark.parametrize('phase,backend_code,e2e_code,fault', [
    ('integration', 0, 0, ''), ('integration', 7, 0, ''), ('e2e', 0, 0, ''), ('all', 0, 9, ''),
    ('e2e', 0, 0, 'missing-dist'), ('e2e', 0, 0, 'early-exit'),
    ('e2e', 0, 0, 'health-timeout'), ('e2e', 0, 0, 'connection-error'), ('e2e', 0, 0, 'kill'),
])
def test_native_validation_isolates_credentials_and_always_removes_resources(
    tmp_path, monkeypatch, phase, backend_code, e2e_code, fault,
):
    module = load('verify_native')
    monkeypatch.setattr(module, 'ROOT', tmp_path)
    monkeypatch.setattr(module, 'dotenv_values', lambda *a, **kw: {'DATABASE_URL': 'postgresql://owner:private@localhost/original'})
    monkeypatch.setattr(module.socket, 'socket', MagicMock())
    conn = ScriptConnection({'SHOW server_version': [('18',)], 'SELECT postgis_lib_version': [('3.6',)]})
    monkeypatch.setattr(module.psycopg, 'connect', connect_to(conn))
    prepare = MagicMock()
    monkeypatch.setattr(module, 'prepare_database', prepare)
    monkeypatch.setattr(module, 'build_dataset', lambda settings: 'synthetic')
    dist = tmp_path / 'src/frontend/dist'
    dist.mkdir(parents=True)
    (dist / 'index.html').write_text('<html lang="es"></html>')
    if fault == 'missing-dist':
        (dist / 'index.html').unlink()
    migrations = tmp_path / 'src/backend/infrastructure/persistence/migrations'
    migrations.mkdir(parents=True)
    (migrations / '001.sql').write_text('SELECT 42')
    calls = []

    def execute(command, **kwargs):
        env = kwargs['env']
        assert '/alpha_verify_' in env['DATABASE_URL']
        assert 'private' not in env['DATABASE_URL'] and '/original' not in env['DATABASE_URL']
        assert 'DATABASE_URL=' + env['DATABASE_URL'] in module.Path(env['ECOLOGISTICA_ENV_FILE']).read_text()
        calls.append(command)
        return SimpleNamespace(returncode=e2e_code if command[0] == 'node' else backend_code)

    monkeypatch.setattr(module.subprocess, 'run', execute)
    server = MagicMock()
    server.poll.return_value = 1 if fault == 'early-exit' else None
    if fault == 'kill':
        server.wait.side_effect = [module.subprocess.TimeoutExpired('synthetic', 10), 0]
    monkeypatch.setattr(module.subprocess, 'Popen', MagicMock(return_value=server))
    health = MagicMock()
    health.getresponse.return_value.status = 503 if fault == 'health-timeout' else 200
    if fault == 'connection-error':
        health.request.side_effect = [OSError('not ready'), None]
    monkeypatch.setattr(module.time, 'sleep', lambda seconds: None)
    monkeypatch.setattr(module, 'HTTPConnection', MagicMock(return_value=health))
    args = SimpleNamespace(env_file=tmp_path / 'unused', phase=phase)
    expected_error = ValueError if fault == 'missing-dist' else RuntimeError
    context = pytest.raises(expected_error) if fault in ('missing-dist', 'early-exit', 'health-timeout') else nullcontext()
    with context:
        assert module.run(args) == (backend_code or e2e_code)
    sql = '\n'.join(query for query, _ in conn.calls)
    assert 'DROP DATABASE "alpha_verify_' in sql and 'DROP ROLE "alpha_runner_' in sql
    assert 'original' not in sql
    receipt = json.loads(next((tmp_path / 'reports/native').glob('*/receipt.json')).read_text())
    assert receipt['isolated_database_removed'] and receipt['temporary_role_removed']
    assert not receipt['docker_used']
    assert not list((tmp_path / '.test-deps').iterdir())
    assert prepare.call_args.args[0].database_url.startswith('postgresql://alpha_runner_')
    if phase != 'integration' and fault != 'missing-dist':
        server.terminate.assert_called_once()
        assert health.close.call_count == (50 if fault == 'health-timeout' else 2 if fault == 'connection-error' else 0 if fault == 'early-exit' else 1)
        assert server.kill.call_count == (fault == 'kill')


@pytest.mark.parametrize('url', ['', 'postgresql://owner@production/db', 'https://localhost/db'])
def test_native_validation_rejects_nonlocal_database_before_connecting(tmp_path, monkeypatch, url):
    module = load('verify_native')
    monkeypatch.setattr(module, 'dotenv_values', lambda *a, **kw: {'DATABASE_URL': url})
    connect = MagicMock(side_effect=AssertionError('Must not connect'))
    monkeypatch.setattr(module.psycopg, 'connect', connect)
    with pytest.raises(ValueError, match='local'):
        module.run(SimpleNamespace(env_file=tmp_path / 'unused', phase='all'))
    connect.assert_not_called()


def write_sus(tmp_path, rows, header=True):
    path = tmp_path / 'responses.csv'
    lines = ['id,perfil,' + ','.join(f'q{i}' for i in range(1, 11))] if header else ['wrong,header']
    path.write_text('\n'.join(lines + rows), encoding='utf-8')
    return path


def test_sus_scoring_uses_odd_even_conversion_and_exact_mean(tmp_path):
    path = write_sus(tmp_path, [f'p{i},operator,' + ','.join(['5', '1'] * 5) for i in range(5)])
    result = load('score_sus').score_responses(path)
    assert result['n'] == 5 and result['promedio_sus'] == 100 and result['alcanza_68']
    assert all(row['impares'] == row['pares'] == 20 for row in result['participantes'])
    path = write_sus(tmp_path, ['p1,driver,' + ','.join(['3'] * 10)])
    result = load('score_sus').score_responses(path)
    assert result['promedio_sus'] == 50 and not result['alcanza_68']


@pytest.mark.parametrize('rows,header', [
    ([], False), ([], True), (['p1,driver,1'], True),
    (['p1,driver,' + ','.join(['6'] * 10)], True),
    ([',driver,' + ','.join(['3'] * 10)], True),
    (['p1,,' + ','.join(['3'] * 10)], True),
    (['p1,driver,' + ','.join(['3'] * 11)], True),
    (['p1,driver,' + ','.join(['3'] * 10)] * 2, True),
])
def test_sus_rejects_incomplete_ambiguous_or_invalid_responses(tmp_path, rows, header):
    with pytest.raises(ValueError):
        load('score_sus').score_responses(write_sus(tmp_path, rows, header))


def test_sus_cli_prints_scores_and_reports_missing_file(tmp_path, monkeypatch, capsys):
    module = load('score_sus')
    path = write_sus(tmp_path, ['p1,driver,' + ','.join(['3'] * 10)])
    monkeypatch.setattr(sys, 'argv', ['score_sus.py', str(path)])
    module.main()
    assert json.loads(capsys.readouterr().out)['promedio_sus'] == 50
    monkeypatch.setattr(sys, 'argv', ['score_sus.py', str(tmp_path / 'missing')])
    with pytest.raises(SystemExit) as error:
        module.main()
    assert error.value.code == 2


@pytest.mark.parametrize('stop', ['none', 'driver', 'order', 'route', 'existing', 'vehicle', 'user'])
def test_course_demo_does_not_overwrite_existing_users_or_assigned_orders(monkeypatch, stop):
    module = load('ensure_course_demo')
    queries = {
        'SELECT 1 FROM usuarios': [] if stop == 'user' else [(1,)],
        'SELECT 1 FROM vehiculos': [] if stop == 'vehicle' else [(1,)],
        'SELECT 1 FROM conductores': [] if stop == 'driver' else [(1,)],
        'SELECT latitud,longitud FROM pedidos': [] if stop == 'order' else [(-12.05, -76.95)],
        'SELECT almacen_id': [('depot', -12.04, -76.96)],
        'INSERT INTO rutas': [] if stop == 'route' else [('route',)],
    }
    conn = ScriptConnection(queries)
    monkeypatch.setattr(module, 'password_hash', lambda password: 'hashed')
    module.seed_training_scenario(conn, 'synthetic-test-password', date(2026, 11, 20))
    updates = [query for query, _ in conn.calls if query.startswith('UPDATE pedidos')]
    assert bool(updates) == (stop not in ('driver', 'order', 'route'))
    assert not any(query.startswith('UPDATE usuarios') for query, _ in conn.calls)
    if stop == 'user':
        assert any(query.startswith('INSERT INTO usuarios') for query, _ in conn.calls)
    if stop == 'vehicle':
        assert not any(query.startswith('INSERT INTO conductores') for query, _ in conn.calls)


@pytest.mark.parametrize('password', ['', 'short', 'x' * 257])
def test_course_demo_rejects_weak_or_excessive_password(password):
    with pytest.raises(ValueError):
        load('ensure_course_demo').seed_training_scenario(ScriptConnection(), password, date(2026, 11, 20))


@pytest.mark.parametrize('password', ['', 'synthetic-test-password'])
def test_course_demo_main_seeds_accounts_only_when_explicitly_configured(monkeypatch, password):
    module = load('ensure_course_demo')
    conn = ScriptConnection()
    conn.executemany = MagicMock()
    monkeypatch.setattr(module.psycopg, 'connect', connect_to(conn))
    monkeypatch.setenv('DATABASE_URL', 'postgresql://synthetic.invalid/db')
    monkeypatch.setenv('COURSE_DEMO_PASSWORD', password)
    seed = MagicMock()
    monkeypatch.setattr(module, 'seed_training_scenario', seed)
    module.main()
    assert seed.call_count == bool(password)
    assert conn.executemany.call_count == 1


@pytest.mark.parametrize('configured,has_driver,has_route', [(False, False, False), (True, True, True), (True, True, False)])
def test_database_diagnostic_only_prints_counts(monkeypatch, capsys, configured, has_driver, has_route):
    module = load('check_database')
    conn = ScriptConnection({'SELECT count': [{'n': 12}], 'SELECT 1 FROM parametros': [(1,)] if configured else []})
    monkeypatch.setattr(module, 'connection', connect_to(conn))
    portal = MagicMock()
    portal.users.return_value = {'total': 1}
    portal.map.return_value = {'orders': []}
    portal.report.return_value = {'series': []}
    portal.scope.return_value = {'pendingOrders': 2}
    portal.driver_route.return_value = {} if not has_route else {'route': 'private-address'}
    monkeypatch.setattr(module, 'PostgresPortal', lambda: portal)
    vehicles, drivers, dashboard = MagicMock(), MagicMock(), MagicMock()
    vehicles.find_all.return_value = []
    drivers.find_all.return_value = [SimpleNamespace(conductor_id='private-driver')] if has_driver else []
    dashboard.get_order_counts.return_value = SimpleNamespace(total=2)
    monkeypatch.setattr(module, 'PostgresVehicles', lambda: vehicles)
    monkeypatch.setattr(module, 'PostgresDrivers', lambda: drivers)
    monkeypatch.setattr(module, 'PostgresDashboard', lambda: dashboard)
    module.main()
    output = capsys.readouterr().out
    assert '12 tablas' in output and 'private' not in output
    assert portal.parameters.call_count == configured
    assert portal.driver_route.call_count == has_driver
