"""Regenera geometrías viales demo; el producto no llama a OSRM en ejecución."""
import json
from pathlib import Path
from urllib.request import urlopen

DEPOT = (-76.948, -12.038)
POINTS = [
    [DEPOT, (-76.993, -12.0), (-77.005, -11.988), (-77.012, -11.976)],
    [DEPOT, (-77.0, -12.042), (-77.01, -12.048)],
    [DEPOT, (-76.965, -12.045)],
    [DEPOT, (-76.91, -12.03), (-76.9, -12.026), (-76.89, -12.035)],
]


def main():
    fixtures = []
    for points in POINTS:
        coordinates = ';'.join(f'{lng},{lat}' for lng, lat in points)
        url = ('https://router.project-osrm.org/route/v1/driving/' + coordinates
               + '?overview=full&geometries=geojson&steps=false')
        with urlopen(url, timeout=25) as response:
            result = json.load(response)
        if result['code'] != 'Ok':
            raise RuntimeError(result['code'])
        path = [[lat, lng] for lng, lat in result['routes'][0]['geometry']['coordinates']]
        stops = [[w['location'][1], w['location'][0]] for w in result['waypoints']]
        done = min(range(len(path)), key=lambda i: sum((path[i][j] - stops[1][j]) ** 2 for j in (0, 1))) if len(stops) > 2 else 0
        fixtures.append({'path': path, 'stops': stops, 'done': done})
        print(f'Ruta {len(fixtures)}: {len(path)} puntos viales', flush=True)
    target = Path(__file__).resolve().parents[1] / 'src/infrastructure/limaRoadFixtures.ts'
    target.write_text(
        '// Geometrías demo OSRM / OpenStreetMap (ODbL). Regenerar con scripts/generate-map-fixtures.py.\n'
        '// Coordenadas [latitud, longitud]; no son rutas optimizadas ni restricciones operativas validadas.\n'
        'export const ROAD_FIXTURES = ' + json.dumps(fixtures, separators=(',', ':')) + '\n',
        encoding='utf-8',
    )


if __name__ == '__main__':
    main()
