"""Simulación aislada: adapta un plano sintético al mismo motor que usa la operación.

No consulta repositorios, no persiste datos y no utiliza servicios de mapas.
X e Y son kilómetros en un plano; no son coordenadas geográficas.
"""
from datetime import datetime, timedelta, timezone
from math import hypot
from time import monotonic

from domain.planning import propose
from domain.road_network import RoadNetwork


def simulate_routes(scenario):
    started = monotonic()
    start = datetime(2000, 1, 1, 8, tzinfo=timezone(timedelta(hours=-5)))
    vehicles = [dict(
        placa=item['id'], nombre_completo=item['id'], tipo_combustible='DIESEL',
        capacidad_kg=item['capacity'], origin=(item['y'], item['x']),
    ) for item in scenario['vehicles']]
    orders = [dict(
        pedido_id=item['id'], cliente_nombre=item['id'], distrito='Plano de prueba',
        latitud=item['y'], longitud=item['x'], peso_kg=item['weight'],
        ventana_inicio=start + timedelta(minutes=item['fromMinute']),
        ventana_fin=start + timedelta(minutes=item['toMinute']),
    ) for item in scenario['orders']]
    points = {(0, 0), *(vehicle['origin'] for vehicle in vehicles),
              *((order['latitud'], order['longitud']) for order in orders)}
    speed = scenario['speedKmh']
    roads = RoadNetwork({(a, b): (hypot(a[0]-b[0], a[1]-b[1]), hypot(a[0]-b[0], a[1]-b[1])/speed*60)
                         for a in points for b in points})
    result = propose(orders, vehicles, (0, 0), {'DIESEL': {'factor': 2.68, 'consumption': 0.1}},
                     {'co2Weight': 70, 'maxLoadPercent': 100}, scenario['settings'], start, roads)
    for route in result['routes']:
        route['points'] = [{'x': point['lng'], 'y': point['lat']} for point in route.pop('waypoints')]
    result['elapsedSeconds'] = round(monotonic()-started, 3)
    result['simulation'] = True
    return result
