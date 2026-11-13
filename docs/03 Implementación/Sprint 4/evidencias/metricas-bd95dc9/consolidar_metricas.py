"""Consolidate original Lighthouse reports and fail on any rubric threshold."""
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from hashlib import sha256
from html import escape
from pathlib import Path
from statistics import median
import json
import math
import subprocess

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]
LIMITS = {'performance': ('>=', 90), 'fcp_ms': ('<=', 1000),
          'lcp_ms': ('<=', 1400), 'tbt_ms': ('<=', 85),
          'cls': ('<=', .02), 'transfer_bytes': ('<', 1100000)}
AUDITS = {'fcp_ms': 'first-contentful-paint', 'lcp_ms': 'largest-contentful-paint',
          'tbt_ms': 'total-blocking-time', 'cls': 'cumulative-layout-shift', 'transfer_bytes': 'total-byte-weight'}
SEGMENTS = {'data_centers': ('.055', '.012'), 'networks': ('.059', '.013'), 'user_devices': ('.080', '.081')}


def git(*args):
    return subprocess.check_output(['git', *args], cwd=ROOT, text=True).strip()


def number(value):
    if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(value):
        raise ValueError('Missing or invalid numeric measurement')
    return value


def compliant(key, value):
    operator, maximum = LIMITS[key]
    return value >= maximum if operator == '>=' else value < maximum if operator == '<' else value <= maximum


def environmental(byte_count):
    gb = Decimal(str(byte_count)) / Decimal(10**9)
    segments = {}
    for name, (operational, embodied) in SEGMENTS.items():
        op = gb * Decimal(operational)
        em = gb * Decimal(embodied)
        segments[name] = {'operational_kwh': str(op), 'embodied_equivalent_kwh': str(em),
                          'operational_gCO2e': str(op * 494), 'embodied_gCO2e': str(em * 494)}
    return {'operational_kwh': str(gb * Decimal('.194')), 'embodied_equivalent_kwh': str(gb * Decimal('.106')),
            'total_equivalent_kwh': str(gb * Decimal('.300')), 'total_gCO2e': str(gb * Decimal('.300') * 494),
            'segments': segments}


def main():
    settings, browser, version = None, None, None
    output = {'analysed_lima': datetime.now(timezone(timedelta(hours=-5))).isoformat(timespec='seconds'),
              'branch': git('branch', '--show-current'), 'baseline_build_commit': git('rev-parse', 'bd95dc9'),
              'implementation_commit': git('rev-parse', 'HEAD'), 'thresholds': LIMITS,
              'model': {'name': 'SWDM v4', 'source': 'https://sustainablewebdesign.org/estimating-digital-emissions/',
                        'grid_gCO2e_per_kwh': 494, 'GB_bytes': 10**9, 'new_visitor_ratio': 1,
                        'return_visitor_ratio': 0, 'cache_ratio': 0, 'green_hosting_ratio': 0,
                        'annual_visits_scenario': 10000, 'annual_visits_are_observed': False},
              'pages': {}, 'reports': [], 'all_after_runs_pass': True}
    for page in ('login', 'pedidos'):
        output['pages'][page] = {}
        for phase, prefix in (('before', 'verified-before'), ('after', 'final-after')):
            runs = []
            for run in range(1, 4):
                path = HERE / f'{prefix}-{page}-{run}.json'
                report = json.loads(path.read_text(encoding='utf-8-sig'))
                if report.get('runtimeError'):
                    raise ValueError(f'Runtime error: {path.name}')
                actual_settings = report['configSettings']
                actual_browser = report['environment']['hostUserAgent']
                if settings is None:
                    settings, browser, version = actual_settings, actual_browser, report['lighthouseVersion']
                if actual_settings != settings or actual_browser != browser or report['lighthouseVersion'] != version:
                    raise ValueError('Before/after measurement conditions differ')
                if settings['formFactor'] != 'mobile' or settings['throttlingMethod'] != 'simulate':
                    raise ValueError('Expected the original simulated mobile profile')
                network = report['audits']['network-requests']['details']['items']
                if any(item.get('protocol') != 'h2' for item in network if item['url'].startswith('https://')):
                    raise ValueError('Expected actual HTTP/2 transport')
                if page == 'pedidos' and not any('/api/pedidos?' in item['url'] and item['statusCode'] == 200 for item in network):
                    raise ValueError('Orders did not load successfully')
                metrics = {key: number(report['audits'][audit]['numericValue']) for key, audit in AUDITS.items()}
                metrics['performance'] = number(report['categories']['performance']['score']) * 100
                checks = {key: compliant(key, value) for key, value in metrics.items()}
                valid = all(checks.values())
                if phase == 'after' and not valid:
                    output['all_after_runs_pass'] = False
                output['reports'].append({'file': path.name, 'html': path.with_suffix('.html').name,
                                          'sha256': sha256(path.read_bytes()).hexdigest(), 'phase': phase, 'page': page,
                                          'fetch_time_utc': report['fetchTime'], 'metrics': metrics, 'checks': checks,
                                          'all_thresholds_pass': valid})
                runs.append(metrics)
            medians = {key: median(row[key] for row in runs) for key in LIMITS}
            output['pages'][page][phase] = {'median': medians, 'environmental': environmental(medians['transfer_bytes']),
                                          'range': {key: [min(row[key] for row in runs), max(row[key] for row in runs)] for key in LIMITS}}
        data = output['pages'][page]
        data['annual_scenario_saved_kgCO2e'] = str((Decimal(data['before']['environmental']['total_gCO2e']) - Decimal(data['after']['environmental']['total_gCO2e'])) * 10000 / 1000)
    output.update(lighthouse_version=version, browser=browser, settings=settings,
                  method='3 independent navigations per phase/page; identical mobile settings/browser/HTTP2; medians and every individual after-run checked')
    (HERE / 'auditoria-consolidada.json').write_text(json.dumps(output, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    parts = ['<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">',
             '<title>Auditoría consolidada — Sprint 4</title><style>body{font:16px system-ui;margin:2rem auto;padding:0 1rem;max-width:1100px;color:#1e2d3d;background:#f6f8fa}h1,h2{color:#0b4937}table{border-collapse:collapse;width:100%;margin:1rem 0;background:white}th,td{padding:.65rem;border:1px solid #d8dfe6;text-align:left}code{overflow-wrap:anywhere}.pass{color:#196c3f}.fail{color:#b3261e}a{color:#0b5aa8}@media print{body{background:white}}</style>',
             '<h1>Auditoría consolidada de métricas — Sprint 4</h1>',
             f'<p>Fecha: {escape(output["analysed_lima"])} · America/Lima</p>',
             f'<p>Rama: refactor/mern · Código: <code>{output["implementation_commit"]}</code></p>',
             f'<p>Base frontend: <code>{output["baseline_build_commit"]}</code></p>',
             '<p>Doce informes originales. Mismo navegador, perfil móvil simulado, límites de red/CPU, datos ficticios y HTTP/2 antes/después. TLS local autofirmado, exclusivamente en este banco de pruebas. Sin cambios al antivirus ni al almacén de certificados del sistema.</p>',
             f'<p><strong>Las seis corridas finales cumplen todos los umbrales: {"SÍ" if output["all_after_runs_pass"] else "NO"}.</strong></p>']
    for page, data in output['pages'].items():
        parts.append(f'<h2>{escape(page.title())}: medianas de tres corridas</h2><table><tr><th>Métrica</th><th>Antes</th><th>Después</th><th>Exigencia</th><th>Cumple después</th></tr>')
        for key, (operator, threshold) in LIMITS.items():
            before, after = data['before']['median'][key], data['after']['median'][key]
            parts.append(f'<tr><th>{key}</th><td>{before:.7g}</td><td>{after:.7g}</td><td>{escape(operator)} {threshold}</td><td class="{"pass" if compliant(key, after) else "fail"}">{"Sí" if compliant(key, after) else "No"}</td></tr>')
        parts.append('</table><p>SWDM v4: ' + escape(data['before']['environmental']['total_gCO2e']) + ' → ' + escape(data['after']['environmental']['total_gCO2e']) + ' g CO₂e/visita. Escenario de 10000 visitas/año: ' + escape(data['annual_scenario_saved_kgCO2e']) + ' kg CO₂e evitados estimados.</p>')
    parts.append('<h2>Reportes y dictamen por corrida</h2><table><tr><th>Reporte</th><th>Fecha UTC</th><th>FCP ms</th><th>LCP ms</th><th>CLS</th><th>Cumple todos</th></tr>')
    for report in output['reports']:
        m = report['metrics']
        parts.append(f'<tr><td><a href="{report["html"]}">{report["html"]}</a> · <a href="{report["file"]}">JSON</a></td><td>{escape(report["fetch_time_utc"])}</td><td>{m["fcp_ms"]:.3f}</td><td>{m["lcp_ms"]:.3f}</td><td>{m["cls"]:.8f}</td><td>{"Sí" if report["all_thresholds_pass"] else "No"}</td></tr>')
    parts.append('</table><h2>Supuestos y alcance</h2><p>El cálculo usa GB decimal, primera visita, hosting verde cero y 494 g CO₂e/kWh. Intensidades operativas: 0,055/0,059/0,080; incorporadas equivalentes: 0,012/0,013/0,081 kWh/GB. No se mide electricidad ni tráfico anual real. El JSON conserva el desglose y todas las condiciones.</p><p>Esta auditoría verifica métricas; no acredita por sí sola las ocho optimizaciones MERN literales ni certificación WCAG completa.</p><p><a href="auditoria-consolidada.json">Datos y huellas</a> · <a href="README.md">Índice y reproducción</a> · <a href="https://sustainablewebdesign.org/estimating-digital-emissions/">Modelo SWDM v4</a></p></html>')
    (HERE / 'auditoria-consolidada.html').write_text('\n'.join(parts), encoding='utf-8')
    print(json.dumps({'implementation_commit': output['implementation_commit'], 'all_six_after_runs_pass': output['all_after_runs_pass'],
                      'medians': {page: data['after']['median'] for page, data in output['pages'].items()}}, ensure_ascii=False))
    return 0 if output['all_after_runs_pass'] else 1


if __name__ == '__main__':
    raise SystemExit(main())
