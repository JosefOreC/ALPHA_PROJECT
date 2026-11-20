"""Calculate SUS scores from complete, anonymous questionnaire responses."""
import argparse
import csv
import json
from pathlib import Path
from statistics import mean

ITEMS = [f'q{index}' for index in range(1, 11)]


def score_responses(path):
    results = []
    seen = set()
    with path.open(encoding='utf-8-sig', newline='') as source:
        rows = csv.DictReader(source)
        if rows.fieldnames != ['id', 'perfil', *ITEMS]:
            raise ValueError('El encabezado debe ser id,perfil,q1,q2,q3,q4,q5,q6,q7,q8,q9,q10.')
        for line, row in enumerate(rows, start=2):
            identifier = (row['id'] or '').strip()
            profile = (row['perfil'] or '').strip()
            if not identifier or identifier in seen or not profile or None in row:
                raise ValueError(f'Fila {line}: requiere identificador anónimo único y perfil.')
            try:
                values = [int(row[item]) for item in ITEMS]
            except (TypeError, ValueError):
                raise ValueError(f'Fila {line}: responde los diez ítems con enteros del 1 al 5.') from None
            if not all(1 <= value <= 5 for value in values):
                raise ValueError(f'Fila {line}: las respuestas deben estar entre 1 y 5.')
            seen.add(identifier)
            odd = sum(value - 1 for value in values[::2])
            even = sum(5 - value for value in values[1::2])
            results.append({'id': identifier, 'perfil': profile, 'respuestas': values,
                            'impares': odd, 'pares': even, 'sus': (odd + even) * 2.5})
    if not results:
        raise ValueError('El archivo no contiene respuestas.')
    average = mean(result['sus'] for result in results)
    return {'n': len(results), 'promedio_sus': average, 'alcanza_68': average >= 68,
            'participantes': results}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('respuestas', type=Path)
    args = parser.parse_args()
    try:
        print(json.dumps(score_responses(args.respuestas), ensure_ascii=False, indent=2))
    except (OSError, ValueError) as error:
        parser.exit(2, f'{error}\n')


if __name__ == '__main__':
    main()
