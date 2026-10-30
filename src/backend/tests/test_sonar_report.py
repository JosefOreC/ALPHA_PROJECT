"""Contrato de exportación: paginación completa, ámbito correcto y fallos seguros."""
import importlib.util
import json
import io
from pathlib import Path

import pytest

spec = importlib.util.spec_from_file_location('sonar_report', Path(__file__).resolve().parents[3] / 'scripts/export_sonar_report.py')
sonar = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sonar)


def test_pull_request_scope_takes_precedence_over_branch():
    assert sonar.scope('feature/owasp', '42') == {'pullRequest': '42'}
    assert sonar.scope('main') == {'branch': 'main'}
    assert sonar.scope() == {}


def test_pagination_collects_all_pages(monkeypatch):
    client = sonar.SonarClient('test-token')
    calls = []

    def get(endpoint, **params):
        calls.append(params)
        return {'issues': [params['p']], 'paging': {'total': 2}}

    monkeypatch.setattr(client, 'get', get)
    assert client.collect('issues/search', 'issues', componentKeys='project', branch='main') == [1, 2]
    assert all(call['branch'] == 'main' for call in calls)


@pytest.mark.parametrize('response', [{'issues': [], 'paging': {'total': 1}}, {'issues': []}])
def test_incomplete_pagination_is_an_error(monkeypatch, response):
    client = sonar.SonarClient('test-token')
    monkeypatch.setattr(client, 'get', lambda *args, **kwargs: response)
    with pytest.raises(sonar.SonarError):
        client.collect('issues/search', 'issues')


def test_authentication_failure_does_not_expose_token_or_response(monkeypatch):
    class Denied:
        status = 403

        def __init__(self, host, timeout):
            assert host == 'sonarcloud.io'

        def request(self, method, path, headers):
            assert headers['Authorization'] == 'Bearer test-token'
            assert path.startswith('/api/issues/search?')

        def getresponse(self):
            return self

        def close(self):
            pass

    monkeypatch.setattr(sonar, 'HTTPSConnection', Denied)
    with pytest.raises(sonar.SonarError) as caught:
        sonar.SonarClient('test-token').get('issues/search', componentKeys='project')
    assert '403' in str(caught.value)
    assert 'test-token' not in str(caught.value)
    assert 'private response' not in str(caught.value)


@pytest.mark.parametrize('status', ['PENDING', 'FAILED'])
def test_export_rejects_unfinished_analysis_before_querying_old_results(status):
    class Client:
        def get(self, endpoint, **params):
            assert endpoint == 'ce/task'
            return {'task': {'status': status, 'componentKey': 'project'}}

    with pytest.raises(sonar.SonarError):
        sonar.export(Client(), 'project', {}, 'task-id')


def test_export_uses_exact_analysis_gate_and_writes_original_issue_ids(tmp_path):
    class Client:
        def get(self, endpoint, **params):
            if endpoint == 'ce/task':
                return {'task': {'status': 'SUCCESS', 'componentKey': 'project', 'analysisId': 'analysis-1'}}
            if endpoint == 'measures/component':
                assert params['branch'] == 'main'
                return {'component': {'measures': [{'metric': 'coverage', 'value': '81.95'}]}}
            if endpoint == 'webservices/list':
                return {'webServices': [{'path': 'api/hotspots', 'actions': [
                    {'key': 'search', 'params': [{'key': 'projectKey'}, {'key': 'branch'}]}]}]}
            assert params == {'analysisId': 'analysis-1'}
            return {'projectStatus': {'status': 'ERROR'}}

        def collect(self, endpoint, field, **params):
            assert params['branch'] == 'main'
            return [{'key': f'{field}-original-id'}]

    report = sonar.export(Client(), 'project', {'branch': 'main'}, 'task-id')
    sonar.write_report(report, tmp_path)
    saved = json.loads((tmp_path / 'sonar-results.json').read_text(encoding='utf-8'))
    assert saved['issues'][0]['key'] == 'issues-original-id'
    assert '**ERROR**' in (tmp_path / 'sonar-report.md').read_text(encoding='utf-8')


def test_unsupported_hotspot_scope_is_reported_as_missing_not_zero(tmp_path):
    class Client:
        def get(self, endpoint, **params):
            if endpoint == 'webservices/list':
                return {'webServices': [{'path': 'api/hotspots', 'actions': [
                    {'key': 'search', 'params': [{'key': 'projectKey'}]}]}]}
            if endpoint == 'measures/component':
                return {'component': {'measures': []}}
            return {'projectStatus': {'status': 'OK'}}

        def collect(self, endpoint, field, **params):
            assert endpoint == 'issues/search'
            return []

    report = sonar.export(Client(), 'project', {'pullRequest': '42'})
    assert report['hotspots'] is None
    sonar.write_report(report, tmp_path)
    assert 'pendientes de revisión' in (tmp_path / 'sonar-report.md').read_text(encoding='utf-8')


def test_cli_rejects_missing_credentials_without_network(monkeypatch, capsys):
    monkeypatch.delenv('SONAR_TOKEN', raising=False)
    monkeypatch.delenv('SONAR_PROJECT_KEY', raising=False)
    assert sonar.main() == 1
    assert 'Faltan' in capsys.readouterr().err


def test_public_client_does_not_send_an_empty_authorization_header(monkeypatch):
    class PublicConnection:
        def __init__(self, host, timeout):
            assert host == 'sonarcloud.io'

        def request(self, method, path, headers):
            assert 'Authorization' not in headers

        def getresponse(self):
            response = io.BytesIO(b'{"component": {"key": "public"}}')
            response.status = 200
            return response

        def close(self):
            pass

    monkeypatch.setattr(sonar, 'HTTPSConnection', PublicConnection)
    assert sonar.SonarClient().get('components/show', component='public')['component']['key'] == 'public'


@pytest.mark.parametrize('pull_request', [False, True])
def test_describe_records_organization_and_revision_without_reusing_main_for_pr(pull_request):
    class Client:
        def get(self, endpoint, **params):
            if endpoint == 'components/show':
                return {'component': {'organization': 'org', 'visibility': 'public'}}
            assert not pull_request
            if endpoint == 'project_branches/list':
                return {'branches': [{'name': 'main', 'isMain': True}]}
            assert endpoint == 'project_analyses/search'
            return {'analyses': [{'key': 'analysis-1', 'revision': 'commit-1'}]}

    selector = {'pullRequest': '42'} if pull_request else {'branch': 'main'}
    result = sonar.describe(Client(), 'project', selector)
    assert result['organization'] == 'org'
    if pull_request:
        assert 'analysis' not in result
    else:
        assert result['analysis']['revision'] == 'commit-1' and result['is_main_branch']


def test_describe_rejects_a_branch_without_analyses():
    class Client:
        def get(self, endpoint, **params):
            return {'component': {'organization': 'org'}, 'branches': [], 'analyses': []}

    with pytest.raises(sonar.SonarError, match='No existe'):
        sonar.describe(Client(), 'project', {'branch': 'unknown'})


def test_verified_main_branch_can_export_all_hotspot_statuses_without_branch_parameter():
    class Client:
        def get(self, endpoint, **params):
            if endpoint == 'measures/component':
                return {'component': {'measures': []}}
            if endpoint == 'webservices/list':
                return {'webServices': [{'path': 'api/hotspots', 'actions': [
                    {'key': 'search', 'params': [{'key': 'projectKey'}, {'key': 'status'}]}]}]}
            assert params == {'analysisId': 'analysis-1'}
            return {'projectStatus': {'status': 'OK'}}

        def collect(self, endpoint, field, **params):
            if endpoint == 'issues/search':
                return []
            assert 'branch' not in params
            assert params['status'] in ('TO_REVIEW', 'REVIEWED')
            return [{'key': params['status']}]

    data = sonar.export(Client(), 'project', {'branch': 'main'}, snapshot={'is_main_branch': True, 'analysis': {'key': 'analysis-1'}})
    assert {hotspot['key'] for hotspot in data['hotspots']} == {'TO_REVIEW', 'REVIEWED'}


def test_task_must_match_the_snapshot_analysis():
    class Client:
        def get(self, endpoint, **params):
            return {'task': {'status': 'SUCCESS', 'componentKey': 'project', 'analysisId': 'old'}}

    with pytest.raises(sonar.SonarError, match='no coinciden'):
        sonar.export(Client(), 'project', {}, 'task-id', {'analysis': {'key': 'new'}})


@pytest.mark.parametrize('changed', [False, True])
def test_cli_exports_public_project_and_rejects_an_analysis_changed_during_export(monkeypatch, tmp_path, changed):
    monkeypatch.chdir(tmp_path)
    monkeypatch.setenv('SONAR_PROJECT_KEY', 'project')
    monkeypatch.delenv('SONAR_TOKEN', raising=False)
    snapshots = iter([{'analysis': {'key': 'one'}}, {'analysis': {'key': 'two' if changed else 'one'}}])
    monkeypatch.setattr(sonar, 'describe', lambda *args: next(snapshots))
    monkeypatch.setattr(sonar, 'export', lambda *args: {'project_key': 'project'})
    writes = []
    monkeypatch.setattr(sonar, 'write_report', lambda *args: writes.append(args))
    assert sonar.main() == (1 if changed else 0)
    assert len(writes) == (0 if changed else 1)


def test_remote_fields_are_content_and_cannot_choose_output_filenames(tmp_path):
    destination = tmp_path / 'output'
    report = {
        'project_key': '../../outside', 'exported_at_utc': '2026-10-30', 'scope': {'branch': '../outside'},
        'dashboard': 'https://sonarcloud.io/', 'quality_gate': {'projectStatus': {'status': 'ERROR'}},
        'issues': [{'key': '../malicious', 'component': '../../outside', 'rule': '../rule'}],
        'hotspots': [], 'hotspots_export_status': 'exportados', 'notice': 'test',
        'measures': {'component': {'measures': [{'metric': '../../outside', 'value': '../value'}]}},
    }
    sonar.write_report(report, destination)
    assert sorted(path.name for path in destination.iterdir()) == ['sonar-report.md', 'sonar-results.json']
    assert sorted(path.name for path in tmp_path.iterdir()) == ['output']
    assert json.loads((destination / 'sonar-results.json').read_text(encoding='utf-8')) == report
