"""Configuración y relaciones del dataset; integración PostgreSQL optativa y explícita."""
import hashlib
import json
import os
import sys
from dataclasses import replace
from datetime import date
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT / 'scripts'))
from test_db.config import Settings, SetupError, load_settings
from test_db.dataset import TABLES, build_dataset
from test_db.database import prepare_database, connection_parameters


@pytest.fixture(scope='module')
def settings():
    return Settings('postgresql://seed_owner@127.0.0.1:55439/ecologistica_seed_test', 'ecologistica_seed_test',
                    'postgres', True, date(2026,10,9), 2, 40, 'Clave_Ficticia_Pruebas_2026!')


@pytest.fixture(scope='module')
def dataset(settings):
    return build_dataset(settings)


def env_file(tmp_path, **changes):
    values = {'DB_ENV': 'test', 'DATABASE_URL': 'postgresql://tester:secret@localhost:5432/seed_test',
              'SEED_DATE': '2026-10-09', 'SEED_PASSWORD': 'Clave_Ficticia_2026!'}
    values.update(changes)
    path = tmp_path / '.env'
    path.write_text('\n'.join(f'{key}={value}' for key,value in values.items()), encoding='utf-8-sig')
    return path


def test_env_file_decides_the_destination_even_with_conflicting_process_environment(tmp_path, monkeypatch):
    pytest.importorskip('dotenv')
    monkeypatch.setenv('DATABASE_URL', 'postgresql://other:secret@remote/production')
    loaded = load_settings(env_file(tmp_path))
    assert loaded.database_name == 'seed_test'
    assert loaded.days == 7
    assert 'secret' not in repr(loaded)
    assert loaded.password not in repr(loaded)


@pytest.mark.parametrize('changes', [
    {'DB_ENV': 'production'}, {'DATABASE_URL': 'sqlite:///test.db'},
    {'DATABASE_URL': 'postgresql://tester:secret@localhost/postgres'},
    {'DATABASE_URL': 'postgresql://tester:secret@localhost:invalid/seed_test'},
    {'DATABASE_URL': 'postgresql://tester:CHANGE_ME@localhost/seed_test'},
    {'DATABASE_URL': 'postgresql://tester:secret@localhost/seed_test?dbname=production'},
    {'SEED_DATE': '2026-02-30'}, {'SEED_DAYS': '0'}, {'SEED_DAYS': '32'},
    {'SEED_ORDERS_PER_DAY': '151'}, {'SEED_ORDERS_PER_DAY': '0'}, {'SEED_PASSWORD': 'short'},
    {'DB_CREATE_IF_MISSING': 'maybe'}, {'DATABASE_ADMIN_DB': 'seed_test'},
    {'SEED_DATE': '0001-01-01'},
])
def test_invalid_configuration_fails_without_echoing_credentials(tmp_path, changes):
    pytest.importorskip('dotenv')
    with pytest.raises(SetupError) as caught:
        load_settings(env_file(tmp_path, **changes))
    assert 'secret' not in str(caught.value)
    assert 'postgresql://' not in str(caught.value)


def test_all_modules_have_related_data_and_all_roles_are_present(dataset):
    assert set(dataset) == set(TABLES)
    assert all(dataset.values())
    assert len(dataset['usuarios']) == 20
    assert len(dataset['vehiculos']) == len(dataset['conductores']) == 15
    assert {row['rol'] for row in dataset['usuarios']} == {'ADMIN','OPERADOR','CONDUCTOR','RESPONSABLE_LOGISTICA','AUDITOR'}
    users = {row['usuario_id']: row for row in dataset['usuarios']}
    for driver in dataset['conductores']:
        assert users[driver['usuario_id']]['rol'] == 'CONDUCTOR'
        assert users[driver['usuario_id']]['estado'] == driver['estado']
    policy = json.loads((ROOT / 'src/shared/rbac.json').read_text(encoding='utf-8'))
    grants = {(row['rol'],row['permiso']): row['alcance'] for row in dataset['rol_permisos']}
    assert grants == {(policy['roles'][role]['backend'],permission): scope for permission,roles in policy['permissions'].items() for role,scope in roles.items()}


def test_delivery_assignment_geometry_and_report_totals_reconcile(dataset):
    orders = {row['pedido_id']: row for row in dataset['pedidos']}
    routes = {row['ruta_id']: row for row in dataset['rutas']}
    assert {order['estado'] for order in orders.values()} == {'PENDIENTE','EN_CAMINO','ENTREGADO','CANCELADO'}
    for link in dataset['ruta_pedido']:
        assert orders[link['pedido_id']]['conductor_id'] == routes[link['ruta_id']]['conductor_id']
    assert len({row['pedido_id'] for row in dataset['ruta_pedido']}) == len(dataset['ruta_pedido'])
    for delivery in dataset['entregas']:
        order = orders[delivery['pedido_id']]
        assert delivery['conductor_id'] == order['conductor_id']
        assert delivery['confirmada_en'] == order['confirmed_at']
        assert order['estado'] == 'ENTREGADO'
    for route in routes.values():
        legs = [leg for leg in dataset['tramos'] if leg['ruta_id'] == route['ruta_id']]
        assert sum(leg['distancia_km'] for leg in legs) == route['distancia_total_km']
        assert sum(leg['co2_estimado_kg'] for leg in legs) == route['co2_estimado_kg']
        assert route['geometria']['coordinates'][0] == route['geometria']['coordinates'][-1]
    for report in dataset['reportes']:
        related = [routes[link['ruta_id']] for link in dataset['ruta_reporte'] if link['reporte_id'] == report['reporte_id']]
        assert sum(route['co2_estimado_kg'] for route in related) == report['co2_total_kg']
        assert sum(route['distancia_total_km'] for route in related) == report['distancia_total_km']


def test_passwords_are_salted_hashes_and_never_stored_in_plaintext(settings, dataset):
    hashes = [row['password_hash'] for row in dataset['usuarios']]
    assert len(set(hashes)) == len(hashes)
    for value in hashes:
        assert settings.password not in value
    kind, iterations, salt, digest = hashes[0].split('$')
    assert kind == 'pbkdf2_sha256'
    assert hashlib.pbkdf2_hmac('sha256', settings.password.encode(), salt.encode(), int(iterations)).hex() == digest


def test_cli_missing_file_returns_a_clear_error_without_a_traceback(tmp_path, capsys):
    import create_test_db
    pytest.importorskip('dotenv')
    assert create_test_db.main(['--env-file', str(tmp_path/'missing.env')]) == 1
    assert 'No existe el archivo .env' in capsys.readouterr().err


@pytest.fixture(scope='module')
def postgres_database():
    path = os.environ.get('ECOLOGISTICA_TEST_ENV_FILE')
    if not path:
        pytest.skip('Configurar ECOLOGISTICA_TEST_ENV_FILE para integración PostgreSQL + PostGIS explícita.')
    pytest.importorskip('psycopg')
    config = load_settings(Path(path))
    rows = build_dataset(config)
    counts = prepare_database(config, rows)
    return config, rows, counts


def test_postgres_repeated_load_is_idempotent_and_spatial_data_is_valid(postgres_database):
    import psycopg
    config, rows, initial = postgres_database
    assert prepare_database(config, rows) == initial == {table: len(records) for table, records in rows.items()}
    with psycopg.connect(**connection_parameters(config)) as connection:
        assert connection.execute('SELECT bool_and(ST_IsValid(geometria) AND ST_SRID(geometria)=4326) FROM zonas_restringidas').fetchone()[0]
        assert connection.execute('SELECT bool_and(ST_IsValid(geometria) AND ST_SRID(geometria)=4326) FROM rutas').fetchone()[0]
        assert connection.execute("SELECT count(*) FROM pedidos WHERE (estado='ENTREGADO') <> (confirmed_at IS NOT NULL)").fetchone()[0] == 0


def test_postgres_adapter_reads_the_seed_and_rolls_back_durable_changes(postgres_database):
    import psycopg
    from infrastructure.persistence.postgres_orders import postgres_repository
    config, rows, _ = postgres_database
    pending = next(row for row in rows['pedidos'] if row['estado'] == 'PENDIENTE' and row['conductor_id'] is None)
    repo = postgres_repository(config.database_url)
    original = repo.get(pending['pedido_id'])
    assert original.customer == pending['cliente_nombre']
    assert original.driver_id is None
    with pytest.raises(RuntimeError):
        with repo.transaction():
            repo.save(replace(original, customer='Cambio que debe deshacerse', version=original.version+1))
            raise RuntimeError('Rollback de prueba')
    assert postgres_repository(config.database_url).get(original.id) == original
    with psycopg.connect(**connection_parameters(config)) as connection:
        with pytest.raises(psycopg.errors.CheckViolation):
            with connection.transaction():
                connection.execute('UPDATE pedidos SET ventana_fin=ventana_inicio WHERE pedido_id=%s', (original.id,))


def test_postgres_failed_reset_rolls_back_every_table_and_config_changes_require_reset(postgres_database):
    import psycopg
    config, rows, initial = postgres_database
    invalid = {**rows, 'pedidos': [{**row, 'peso_kg': -1} if i == 0 else row for i,row in enumerate(rows['pedidos'])]}
    with pytest.raises(psycopg.errors.CheckViolation):
        prepare_database(config, invalid, reset=True)
    assert prepare_database(config, rows) == initial
    with pytest.raises(SetupError, match='Cambió la configuración'):
        prepare_database(replace(config, days=config.days+1), rows)
    assert prepare_database(config, rows, reset=True) == initial


def test_postgres_refuses_existing_foreign_tables_even_when_reset_is_requested(postgres_database):
    import psycopg
    config, rows, _ = postgres_database
    with psycopg.connect(**connection_parameters(config), autocommit=True) as connection:
        connection.execute('CREATE TABLE foreign_test_table (id integer PRIMARY KEY)')
        connection.execute('INSERT INTO foreign_test_table VALUES (123)')
        try:
            with pytest.raises(SetupError, match='tablas ajenas'):
                prepare_database(config, rows, reset=True)
            assert connection.execute('SELECT id FROM foreign_test_table').fetchone()[0] == 123
        finally:
            connection.execute('DROP TABLE foreign_test_table')
