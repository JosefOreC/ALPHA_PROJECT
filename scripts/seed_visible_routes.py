"""Añade una jornada de demostración visible, sin reiniciar la base ni su historial.

Uso: .venv/Scripts/python.exe scripts/seed_visible_routes.py [--date YYYY-MM-DD] [--dry-run]
Solo opera sobre una base identificada como ecologistica-test-db.
"""
import argparse
import json
import sys
from datetime import date, datetime, time, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'src/backend'))

from domain.emissions import emission_rate
from infrastructure.road_routing import road_proposal as propose
from infrastructure.config import load_environment
from infrastructure.persistence.database import connection
from infrastructure.persistence.postgres_portal import PostgresPortal
from test_db.dataset import DISTRICTS, identifier

LIMA = ZoneInfo('America/Lima')
SOURCE = 'visible-routes-v1'


def seed(day, dry_run=False):
    load_environment()
    route_ids = [identifier(SOURCE, f'{day}:route:{i}') for i in range(4)]
    with connection() as conn:
        conn.execute("SET LOCAL lock_timeout = '10s'")
        metadata = conn.execute("SELECT owner FROM test_database_metadata WHERE id=1").fetchone()
        if not metadata or metadata['owner']!='ecologistica-test-db':
            raise ValueError('La base no está identificada como base de pruebas; no se modifica.')
        if not dry_run:
            conn.execute('LOCK TABLE pedidos,rutas,vehiculos,conductores,usuarios,almacenes,parametros_algoritmo,factores_emision IN SHARE ROW EXCLUSIVE MODE')
        existing = conn.execute('SELECT count(*) AS n FROM rutas WHERE ruta_id=ANY(%s::uuid[])',(route_ids,)).fetchone()['n']
        if existing:
            if existing!=4:
                raise ValueError('La jornada de demostración está incompleta; se conserva para revisión.')
            return {'date':str(day),'routes':4,'orders':24,'already_present':True}
        depot = conn.execute('SELECT * FROM almacenes ORDER BY nombre,almacen_id LIMIT 1').fetchone()
        if not depot:
            raise ValueError('Se requiere un almacén configurado.')
        query = lambda statement, params=(): conn.execute(statement,params).fetchall()
        config = PostgresPortal().parameters(query)
        factors = {row['combustible']:{'factor':float(row['factor_kg_co2']),
                   'consumption':float(row['consumo_por_km']) if row['consumo_por_km'] is not None else None}
                   for row in query('SELECT * FROM factores_emision')}
        if emission_rate('DIESEL',factors) is None:
            raise ValueError('Configura el factor y consumo diésel para la línea base.')
        fleet = query("""SELECT v.*,c.conductor_id,c.nombre_completo FROM vehiculos v JOIN conductores c USING(vehiculo_id)
            JOIN usuarios u USING(usuario_id) WHERE v.estado='DISPONIBLE' AND c.estado='ACTIVO' AND u.estado='ACTIVO'
            AND NOT EXISTS (SELECT 1 FROM rutas r WHERE fecha_operacion=%s AND (r.vehiculo_id=v.vehiculo_id OR r.conductor_id=c.conductor_id))
            ORDER BY placa""",(day,))
        fleet = [row for row in fleet if emission_rate(row['tipo_combustible'],factors) is not None][:4]
        if len(fleet)<4:
            raise ValueError('Se necesitan cuatro vehículos disponibles con conductor activo y factores configurados; no se alteran asignaciones existentes.')
        actors = query("SELECT usuario_id FROM usuarios WHERE estado='ACTIVO' AND rol IN ('OPERADOR','ADMIN') ORDER BY rol,creado_en LIMIT 1")
        if not actors:
            raise ValueError('Se requiere una cuenta administrativa activa para registrar la carga.')
        start = datetime.combine(day,time(7),LIMA)
        window_start = datetime.combine(day,time(0),LIMA)
        window_end = datetime.combine(day,time(23,59,59),LIMA)
        origin = (float(depot['latitud']),float(depot['longitud']))
        order_count = 0

        def save_order(order, driver=None, state='PENDIENTE', confirmed=None):
            nonlocal order_count
            order_count += 1
            if dry_run:
                return
            conn.execute('''INSERT INTO pedidos(pedido_id,conductor_id,cliente_nombre,direccion_entrega,distrito,latitud,longitud,
                peso_kg,ventana_inicio,ventana_fin,instrucciones,estado,confirmed_at,version,creado_en)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)''',
                (order['pedido_id'],driver,order['cliente_nombre'],order['direccion_entrega'],order['distrito'],order['latitud'],order['longitud'],
                 order['peso_kg'],window_start,window_end,'Datos de demostración: cliente, destino y posición de vehículo sintéticos.',
                 state,confirmed,2 if confirmed else 1,start-timedelta(hours=1)))

        for index,(vehicle,route_id) in enumerate(zip(fleet,route_ids)):
            district,lat,lng = DISTRICTS[index]
            orders = [{'pedido_id':identifier(SOURCE,f'{day}:route:{index}:order:{stop}'),
                       'cliente_nombre':f'Demo · {district} {stop+1}', 'direccion_entrega':f'Destino de demostración {stop+1}, {district}',
                       'distrito':district,'latitud':round(lat+dy,7),'longitud':round(lng+dx,7),'peso_kg':8+stop*3,
                       'ventana_inicio':window_start,'ventana_fin':window_end}
                      for stop,(dy,dx) in enumerate(((-.0018,-.0012),(-.0005,.0014),(.0013,.0021),(.0024,-.0007)))]
            route = propose(orders,[vehicle],origin,factors,config,{'goal':'co2','respectWindows':True,'prioritizeLowEmission':True,'returnToDepot':False},start)['routes'][0]
            by_id = {order['pedido_id']:order for order in orders}
            sequence = [by_id[stop['id']] for stop in route['sequence']]
            for position,order in enumerate(sequence):
                confirmed = start+timedelta(minutes=30) if index>0 and position==0 else None
                save_order(order,vehicle['conductor_id'],'ENTREGADO' if confirmed else 'EN_CAMINO' if index>0 else 'PENDIENTE',confirmed)
                if confirmed and not dry_run:
                    conn.execute('INSERT INTO entregas(entrega_id,pedido_id,conductor_id,confirmada_en,observaciones) VALUES (%s,%s,%s,%s,%s)',
                                 (identifier(SOURCE,f'{order["pedido_id"]}:delivery'),order['pedido_id'],vehicle['conductor_id'],confirmed,'Entrega de demostración.'))
            if dry_run:
                continue
            points = route['path']
            energy = route['fuelUsed']
            geometry = json.dumps({'type':'LineString','coordinates':[[p['lng'],p['lat']] for p in points]})
            conn.execute('''INSERT INTO rutas(ruta_id,conductor_id,vehiculo_id,almacen_id,fecha_operacion,distancia_total_km,tiempo_estimado_min,
                combustible_estimado_l,energia_estimada,unidad_energia,co2_estimado_kg,co2_base_kg,estado,geometria,generada_en)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,ST_SetSRID(ST_GeomFromGeoJSON(%s),4326),%s)''',
                (route_id,vehicle['conductor_id'],vehicle['vehiculo_id'],depot['almacen_id'],day,route['km'],route['minutes'],
                 energy['amount'] if energy['unit']=='L' else None,energy['amount'],energy['unit'],route['co2Kg'],route['baselineCo2Kg'],
                 'EN_CURSO' if index>0 else 'GENERADA',geometry,start))
            for position,order in enumerate(sequence,1):
                conn.execute('INSERT INTO ruta_pedido(ruta_id,pedido_id,orden_entrega) VALUES (%s,%s,%s)',(route_id,order['pedido_id'],position))
            conn.execute('UPDATE rutas SET ruteo=%s::jsonb WHERE ruta_id=%s',(json.dumps(route['routing']),route_id))
            rate = emission_rate(vehicle['tipo_combustible'],factors)
            for position,leg in enumerate(route['legs'],1):
                a,b,km = leg['origin'],leg['destination'],leg['km']
                conn.execute('''INSERT INTO tramos(tramo_id,ruta_id,orden_tramo,latitud_origen,longitud_origen,latitud_destino,longitud_destino,
                    distancia_km,tiempo_estimado_min,co2_estimado_kg) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)''',
                    (identifier(SOURCE,f'{route_id}:leg:{position}'),route_id,position,a['lat'],a['lng'],b['lat'],b['lng'],round(km,2),round(leg['minutes']),round(km*rate,2)))
            location = sequence[0] if index>0 else depot
            conn.execute('INSERT INTO posiciones_vehiculos(posicion_id,vehiculo_id,ruta_id,latitud,longitud,registrada_en) VALUES (%s,%s,%s,%s,%s,%s)',
                         (identifier(SOURCE,f'{route_id}:position'),vehicle['vehiculo_id'],route_id,location['latitud'],location['longitud'],start+timedelta(minutes=35)))
            if index>0:
                conn.execute("UPDATE vehiculos SET estado='EN_RUTA' WHERE vehiculo_id=%s",(vehicle['vehiculo_id'],))
            conn.execute('INSERT INTO auditoria(evento_id,usuario_id,accion,entidad,entidad_id,detalle,registrada_en) VALUES (%s,%s,%s,%s,%s,%s::jsonb,%s)',
                         (identifier(SOURCE,f'{route_id}:audit'),actors[0]['usuario_id'],'CARGAR_DEMOSTRACION','rutas',route_id,
                          json.dumps({'ficticio':True,'fuente':SOURCE}),start))

        for index in range(8):
            district,lat,lng = DISTRICTS[index%4]
            save_order({'pedido_id':identifier(SOURCE,f'{day}:pending:{index}'),'cliente_nombre':f'Demo · Por planificar {index+1:02}',
                        'direccion_entrega':f'Punto de demostración {index+1}, {district}','distrito':district,
                        'latitud':round(lat+.001*(index//4),7),'longitud':round(lng-.001,7),'peso_kg':10})
        return {'date':str(day),'routes':4,'orders':order_count,'already_present':False,'dry_run':dry_run}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--date',type=date.fromisoformat,default=datetime.now(LIMA).date())
    parser.add_argument('--dry-run',action='store_true')
    args = parser.parse_args()
    try:
        result = seed(args.date,args.dry_run)
    except ValueError as error:
        print(str(error),file=sys.stderr)
        return 1
    except Exception as error:
        print(f'No se confirmó la carga ({type(error).__name__}). Revisa la base de pruebas y sus migraciones.',file=sys.stderr)
        return 1
    print(json.dumps(result,ensure_ascii=False))
    return 0


if __name__=='__main__':
    raise SystemExit(main())
