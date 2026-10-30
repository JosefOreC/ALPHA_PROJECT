"""Exige 90 % de líneas y ramas, además del umbral combinado de coverage.py."""
import argparse
import json
from pathlib import Path


def check(report, minimum=90):
    totals = report['totals']
    metrics = {}
    for label, covered_key, total_key in (
        ('Líneas', 'covered_lines', 'num_statements'),
        ('Ramas', 'covered_branches', 'num_branches'),
    ):
        covered, total = totals[covered_key], totals[total_key]
        if not isinstance(total, int) or not isinstance(covered, int) or not 0 <= covered <= total or total == 0:
            raise ValueError('El informe debe incluir líneas y ramas medidas con contadores válidos.')
        metrics[label] = covered / total * 100
    return metrics, all(value >= minimum for value in metrics.values())


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('report', nargs='?', type=Path, default=Path('reports/coverage/backend.json'))
    args = parser.parse_args(argv)
    try:
        metrics, passed = check(json.loads(args.report.read_text(encoding='utf-8')))
    except (OSError, ValueError, KeyError, TypeError):
        print('Cobertura no verificable: genera un JSON de coverage.py con branch=True.')
        return 1
    for label, value in metrics.items():
        print(f'{label}: {value:.2f} % (mínimo 90 %)')
    return 0 if passed else 1


if __name__ == '__main__':
    raise SystemExit(main())
