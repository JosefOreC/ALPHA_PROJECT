"""Prepara un almacén y factores sintéticos para la demostración del curso."""
from datetime import datetime, time, timedelta
from decimal import Decimal
from os import environ

import psycopg

from test_db.dataset import DEPOT, DISTRICTS, FUELS, LIMA, distance, identifier, password_hash


def seed_training_scenario(connection, password, today):
    if not 12 <= len(password) <= 256:
        raise ValueError('COURSE_DEMO_PASSWORD debe tener entre 12 y 256 caracteres.')

    # IDs estables para cuentas y flota, separados de los datos de otros bancos de prueba.
    operator = identifier('course-user', 'operator')
    driver_users = [identifier('course-user', i) for i in (1, 2)]
    vehicles = [identifier('course-vehicle', i) for i in (1, 2)]
    drivers = [identifier('course-driver', i) for i in (1, 2)]
    users = [
        (operator, 'Operador de demostración', 'demo-operador@example.invalid', 'OPERADOR'),
        *[(user, f'Conductor de demostración {i}', f'demo-conductor{i}@example.invalid', 'CONDUCTOR')
          for i, user in enumerate(driver_users, 1)],
    ]
    for user, name, email, role in users:
        if connection.execute('SELECT 1 FROM usuarios WHERE usuario_id=%s', (user,)).fetchone():
            continue
        connection.execute(
            """INSERT INTO usuarios(usuario_id,nombre,email,password_hash,rol,estado)
               VALUES (%s,%s,%s,%s,%s,'ACTIVO') ON CONFLICT DO NOTHING""",
            (user, name, email, password_hash(password), role),
        )
    for i, (vehicle, driver, user) in enumerate(zip(vehicles, drivers, driver_users), 1):
        if not connection.execute('SELECT 1 FROM usuarios WHERE usuario_id=%s', (user,)).fetchone():
            continue
        connection.execute(
            """INSERT INTO vehiculos(vehiculo_id,placa,capacidad_kg,tipo_combustible,estado)
               VALUES (%s,%s,100,'DIESEL','DISPONIBLE') ON CONFLICT DO NOTHING""",
            (vehicle, f'DMO-{i:03}'),
        )
        if connection.execute('SELECT 1 FROM vehiculos WHERE vehiculo_id=%s', (vehicle,)).fetchone():
            connection.execute(
                """INSERT INTO conductores(conductor_id,usuario_id,vehiculo_id,nombre_completo,dni,licencia,estado)
                   VALUES (%s,%s,%s,%s,%s,%s,'ACTIVO') ON CONFLICT DO NOTHING""",
                (driver, user, vehicle, f'Conductor de demostración {i}', f'9815000{i}', f'CURSO-DEMO-{i}'),
            )

    start = datetime.combine(today, time.min, LIMA)
    end = start + timedelta(days=1)
    for i, (district, latitude, longitude) in enumerate(DISTRICTS[1:], 1):
        connection.execute(
            """INSERT INTO pedidos(pedido_id,cliente_nombre,direccion_entrega,distrito,
                   latitud,longitud,peso_kg,ventana_inicio,ventana_fin,instrucciones,estado)
               VALUES (%s,%s,%s,%s,%s,%s,4,%s,%s,'Entrega ficticia para la demo del curso.','PENDIENTE')
               ON CONFLICT (pedido_id) DO NOTHING""",
            (identifier('course-order', f'{today}:{i}'), f'Pedido demo {today} · {i}',
             f'Punto de prueba · {district}', district, latitude, longitude, start, end),
        )

    # Una ruta ya en curso permite probar confirmación. Los otros pedidos quedan para el planificador.
    route_id = identifier('course-route', today)
    if not connection.execute('SELECT 1 FROM conductores WHERE conductor_id=%s', (drivers[0],)).fetchone():
        return
    order_id = identifier('course-order', f'{today}:1')
    order = connection.execute(
        "SELECT latitud,longitud FROM pedidos WHERE pedido_id=%s AND estado='PENDIENTE' AND conductor_id IS NULL FOR UPDATE",
        (order_id,),
    ).fetchone()
    if not order:
        return
    depot = connection.execute(
        'SELECT almacen_id,latitud,longitud FROM almacenes ORDER BY nombre,almacen_id LIMIT 1'
    ).fetchone()
    origin, destination = tuple(depot[1:]), tuple(order)
    km = distance(origin, destination)
    route = connection.execute(
        """INSERT INTO rutas(ruta_id,conductor_id,vehiculo_id,almacen_id,fecha_operacion,
               distancia_total_km,tiempo_estimado_min,combustible_estimado_l,energia_estimada,unidad_energia,
               co2_estimado_kg,co2_base_kg,estado,geometria,ruteo,generada_en)
           VALUES (%s,%s,%s,%s,%s,%s,15,%s,%s,'L',%s,%s,'EN_CURSO',
               ST_SetSRID(ST_MakeLine(ST_MakePoint(%s,%s),ST_MakePoint(%s,%s)),4326),
               '{"provider":"Escenario ficticio del curso","returnToDepot":false}'::jsonb,CURRENT_TIMESTAMP)
           ON CONFLICT DO NOTHING RETURNING ruta_id""",
        (route_id, drivers[0], vehicles[0], depot[0], today, km, km * Decimal('0.09'),
         km * Decimal('0.09'), km * Decimal('0.2412'), km * Decimal('0.2412'),
         origin[1], origin[0], destination[1], destination[0]),
    ).fetchone()
    if not route:
        return
    connection.execute('INSERT INTO ruta_pedido(ruta_id,pedido_id,orden_entrega) VALUES (%s,%s,1)', (route_id, order_id))
    connection.execute(
        """INSERT INTO tramos(tramo_id,ruta_id,orden_tramo,latitud_origen,longitud_origen,
               latitud_destino,longitud_destino,distancia_km,tiempo_estimado_min,co2_estimado_kg)
           VALUES (%s,%s,1,%s,%s,%s,%s,%s,15,%s)""",
        (identifier('course-leg', today), route_id, *origin, *destination, km, km * Decimal('0.2412')),
    )
    connection.execute("UPDATE pedidos SET conductor_id=%s,estado='EN_CAMINO' WHERE pedido_id=%s", (drivers[0], order_id))
    connection.execute("UPDATE vehiculos SET estado='EN_RUTA' WHERE vehiculo_id=%s AND estado='DISPONIBLE'", (vehicles[0],))


def main():
    with psycopg.connect(environ['DATABASE_URL'], connect_timeout=5) as connection:
        connection.execute('SELECT pg_advisory_xact_lock(73122)')
        connection.execute(
            """INSERT INTO almacenes(almacen_id, nombre, direccion, latitud, longitud)
            SELECT %s, %s, %s, %s, %s
            WHERE NOT EXISTS (SELECT 1 FROM almacenes)
            ON CONFLICT (almacen_id) DO NOTHING""",
            (identifier('depot', 1), 'Almacén de demostración de Lima Este',
             'Punto ficticio para la demostración del curso', *DEPOT),
        )
        with connection.cursor() as cursor:
            cursor.executemany(
                """INSERT INTO factores_emision(combustible, factor_kg_co2, unidad, fuente, consumo_por_km)
                VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT (combustible) DO NOTHING""",
                [(fuel, factor, f'kg/{unit}', 'Valor sintético de prueba, sin validez normativa.', consumption)
                 for fuel, (factor, unit, consumption) in FUELS.items()],
            )
        password = environ.get('COURSE_DEMO_PASSWORD')
        if password:
            seed_training_scenario(connection, password, datetime.now(LIMA).date())
    print('Datos básicos de demostración disponibles: almacén y factores sintéticos.')


if __name__ == '__main__':
    main()
