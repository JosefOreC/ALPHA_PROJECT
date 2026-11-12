"""Corrige solo las rutas de demostración identificadas, sin reasignar pedidos ni conductores."""
import argparse
import json
import sys
from datetime import date, datetime
from pathlib import Path
from zoneinfo import ZoneInfo
from uuid import uuid4

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'src/backend'))
sys.path.insert(0,str(ROOT/'scripts'))

from domain.emissions import emission_rate, fuel_used
from domain.planning import simulate
from domain.road_network import RoadNetwork
from infrastructure.config import load_environment
from infrastructure.persistence.database import connection
from infrastructure.persistence.postgres_portal import PostgresPortal
from infrastructure.road_routing import ValhallaRouter, road_proposal
from test_db.dataset import identifier

SOURCE = 'visible-routes-v1'


def refresh(day,dry_run=False,optimize=False):
    load_environment()
    route_ids = [identifier(SOURCE,f'{day}:route:{i}') for i in range(4)]
    with connection() as conn:
        metadata = conn.execute('SELECT owner FROM test_database_metadata WHERE id=1').fetchone()
        if not metadata or metadata['owner']!='ecologistica-test-db':
            raise ValueError('Solo se pueden actualizar rutas de la base de demostración identificada.')
        routes = conn.execute('''SELECT r.*,v.tipo_combustible,v.placa,v.capacidad_kg,c.nombre_completo,a.latitud,a.longitud FROM rutas r JOIN vehiculos v USING(vehiculo_id)
            JOIN conductores c USING(conductor_id)
            JOIN almacenes a USING(almacen_id) WHERE ruta_id=ANY(%s::uuid[]) ORDER BY ruta_id FOR UPDATE OF r''',(route_ids,)).fetchall()
        if len(routes)!=4:
            raise ValueError('Se requieren las cuatro rutas de demostración de la fecha indicada.')
        factors = {r['combustible']:{'factor':float(r['factor_kg_co2']),'consumption':float(r['consumo_por_km']) if r['consumo_por_km'] is not None else None}
                   for r in conn.execute('SELECT * FROM factores_emision').fetchall()}
        diesel = emission_rate('DIESEL',factors)
        result = []
        for route in routes:
            if (not optimize and route['ruteo'].get('provider')=='Valhalla / OpenStreetMap') or (optimize and route['ruteo'].get('optimizationVersion')==2):
                result.append({'id':str(route['ruta_id']),'already_routed':True})
                continue
            orders = conn.execute('''SELECT p.* FROM ruta_pedido rp JOIN pedidos p USING(pedido_id)
                WHERE ruta_id=%s ORDER BY orden_entrega FOR UPDATE OF p,rp''',(route['ruta_id'],)).fetchall()
            depot = (float(route['latitud']),float(route['longitud']))
            returning = False if optimize else route['ruteo'].get('returnToDepot',False)
            reordered = optimize and route['estado']=='GENERADA' and all(o['estado']=='PENDIENTE' for o in orders)
            if reordered:
                config = PostgresPortal().parameters(lambda statement,params=():conn.execute(statement,params).fetchall())
                planned = road_proposal(orders,[route],depot,factors,config,
                    {'goal':'co2','respectWindows':True,'prioritizeLowEmission':True,'returnToDepot':False},route['generada_en'])['routes'][0]
                by_id = {str(o['pedido_id']):o for o in orders}
                orders = [by_id[stop['id']] for stop in planned['sequence']]
                actual = {key:planned[key] for key in ('path','legs','routing')}
            else:
                points = [depot]+[(float(o['latitud']),float(o['longitud'])) for o in orders]+([depot] if returning else [])
                actual = ValhallaRouter().route(points,'shortest')
            rate = emission_rate(route['tipo_combustible'],factors)
            if rate is None or diesel is None:
                raise ValueError('Faltan factores o consumos configurados.')
            network = RoadNetwork({((l['origin']['lat'],l['origin']['lng']),(l['destination']['lat'],l['destination']['lng'])):
                                    (l['km'],l['minutes']) for l in actual['legs']})
            trip = simulate(orders,depot,route['generada_en'],reordered,network,returning)
            if trip is None:
                raise ValueError('El recorrido corregido no cumple las ventanas de entrega.')
            km,minutes = trip['km'],trip['minutes']
            energy = fuel_used(route['tipo_combustible'],km,factors)
            if optimize and (km>float(route['distancia_total_km'])+.01 or round(km*rate,2)>float(route['co2_estimado_kg'])+.01):
                raise ValueError('El recálculo no reduce distancia y emisiones; se conserva la ruta anterior.')
            actual['routing'].update(returnToDepot=returning,baseline='Recorrido anterior con diésel' if optimize else 'Mismo recorrido vial con diésel')
            if optimize:
                actual['routing']['optimizationVersion'] = 2
            baseline = float(route['co2_base_kg']) if optimize else round(km*diesel,2)
            geometry = json.dumps({'type':'LineString','coordinates':[[p['lng'],p['lat']] for p in actual['path']]})
            result.append({'id':str(route['ruta_id']),'plate':route['placa'],'previousKm':float(route['distancia_total_km']),
                           'km':round(km,2),'previousCo2Kg':float(route['co2_estimado_kg']),'co2Kg':round(km*rate,2),
                           'vertices':len(actual['path']),'legs':len(actual['legs']),'reordered':reordered})
            if dry_run:
                continue
            conn.execute('''UPDATE rutas SET distancia_total_km=%s,tiempo_estimado_min=%s,combustible_estimado_l=%s,
                energia_estimada=%s,unidad_energia=%s,co2_estimado_kg=%s,co2_base_kg=%s,
                geometria=ST_SetSRID(ST_GeomFromGeoJSON(%s),4326),ruteo=%s::jsonb,version=version+1 WHERE ruta_id=%s''',
                (round(km,2),round(minutes),energy['amount'] if energy['unit']=='L' else None,energy['amount'],energy['unit'],
                 round(km*rate,2),baseline,geometry,json.dumps(actual['routing']),route['ruta_id']))
            if reordered:
                conn.execute('DELETE FROM ruta_pedido WHERE ruta_id=%s',(route['ruta_id'],))
                for index,order in enumerate(orders,1):
                    conn.execute('INSERT INTO ruta_pedido(ruta_id,pedido_id,orden_entrega) VALUES (%s,%s,%s)',(route['ruta_id'],order['pedido_id'],index))
            conn.execute('DELETE FROM tramos WHERE ruta_id=%s',(route['ruta_id'],))
            for index,leg in enumerate(actual['legs'],1):
                a,b = leg['origin'],leg['destination']
                conn.execute('''INSERT INTO tramos(tramo_id,ruta_id,orden_tramo,latitud_origen,longitud_origen,latitud_destino,longitud_destino,
                    distancia_km,tiempo_estimado_min,co2_estimado_kg) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)''',
                    (uuid4(),route['ruta_id'],index,a['lat'],a['lng'],b['lat'],b['lng'],round(leg['km'],2),round(leg['minutes']),round(leg['km']*rate,2)))
            conn.execute('''INSERT INTO auditoria(evento_id,usuario_id,accion,entidad,entidad_id,detalle,registrada_en)
                SELECT %s,usuario_id,'ACTUALIZAR_GEOMETRIA_VIAL','rutas',%s,%s::jsonb,CURRENT_TIMESTAMP FROM auditoria
                WHERE entidad_id=%s AND accion='CARGAR_DEMOSTRACION' LIMIT 1''',
                (uuid4(),route['ruta_id'],json.dumps({'fuente':SOURCE,'provider':'Valhalla / OpenStreetMap',
                     'optimization':optimize,'previousKm':float(route['distancia_total_km']),'km':round(km,2),
                     'previousCo2Kg':float(route['co2_estimado_kg']),'co2Kg':round(km*rate,2)}),route['ruta_id']))
        return {'date':str(day),'routes':result,'dry_run':dry_run,'optimize':optimize}


if __name__=='__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--date',type=date.fromisoformat,default=datetime.now(ZoneInfo('America/Lima')).date())
    parser.add_argument('--dry-run',action='store_true')
    parser.add_argument('--optimize',action='store_true',help='Quita el retorno artificial y optimiza entregas aún pendientes; conserva la secuencia de rutas en curso.')
    args = parser.parse_args()
    try:
        print(json.dumps(refresh(args.date,args.dry_run,args.optimize)))
    except Exception as error:
        print(f'No se actualizaron las rutas ({type(error).__name__}). Se revierte toda la operación.',file=sys.stderr)
        raise SystemExit(1)
