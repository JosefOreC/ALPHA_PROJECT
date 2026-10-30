"""Contrato de exportación: paginación completa, ámbito correcto y fallos seguros."""
import importlib.util
import json
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
