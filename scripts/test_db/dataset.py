"""Datos ficticios relacionados, con UUID estables y métricas sintéticas conciliadas."""
import hashlib
import json
import math
import random
import secrets
from datetime import datetime, time, timedelta
from decimal import Decimal
from pathlib import Path
from uuid import UUID, uuid5
from zoneinfo import ZoneInfo

from .config import Settings

ROOT = Path(__file__).resolve().parents[2]
NAMESPACE = UUID('f0a5aab3-cddf-5c94-aacf-923b4d55cc91')
LIMA = ZoneInfo('America/Lima')
DEPOT = (-12.055, -76.963)
DISTRICTS = [
    ('San Juan de Lurigancho', -12.015, -76.995),
    ('El Agustino', -12.050, -77.000),
    ('Santa Anita', -12.045, -76.970),
    ('Ate', -12.035, -76.940),
]
# Valores exclusivamente sintéticos para probar todas las unidades; no factores oficiales.
FUELS = {
    'DIESEL': (Decimal('2.680'), 'L', Decimal('0.09')),
    'GASOLINA': (Decimal('2.310'), 'L', Decimal('0.10')),
    'GNV': (Decimal('1.900'), 'm3', Decimal('0.08')),
    'GLP': (Decimal('1.500'), 'L', Decimal('0.11')),
    'ELECTRICO': (Decimal('0.100'), 'kWh', Decimal('0.20')),
    'HIBRIDO': (Decimal('2.310'), 'L', Decimal('0.06')),
}
TABLES = (
    'roles', 'permisos', 'rol_permisos', 'usuarios', 'vehiculos', 'conductores', 'almacenes',
    'pedidos', 'rutas', 'ruta_pedido', 'tramos', 'entregas', 'incidencias', 'reoptimizaciones',
    'posiciones_vehiculos', 'zonas_restringidas', 'reportes', 'ruta_reporte',
    'parametros_algoritmo', 'factores_emision', 'integraciones', 'auditoria',
)


def identifier(kind: str, key) -> str:
    return str(uuid5(NAMESPACE, f'{kind}:{key}'))


def money(value) -> Decimal:
    return Decimal(str(value)).quantize(Decimal('0.01'))


def password_hash(password: str) -> str:
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 600_000).hex()
    return f'pbkdf2_sha256$600000${salt}${digest}'


def distance(origin, target) -> Decimal:
    lat1, lon1, lat2, lon2 = map(math.radians, (*origin, *target))
    a = math.sin((lat2-lat1)/2)**2 + math.cos(lat1)*math.cos(lat2)*math.sin((lon2-lon1)/2)**2
    return money(6371 * 2 * math.asin(math.sqrt(min(a, 1))))


def geometry(kind, points):
    return {'type': kind, 'coordinates': points}


def build_dataset(settings: Settings) -> dict[str, list[dict]]:
    data = {table: [] for table in TABLES}
    rng = random.Random(42)
    policy = json.loads((ROOT / 'src/shared/rbac.json').read_text(encoding='utf-8'))
    start_date = settings.seed_date - timedelta(days=settings.days-1)
    start = datetime.combine(start_date, time(7), LIMA)
    snapshot = datetime.combine(settings.seed_date, time(13), LIMA)
    users = {}

    for role, metadata in policy['roles'].items():
        data['roles'].append({'rol': metadata['backend'], 'codigo': metadata['code'], 'nombre': metadata['label'], 'descripcion': metadata['description']})
    for permission, grants in policy['permissions'].items():
        data['permisos'].append({'permiso': permission})
        for role, scope in grants.items():
            data['rol_permisos'].append({'rol': policy['roles'][role]['backend'], 'permiso': permission, 'alcance': scope})

    def user(key, role, name, active=True):
        value = {'usuario_id': identifier('user', key), 'nombre': name, 'email': f'{key}@example.invalid',
                 'password_hash': password_hash(settings.password), 'rol': policy['roles'][role]['backend'],
                 'estado': 'ACTIVO' if active else 'INACTIVO', 'ultimo_acceso': snapshot if active else start,
                 'creado_en': start}
        data['usuarios'].append(value)
        users[key] = value['usuario_id']
        return value['usuario_id']

    user('admin', 'admin', 'Administrador de pruebas')
    user('operador', 'planner', 'Operador de pruebas')
    user('operador2', 'planner', 'Segundo operador de pruebas')
    user('logistica', 'logistics', 'Responsable de logística de pruebas')
    user('auditor', 'auditor', 'Auditor externo de pruebas')
    drivers, vehicles = [], []
    for index in range(15):
        driver_name = f'Conductor ficticio {index+1:02}'
        user_id = user(f'conductor{index+1:02}', 'driver', driver_name, index < 13)
        vehicle_id, driver_id = identifier('vehicle', index), identifier('driver', index)
        vehicles.append(vehicle_id)
        drivers.append(driver_id)
        state = 'EN_RUTA' if 3 <= index <= 6 else 'MANTENIMIENTO' if index in (10,11) else 'INACTIVO' if index >= 13 else 'DISPONIBLE'
        data['vehiculos'].append({'vehiculo_id': vehicle_id, 'placa': f'TST-{index+1:03}', 'capacidad_kg': money(800+index*50),
                                 'capacidad_m3': money(5+index/10), 'tipo_combustible': list(FUELS)[index % len(FUELS)], 'estado': state, 'creado_en': start})
        data['conductores'].append({'conductor_id': driver_id, 'usuario_id': user_id, 'vehiculo_id': vehicle_id,
                                   'nombre_completo': driver_name, 'dni': f'9900{index+1:04}', 'licencia': f'TEST-LIC-{index+1:03}',
                                   'telefono': None, 'estado': 'ACTIVO' if index < 13 else 'INACTIVO', 'creado_en': start})
    depot_id = identifier('depot', 1)
    data['almacenes'].append({'almacen_id': depot_id, 'nombre': 'Almacén ficticio de Lima Este', 'direccion': 'Dirección sintética de almacén · Santa Anita', 'latitud': DEPOT[0], 'longitud': DEPOT[1]})

    def audit(key, actor, action, entity, entity_id, when):
        data['auditoria'].append({'evento_id': identifier('audit', key), 'usuario_id': actor, 'accion': action,
                                 'entidad': entity, 'entidad_id': entity_id, 'detalle': {'ficticio': True, 'fuente': 'seed-v1'}, 'registrada_en': when})

    for day_index in range(settings.days):
        day = start_date + timedelta(days=day_index)
        current = day == settings.seed_date
        departure = datetime.combine(day, time(8), LIMA)
        orders = []
        assigned_count = settings.orders_per_day * 4 // 5
        for index in range(settings.orders_per_day):
            district, latitude, longitude = DISTRICTS[index % len(DISTRICTS)]
            point = (round(latitude+rng.uniform(-0.004,0.004),7), round(longitude+rng.uniform(-0.004,0.004),7))
            assigned = index < assigned_count
            route_index = index % 10
            stop_index = index // 10
            stop_count = len(range(route_index, assigned_count, 10))
            completed = not current or route_index >= 7 or (route_index >= 3 and stop_index < stop_count//2)
            state = ('ENTREGADO' if completed else 'EN_CAMINO' if route_index >= 3 else 'PENDIENTE') if assigned else ('CANCELADO' if index % 5 == 0 else 'PENDIENTE')
            window_start = departure + timedelta(minutes=(300 if current and route_index < 3 else 0) + stop_index*25)
            confirmed = window_start + timedelta(minutes=70 if stop_index == 0 and route_index == 7 else 20) if state == 'ENTREGADO' else None
            value = {'pedido_id': identifier('order', f'{day}:{index}'), 'conductor_id': drivers[route_index] if assigned else None,
                     'cliente_nombre': f'Cliente ficticio {index+1:03}', 'direccion_entrega': f'Av. de pruebas {100+index}, {district}',
                     'distrito': district, 'latitud': point[0], 'longitud': point[1], 'peso_kg': money(rng.uniform(2,12)),
                     'ventana_inicio': window_start, 'ventana_fin': window_start+timedelta(minutes=60),
                     'instrucciones': 'Entrega simulada; sin destinatario ni dirección real.', 'prioridad': 'ESTANDAR',
                     'estado': state, 'confirmed_at': confirmed, 'version': 2 if confirmed else 1, 'creado_en': departure-timedelta(hours=1)}
            orders.append(value)
            data['pedidos'].append(value)
            if confirmed:
                data['entregas'].append({'entrega_id': identifier('delivery', value['pedido_id']), 'pedido_id': value['pedido_id'],
                                        'conductor_id': value['conductor_id'], 'confirmada_en': confirmed, 'observaciones': 'Confirmación ficticia de prueba.'})
                audit('delivery:'+value['pedido_id'], users[f'conductor{route_index+1:02}'], 'CONFIRMAR_ENTREGA', 'pedidos', value['pedido_id'], confirmed)

        for route_index in range(10):
            stops = orders[route_index:assigned_count:10]
            route_id = identifier('route', f'{day}:{route_index}')
            points = [DEPOT, *((stop['latitud'], stop['longitud']) for stop in stops), DEPOT]
            fuel = data['vehiculos'][route_index]['tipo_combustible']
            factor, unit, rate = FUELS[fuel]
            legs = []
            for leg_index, (origin, target) in enumerate(zip(points, points[1:]),1):
                km = distance(origin, target)
                leg = {'tramo_id': identifier('leg', f'{route_id}:{leg_index}'), 'ruta_id': route_id, 'orden_tramo': leg_index,
                       'latitud_origen': origin[0], 'longitud_origen': origin[1], 'latitud_destino': target[0], 'longitud_destino': target[1],
                       'distancia_km': km, 'tiempo_estimado_min': max(1, math.ceil(float(km)*3)), 'co2_estimado_kg': money(km*rate*factor)}
                legs.append(leg)
                data['tramos'].append(leg)
            km = sum(leg['distancia_km'] for leg in legs)
            co2 = sum(leg['co2_estimado_kg'] for leg in legs)
            energy = money(km*rate)
            state = 'COMPLETADA' if not current or route_index >= 7 else 'GENERADA' if route_index < 3 else 'EN_CURSO'
            route_value = {'ruta_id': route_id, 'conductor_id': drivers[route_index], 'vehiculo_id': vehicles[route_index], 'almacen_id': depot_id,
                           'fecha_operacion': day, 'distancia_total_km': km, 'tiempo_estimado_min': sum(leg['tiempo_estimado_min'] for leg in legs)+len(stops)*5,
                           'combustible_estimado_l': energy if unit == 'L' else None, 'energia_estimada': energy, 'unidad_energia': unit,
                           'co2_estimado_kg': co2, 'co2_base_kg': money(co2*Decimal('1.25')), 'estado': state, 'version': 2 if route_index == 3 else 1,
                           'geometria': geometry('LineString', [[lon,lat] for lat,lon in points]), 'generada_en': departure-timedelta(minutes=30)}
            data['rutas'].append(route_value)
            audit('route:'+route_id, users['operador'], 'GENERAR_RUTA', 'rutas', route_id, departure-timedelta(minutes=30))
            for position, stop in enumerate(stops,1):
                data['ruta_pedido'].append({'ruta_id': route_id, 'pedido_id': stop['pedido_id'], 'orden_entrega': position})
            if 3 <= route_index <= 5:
                stop = stops[len(stops)//2] if current else stops[0]
                incident_id = identifier('incident', route_id)
                data['incidencias'].append({'incidencia_id': incident_id, 'pedido_id': stop['pedido_id'], 'conductor_id': drivers[route_index],
                                           'tipo': ['CONGESTION','DESTINATARIO_AUSENTE','ACCESO_BLOQUEADO'][route_index-3],
                                           'descripcion': 'Incidencia ficticia para validar flujo y permisos.', 'estado': 'ABIERTA' if current else 'RESUELTA',
                                           'reportada_en': departure+timedelta(hours=1)})
                if route_index == 3:
                    data['reoptimizaciones'].append({'reoptimizacion_id': identifier('reoptimization', route_id), 'ruta_id': route_id, 'incidencia_id': incident_id,
                                                    'ejecutada_por': users['operador'], 'motivo': 'Simulación de reoptimización por congestión.',
                                                    'version_anterior': 1, 'version_nueva': 2, 'ejecutada_en': departure+timedelta(hours=1,minutes=5)})
            for sample in range(3):
                point = DEPOT if state == 'GENERADA' else points[-1] if state == 'COMPLETADA' and sample == 2 else points[min(sample*(len(points)-1)//4,len(points)-1)]
                data['posiciones_vehiculos'].append({'posicion_id': identifier('position', f'{route_id}:{sample}'), 'vehiculo_id': vehicles[route_index],
                                                    'ruta_id': route_id, 'latitud': point[0], 'longitud': point[1], 'registrada_en': departure+timedelta(hours=sample)})
    for index in range(10,15):
        data['posiciones_vehiculos'].append({'posicion_id': identifier('position', f'parked:{index}'), 'vehiculo_id': vehicles[index],
                                            'ruta_id': None, 'latitud': DEPOT[0], 'longitud': DEPOT[1], 'registrada_en': snapshot})

    for index, (district, lat, lon) in enumerate(DISTRICTS):
        ring = [[lon,lat],[lon+0.001,lat],[lon+0.001,lat+0.001],[lon,lat+0.001],[lon,lat]]
        data['zonas_restringidas'].append({'zona_restringida_id': identifier('zone', index), 'nombre': f'Zona ficticia {district}',
                                          'descripcion': 'Polígono sintético; no representa una restricción vial real.', 'tipo': 'PRUEBA',
                                          'geometria': geometry('Polygon', [ring]), 'estado': 'ACTIVA' if index < 3 else 'INACTIVA', 'creado_en': start})

    def report(key, kind, first, last):
        routes = [route for route in data['rutas'] if first <= route['fecha_operacion'] <= last]
        report_id = identifier('report', key)
        data['reportes'].append({'reporte_id': report_id, 'tipo_reporte': kind, 'fecha_inicio': first, 'fecha_fin': last,
                                'distancia_total_km': sum(route['distancia_total_km'] for route in routes),
                                'combustible_total_l': sum(route['combustible_estimado_l'] or Decimal(0) for route in routes),
                                'co2_total_kg': sum(route['co2_estimado_kg'] for route in routes), 'co2_base_kg': sum(route['co2_base_kg'] for route in routes),
                                'generado_en': min(snapshot, datetime.combine(last, time(23), LIMA))})
        for route in routes:
            data['ruta_reporte'].append({'ruta_id': route['ruta_id'], 'reporte_id': report_id})
        audit('report:'+report_id, users['logistica'], 'EXPORTAR_REPORTE', 'reportes', report_id, min(snapshot, datetime.combine(last,time(23),LIMA)))

    for day_index in range(settings.days):
        day = start_date+timedelta(days=day_index)
        report(str(day), 'DIARIO_SIMULADO', day, day)
    report(f'week:{settings.seed_date}', 'SEMANAL_SIMULADO', settings.seed_date-timedelta(days=6), settings.seed_date)
    report(f'month:{settings.seed_date}', 'MENSUAL_SIMULADO', settings.seed_date.replace(day=1), settings.seed_date)
    month_index = settings.seed_date.year*12 + settings.seed_date.month-1-2
    quarter_start = settings.seed_date.replace(year=month_index//12, month=month_index%12+1, day=1)
    report(f'quarter:{settings.seed_date}', 'TRIMESTRAL_SIMULADO', quarter_start, settings.seed_date)
    data['parametros_algoritmo'].append({'parametro_id': identifier('settings', 1), 'peso_co2': 70, 'tiempo_maximo_seg': 45,
                                        'carga_maxima_pct': 95, 'holgura_ventana_min': 10, 'reoptimizar_automaticamente': True,
                                        'actualizado_por': users['admin'], 'actualizado_en': start})
    for fuel, (factor, unit, _) in FUELS.items():
        data['factores_emision'].append({'combustible': fuel, 'factor_kg_co2': factor, 'unidad': 'kg/'+unit, 'fuente': 'Valor sintético de prueba, sin validez normativa.'})
    for key, name in [('db','PostgreSQL + PostGIS'),('map','Cartografía'),('traffic','Tráfico'),('smtp','Correo')]:
        data['integraciones'].append({'integracion_id': key, 'nombre': name, 'estado': 'SIMULADA' if key == 'db' else 'PENDIENTE', 'descripcion': 'Configuración ficticia sin credenciales ni conexión a proveedores externos.'})
    audit('settings', users['admin'], 'ACTUALIZAR_PARAMETROS', 'parametros_algoritmo', identifier('settings',1), start)
    return data
