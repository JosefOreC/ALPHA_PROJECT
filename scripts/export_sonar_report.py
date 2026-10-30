"""Exportación de solo lectura de SonarCloud; token exclusivamente por entorno."""
import json
import os
import sys
from datetime import datetime, timezone
from http.client import HTTPSConnection, HTTPException
from pathlib import Path
from urllib.parse import urlencode

HOST = 'https://sonarcloud.io'
METRICS = 'bugs,vulnerabilities,security_hotspots,code_smells,coverage,duplicated_lines_density,ncloc'


class SonarError(Exception):
    pass


class SonarClient:
    def __init__(self, token):
        self.token = token

    def get(self, endpoint, **params):
        connection = HTTPSConnection('sonarcloud.io', timeout=30)
        try:
            connection.request('GET', f'/api/{endpoint}?{urlencode(params)}',
                               headers={'Authorization': f'Bearer {self.token}'})
            response = connection.getresponse()
            if response.status != 200:
                raise SonarError(f'{endpoint}: HTTP {response.status}; revisar permisos y parámetros.')
            return json.load(response)
        except (OSError, HTTPException, ValueError):
            raise SonarError(f'{endpoint}: respuesta inválida o servicio no disponible.') from None
        finally:
            connection.close()

    def collect(self, endpoint, field, **params):
        items = []
        page = 1
        while True:
            data = self.get(endpoint, **params, p=page, ps=100)
            batch = data[field]
            items.extend(batch)
            total = data.get('paging', {}).get('total', data.get('total'))
            if total is None:
                raise SonarError(f'{endpoint}: falta el total de paginación; no se puede garantizar una exportación completa.')
            if len(items) >= total:
                return items
            if not batch or page >= 100:
                raise SonarError(f'{endpoint}: exportación incompleta; dividir la consulta en SonarCloud.')
            page += 1


def scope(branch='', pull_request=''):
    if pull_request:
        return {'pullRequest': pull_request}
    return {'branch': branch} if branch else {}


def export(client, project, selector, task_id=None):
    task = client.get('ce/task', id=task_id)['task'] if task_id else None
    if task and (task.get('status') != 'SUCCESS' or task.get('componentKey') != project or not task.get('analysisId')):
        raise SonarError('La tarea no completó el análisis del proyecto; no exportar resultados anteriores.')
    measures = client.get('measures/component', component=project, metricKeys=METRICS, **selector)
    gate_params = {'analysisId': task['analysisId']} if task else {'projectKey': project, **selector}
    gate = client.get('qualitygates/project_status', **gate_params)
    issues = client.collect('issues/search', 'issues', componentKeys=project, **selector)
    schema = client.get('webservices/list')
    hotspot_params = next(({param['key'] for param in action.get('params', [])}
                          for service in schema.get('webServices', []) if service['path'] == 'api/hotspots'
                          for action in service['actions'] if action['key'] == 'search'), set())
    # Do not assume an undocumented branch/PR parameter will be honored.
    can_scope_hotspots = 'projectKey' in hotspot_params and set(selector).issubset(hotspot_params)
    hotspots = None
    if can_scope_hotspots:
        by_key = {}
        for status in ('TO_REVIEW', 'REVIEWED'):
            for hotspot in client.collect('hotspots/search', 'hotspots', projectKey=project, status=status, **selector):
                by_key[hotspot['key']] = hotspot
        hotspots = list(by_key.values())
    return {'exported_at_utc': datetime.now(timezone.utc).isoformat(),
            'project_key': project, 'scope': selector,
            'workflow_commit': os.getenv('GITHUB_SHA'),
            'analysis_task': task,
            'dashboard': f'{HOST}/dashboard?{urlencode({"id": project, **selector})}',
            'notice': 'Consulta del estado actual, no snapshot atómico. Confirmar el commit del análisis en SonarCloud. No certifica cumplimiento OWASP.',
            'measures': measures, 'quality_gate': gate, 'issues': issues, 'hotspots': hotspots,
            'hotspots_export_status': 'exportados' if can_scope_hotspots else 'No exportados: la API no anuncia soporte para este ámbito. Revisar en el dashboard; no interpretar como cero hotspots.'}


def write_report(data, destination):
    destination.mkdir(parents=True, exist_ok=True)
    (destination / 'sonar-results.json').write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')
    lines = ['# Informe SonarCloud', '', f'- Proyecto: `{data["project_key"]}`',
             f'- Exportado (UTC): {data["exported_at_utc"]}',
             f'- Ámbito: `{json.dumps(data["scope"])}`',
             f'- [Dashboard]({data["dashboard"]})',
             f'- Quality Gate: **{data["quality_gate"]["projectStatus"]["status"]}**',
             f'- Incidencias exportadas (incluye resueltas): {len(data["issues"])}',
             f'- Security Hotspots: {len(data["hotspots"]) if data["hotspots"] is not None else "pendientes de revisión en dashboard"}',
             data['hotspots_export_status'], '',
             data['notice'], '', '| Métrica | Valor |', '|---|---|']
    for metric in data['measures']['component'].get('measures', []):
        lines.append(f'| {metric["metric"]} | {metric.get("value", "sin valor")} |')
    lines.extend(['', 'El detalle y los identificadores originales están en `sonar-results.json`.',
                  'Relacionar reglas y CWE con OWASP 2025 y completar la revisión manual según la guía del repositorio.'])
    (destination / 'sonar-report.md').write_text('\n'.join(lines) + '\n', encoding='utf-8')


def main():
    token, project = os.getenv('SONAR_TOKEN'), os.getenv('SONAR_PROJECT_KEY')
    if not token or not project:
        print('Faltan SONAR_TOKEN y/o SONAR_PROJECT_KEY en el entorno.', file=sys.stderr)
        return 1
    try:
        task_file = Path('.scannerwork/report-task.txt')
        task_info = dict(line.split('=', 1) for line in task_file.read_text(encoding='utf-8').splitlines() if '=' in line) if task_file.exists() else {}
        data = export(SonarClient(token), project,
                      scope(os.getenv('SONAR_BRANCH', ''), os.getenv('SONAR_PULL_REQUEST', '')),
                      task_info.get('ceTaskId'))
        write_report(data, Path('reports/sonar'))
    except (SonarError, OSError, KeyError, TypeError) as error:
        # No imprimir URLs autenticadas, cabeceras ni cuerpos de respuesta.
        detail = str(error) if isinstance(error, SonarError) else type(error).__name__
        print(f'No se pudo exportar el informe SonarCloud: {detail}', file=sys.stderr)
        return 1
    print('Informe exportado en reports/sonar/sonar-report.md y sonar-results.json.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
