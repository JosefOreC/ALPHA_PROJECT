"""Escenarios ficticios en Lima con el motor y proveedor vial de la operación.

No consulta repositorios ni persiste pedidos, vehículos o rutas.
"""
from datetime import datetime, timedelta, timezone
from time import monotonic



def simulate_routes(scenario, planner):
    started = monotonic()
    start = datetime(2000, 1, 1, 8, tzinfo=timezone(timedelta(hours=-5)))
    vehicles = [dict(
        placa=item['id'], nombre_completo=item['id'], tipo_combustible='DIESEL',
        capacidad_kg=item['capacity'], origin=(item['lat'], item['lng']),
    ) for item in scenario['vehicles']]
    orders = [dict(
        pedido_id=item['id'], cliente_nombre=item['id'], distrito='Lima · demostración',
        latitud=item['lat'], longitud=item['lng'], peso_kg=item['weight'],
        ventana_inicio=start + timedelta(minutes=item['fromMinute']),
        ventana_fin=start + timedelta(minutes=item['toMinute']),
    ) for item in scenario['orders']]
    result = planner(orders, vehicles, vehicles[0]['origin'], {'DIESEL': {'factor': 2.68, 'consumption': 0.1}},
                     {'co2Weight': 70, 'maxLoadPercent': 100, 'maxSeconds': 45}, scenario['settings'], start)
    result['elapsedSeconds'] = round(monotonic()-started, 3)
    result['simulation'] = True
    return result
