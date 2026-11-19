"""Consultas operativas del esquema PostgreSQL compartido por todas las vistas."""
import json
import hashlib
from datetime import datetime, timedelta
from uuid import uuid4
from zoneinfo import ZoneInfo
from psycopg import sql
from domain.access_control import canonical_role
from domain.emissions import FUEL_UNITS, REFERENCE_CONSUMPTION
from infrastructure.road_routing import road_proposal as propose
from infrastructure.persistence.database import connection, rows
from infrastructure.security import hash_password
from infrastructure.persistence.postgres_dashboard import DISTRICTS, PostgresDashboard

LIMA = ZoneInfo('America/Lima')
FUELS = ('DIESEL','GASOLINA','GLP','GNV','ELECTRICO','HIBRIDO')
AVAILABLE_FLEET = """SELECT v.*,c.conductor_id,c.nombre_completo FROM vehiculos v
    JOIN conductores c USING(vehiculo_id) JOIN usuarios u USING(usuario_id)
    WHERE v.estado='DISPONIBLE' AND c.estado='ACTIVO' AND u.estado='ACTIVO' AND NOT EXISTS
    (SELECT 1 FROM rutas r WHERE r.fecha_operacion=%s AND (r.vehiculo_id=v.vehiculo_id OR r.conductor_id=c.conductor_id))
    ORDER BY placa LIMIT 15"""


def now():
    return datetime.now(LIMA)


def user_dto(row):
    return {'id':str(row['usuario_id']),'name':row['nombre'],'email':row['email'],
            'role':canonical_role(row['rol']),'status':'active' if row['estado']=='ACTIVO' else 'inactive',
            'lastAccess':row['ultimo_acceso'].astimezone(LIMA).strftime('%d/%m/%Y %H:%M') if row['ultimo_acceso'] else 'Sin acceso'}


def audit(conn, actor, action, entity, identifier, detail):
    conn.execute('INSERT INTO auditoria(evento_id,usuario_id,accion,entidad,entidad_id,detalle,registrada_en) VALUES (%s,%s,%s,%s,%s,%s::jsonb,CURRENT_TIMESTAMP)',
                 (uuid4(),actor,action,entity,identifier,json.dumps(detail)))


class PostgresPortal:
    def users(self):
        items = [user_dto(row) for row in rows('SELECT * FROM usuarios ORDER BY nombre')]
        counts = {role:sum(item['role']==role for item in items) for role in ('admin','planner','driver','logistics','auditor')}
        return {'items':items,'total':len(items),'roleCounts':counts}

    def create_user(self, payload, actor):
        import psycopg
        identifier = uuid4()
        roles = rows('SELECT rol FROM roles')
        role = next((row['rol'] for row in roles if canonical_role(row['rol'])==payload['role']),None)
        if not role:
            raise ValueError('El rol seleccionado no está configurado.')
        try:
            with connection() as conn:
                row = conn.execute('''INSERT INTO usuarios(usuario_id,nombre,email,password_hash,rol,estado)
                    VALUES (%s,%s,%s,%s,%s,'ACTIVO') RETURNING *''',
                    (identifier,payload['name'].strip(),payload['email'].strip().lower(),hash_password(payload['password']),role)).fetchone()
                audit(conn,actor,'CREAR_USUARIO','usuarios',identifier,{'rol':role})
        except psycopg.errors.UniqueViolation:
            raise ValueError('Ya existe una cuenta con ese correo.') from None
        return user_dto(row)

    def driver_accounts(self):
        return [{'id':str(row['usuario_id']),'name':row['nombre']} for row in rows("""SELECT u.usuario_id,u.nombre FROM usuarios u LEFT JOIN conductores c USING(usuario_id)
            WHERE u.rol IN ('CONDUCTOR','driver','ROL-03') AND u.estado='ACTIVO' AND c.conductor_id IS NULL ORDER BY nombre""")]

    def parameters(self, query=rows):
        result = query('SELECT * FROM parametros_algoritmo ORDER BY actualizado_en DESC LIMIT 1')
        if not result:
            raise ValueError('No hay parámetros configurados en la base de datos.')
        row = result[0]
        stored = query('SELECT * FROM factores_emision')
        factors = {fuel:None for fuel in FUELS}
        factors.update({item['combustible']:float(item['factor_kg_co2']) for item in stored})
        consumption = {fuel:None for fuel in FUELS}
        consumption.update({item['combustible']:float(item['consumo_por_km']) for item in stored if item.get('consumo_por_km') is not None})
        return {'co2Weight':row['peso_co2'],'maxSeconds':row['tiempo_maximo_seg'],'maxLoadPercent':row['carga_maxima_pct'],
                'windowSlackMinutes':row['holgura_ventana_min'],'autoReoptimize':row['reoptimizar_automaticamente'],'emissionFactors':factors,
                'fuelConsumption':consumption}

    def save_parameters(self, data, actor):
        with connection() as conn:
            conn.execute('SELECT pg_advisory_xact_lock(73120)')
            current = conn.execute('SELECT parametro_id FROM parametros_algoritmo ORDER BY actualizado_en DESC LIMIT 1 FOR UPDATE').fetchone()
            identifier = current['parametro_id'] if current else uuid4()
            conn.execute('''INSERT INTO parametros_algoritmo(parametro_id,peso_co2,tiempo_maximo_seg,carga_maxima_pct,holgura_ventana_min,reoptimizar_automaticamente,actualizado_por,actualizado_en)
                VALUES (%s,%s,%s,%s,%s,%s,%s,CURRENT_TIMESTAMP) ON CONFLICT(parametro_id) DO UPDATE SET
                peso_co2=EXCLUDED.peso_co2,tiempo_maximo_seg=EXCLUDED.tiempo_maximo_seg,carga_maxima_pct=EXCLUDED.carga_maxima_pct,
                holgura_ventana_min=EXCLUDED.holgura_ventana_min,reoptimizar_automaticamente=EXCLUDED.reoptimizar_automaticamente,
                actualizado_por=EXCLUDED.actualizado_por,actualizado_en=EXCLUDED.actualizado_en''',
                (identifier,data['co2Weight'],data['maxSeconds'],data['maxLoadPercent'],data['windowSlackMinutes'],data['autoReoptimize'],actor))
            consumption = data.get('fuelConsumption') or {}
            for fuel, factor in data['emissionFactors'].items():
                if factor is None:
                    conn.execute('DELETE FROM factores_emision WHERE combustible=%s',(fuel,))
                else:
                    # Sin consumo en la petición (clientes anteriores no lo envían) se conserva el guardado
                    # o, en una fila nueva, se usa el de referencia para no excluir esos vehículos.
                    given = consumption.get(fuel)
                    conn.execute('''INSERT INTO factores_emision(combustible,factor_kg_co2,unidad,fuente,consumo_por_km)
                        VALUES (%s,%s,%s,'Configurado por administración',COALESCE(%s::numeric,%s::numeric))
                        ON CONFLICT(combustible) DO UPDATE SET factor_kg_co2=EXCLUDED.factor_kg_co2,fuente=EXCLUDED.fuente,
                        consumo_por_km=COALESCE(%s::numeric,factores_emision.consumo_por_km)''',
                        (fuel,factor,FUEL_UNITS[fuel],given,REFERENCE_CONSUMPTION[fuel],given))
            audit(conn,actor,'ACTUALIZAR_PARAMETROS','parametros_algoritmo',identifier,{})
        return self.parameters()

    def integrations(self):
        result = rows('SELECT * FROM integraciones ORDER BY nombre')
        return [{'id':row['integracion_id'],'name':row['nombre'],'description':row['descripcion'],
                 'status':'connected' if row['integracion_id']=='db' else 'pending'} for row in result]

    def route_rows(self, day=None, driver_id=None):
        return rows(sql.SQL('''SELECT r.*,v.placa,v.tipo_combustible,c.nombre_completo,a.nombre AS depot,ST_AsGeoJSON(r.geometria)::json AS geo
            FROM rutas r JOIN vehiculos v USING(vehiculo_id) JOIN conductores c USING(conductor_id) JOIN almacenes a USING(almacen_id)
            WHERE fecha_operacion=%s''') + sql.SQL(' AND r.conductor_id=%s' if driver_id else '') + sql.SQL(' ORDER BY v.placa'),
            (day or now().date(),driver_id) if driver_id else (day or now().date(),))

    def map(self, driver_id=None, active_only=False):
        route_rows = self.route_rows(driver_id=driver_id)
        route_ids = [row['ruta_id'] for row in route_rows]
        depots = rows('SELECT nombre,latitud,longitud FROM almacenes ORDER BY nombre LIMIT 1')
        orders = rows(sql.SQL('''SELECT p.*,rp.ruta_id,rp.orden_entrega FROM pedidos p LEFT JOIN ruta_pedido rp USING(pedido_id)
            WHERE (ventana_inicio AT TIME ZONE 'America/Lima')::date=%s AND latitud IS NOT NULL AND longitud IS NOT NULL''')
            + sql.SQL(" AND p.estado IN ('PENDIENTE','EN_CAMINO')" if active_only else '')
            + sql.SQL(' AND p.conductor_id=%s' if driver_id else ''),(now().date(),driver_id) if driver_id else (now().date(),))
        if active_only:
            active_ids = {row['ruta_id'] for row in orders if row['estado'] in ('PENDIENTE','EN_CAMINO')}
            route_rows = [row for row in route_rows if row['estado']!='COMPLETADA' and row['ruta_id'] in active_ids]
            route_ids = [row['ruta_id'] for row in route_rows]
            orders = [row for row in orders if row['estado'] in ('PENDIENTE','EN_CAMINO')
                      and (row['ruta_id'] in route_ids or (row['ruta_id'] is None and depots))]
        routes = [{'id':str(row['ruta_id']),'plate':row['placa'],'driver':row['nombre_completo'],'color':i%4+1,
                   'path':[{'lat':point[1],'lng':point[0]} for point in row['geo']['coordinates']], 'done_until':0} for i,row in enumerate(route_rows)]
        vehicles = rows(sql.SQL('''SELECT DISTINCT ON (p.vehiculo_id) p.*,v.placa,v.estado FROM posiciones_vehiculos p JOIN vehiculos v USING(vehiculo_id)
            WHERE (p.registrada_en AT TIME ZONE 'America/Lima')::date=%s''')+sql.SQL(' AND p.ruta_id=ANY(%s)' if driver_id else '')+sql.SQL(' ORDER BY p.vehiculo_id,p.registrada_en DESC'),
            (now().date(),route_ids) if driver_id else (now().date(),))
        if active_only:
            vehicles = [row for row in vehicles if row['ruta_id'] in route_ids]
        return {'depot':{'name':depots[0]['nombre'],'position':{'lat':float(depots[0]['latitud']),'lng':float(depots[0]['longitud'])}} if depots else None,
                'orders':[{'id':str(row['pedido_id']),'customer':row['cliente_nombre'],'district':row['distrito'],'status':row['estado'],
                           'position':{'lat':float(row['latitud']),'lng':float(row['longitud'])},
                           'window':row['ventana_inicio'].astimezone(LIMA).strftime('%H:%M')+'–'+row['ventana_fin'].astimezone(LIMA).strftime('%H:%M'),
                           'route_id':str(row['ruta_id']) if row['ruta_id'] else None,'stop_number':row.get('orden_entrega'),'co2_kg':None} for row in orders],
                'routes':routes,'vehicles':[{'id':str(row['vehiculo_id']),'plate':row['placa'],
                    'position':{'lat':float(row['latitud']),'lng':float(row['longitud'])},'route_id':str(row['ruta_id']) if row['ruta_id'] else None,
                    'color':next((route['color'] for route in routes if route['id']==str(row['ruta_id'])),1),
                    'status':'En ruta' if row['estado']=='EN_RUTA' else 'Disponible' if row['estado']=='DISPONIBLE' else 'Detenido'} for row in vehicles]}

    def route_map(self, driver_id=None):
        return self.map(driver_id,active_only=True)

    def driver_route(self, driver_id):
        result = self.route_rows(driver_id=driver_id)
        if not result:
            return None
        route = result[0]
        stops = rows('SELECT p.* FROM ruta_pedido rp JOIN pedidos p USING(pedido_id) WHERE ruta_id=%s AND estado<>\'CANCELADO\' ORDER BY orden_entrega',(route['ruta_id'],))
        current = next((row['pedido_id'] for row in stops if row['estado']!='ENTREGADO'),None)
        delivered = sum(row['estado']=='ENTREGADO' for row in stops)
        base, co2 = float(route['co2_base_kg']),float(route['co2_estimado_kg'])
        return {'plate':route['placa'],'driver':route['nombre_completo'],'initials':''.join(part[0] for part in route['nombre_completo'].split()[:2]),
                'delivered':delivered,'total':len(stops),'co2_saved_percent':round((base-co2)/base*100) if base else 0,'co2_saved_kg':base-co2,
                'km_remaining':sum(float(row['distancia_km']) for row in rows('SELECT distancia_km FROM tramos WHERE ruta_id=%s AND orden_tramo>%s',(route['ruta_id'],delivered))),
                'stops':[{'order_id':str(row['pedido_id']),'customer':row['cliente_nombre'],'address':row['direccion_entrega'],
                          'time':row['ventana_inicio'].astimezone(LIMA).strftime('%H:%M'),'kind':'done' if row['estado']=='ENTREGADO' else 'now' if row['pedido_id']==current else 'next'} for row in stops],
                'remaining_stops':len(stops)-delivered,'return_time':(route['generada_en'].astimezone(LIMA)+timedelta(minutes=route['tiempo_estimado_min'])).strftime('%H:%M'),
                'return_to_depot':(route.get('ruteo') or {}).get('returnToDepot',True),'depot':route['depot'],'change':None}

    def report(self, period):
        today = now().date()
        start = today-timedelta(days={'week':6,'month':29,'quarter':89}[period])
        routes = rows('''SELECT r.*,v.placa,v.tipo_combustible FROM rutas r JOIN vehiculos v USING(vehiculo_id)
            WHERE fecha_operacion BETWEEN %s AND %s ORDER BY fecha_operacion''',(start,today))
        baseline = sum(float(row['co2_base_kg']) for row in routes)
        emitted = sum(float(row['co2_estimado_kg']) for row in routes)
        by_vehicle = []
        for plate in sorted({row['placa'] for row in routes}):
            group = [row for row in routes if row['placa']==plate]
            km = sum(float(row['distancia_total_km']) for row in group)
            co2 = sum(float(row['co2_estimado_kg']) for row in group)
            by_vehicle.append({'plate':plate,'fuel':group[0]['tipo_combustible'],'km':km,'co2Kg':co2,'kgPer100Km':co2/km*100 if km else 0})
        fleet = rows("SELECT tipo_combustible FROM vehiculos WHERE estado<>'INACTIVO'")
        series = []
        for offset in range((today-start).days+1):
            day = start+timedelta(days=offset)
            group = [row for row in routes if row['fecha_operacion']==day]
            series.append({'label':day.strftime('%d/%m'),'emittedKg':sum(float(row['co2_estimado_kg']) for row in group),
                           'avoidedKg':sum(float(row['co2_base_kg']-row['co2_estimado_kg']) for row in group),'current':day==today})
        # Asignación proporcional por paradas; no multiplica las emisiones al unir pedidos.
        districts = rows('''WITH counts AS (SELECT rp.ruta_id,p.distrito,count(*) AS n FROM ruta_pedido rp JOIN pedidos p USING(pedido_id) GROUP BY rp.ruta_id,p.distrito),
            totals AS (SELECT ruta_id,sum(n) AS n FROM counts GROUP BY ruta_id)
            SELECT c.distrito,sum(r.co2_estimado_kg*c.n/t.n) AS emitted,sum(r.co2_base_kg*c.n/t.n) AS base
            FROM counts c JOIN totals t USING(ruta_id) JOIN rutas r USING(ruta_id)
            WHERE r.fecha_operacion BETWEEN %s AND %s GROUP BY c.distrito ORDER BY c.distrito''',(start,today))
        factor = rows("SELECT factor_kg_co2 FROM factores_emision WHERE combustible='DIESEL'")
        unit = 'día'
        if period != 'week':
            grouped = {}
            for offset, point in enumerate(series):
                day = start+timedelta(days=offset)
                label = f'Sem. {offset//7+1}' if period=='month' else day.strftime('%m/%Y')
                target = grouped.setdefault(label, {'label':label,'emittedKg':0,'avoidedKg':0,'current':False})
                target['emittedKg'] += point['emittedKg']
                target['avoidedKg'] += point['avoidedKg']
                target['current'] = target['current'] or point['current']
            series = list(grouped.values())
            unit = 'semana' if period=='month' else 'mes'
        return {'period':period,'subtitle':f'{start:%d/%m/%Y} – {today:%d/%m/%Y}','seriesUnit':unit,'seriesTitle':f'CO₂ emitido por {unit}',
                'baselineKg':baseline,'emittedKg':emitted,'avoidedKg':baseline-emitted,
                'fuelSavedLiters':(baseline-emitted)/float(factor[0]['factor_kg_co2']) if factor and factor[0]['factor_kg_co2'] else None,
                'kmAvoided':None,'lowEmissionFleet':{'count':sum(row['tipo_combustible'] in ('GNV','ELECTRICO','HIBRIDO') for row in fleet),'total':len(fleet)},
                'seriesBaselineKg':max((point['emittedKg']+point['avoidedKg'] for point in series),default=0),'series':series,'byVehicle':by_vehicle,
                'byDistrict':[{'district':row['distrito'],'emittedKg':float(row['emitted']),'savingPercent':round(float((row['base']-row['emitted'])/row['base'])*100) if row['base'] else 0} for row in districts],
                'opportunity':None}

    def insights(self, day, district=None):
        if district and district not in DISTRICTS:
            raise ValueError('Distrito no encontrado.')
        dashboard = PostgresDashboard()
        route_rows = dashboard.route_metrics(day,district)
        base = sum(float(row['co2_base_kg'])*(row['fraction'] or 0) for row in route_rows)
        avoided = sum(float(row['co2_base_kg']-row['co2_estimado_kg'])*(row['fraction'] or 0) for row in route_rows)
        risks = rows('''SELECT * FROM pedidos WHERE estado IN ('PENDIENTE','EN_CAMINO')
            AND (ventana_inicio AT TIME ZONE 'America/Lima')::date=%s AND ventana_fin BETWEEN %s AND %s''',(day,now(),now()+timedelta(minutes=30)))
        if district:
            risks = [row for row in risks if row['distrito']==DISTRICTS.get(district,district)]
        factor = rows("SELECT factor_kg_co2 FROM factores_emision WHERE combustible='DIESEL'")
        weekly = []
        for offset in range(6,-1,-1):
            date = day-timedelta(days=offset)
            value = sum(float(row['co2_base_kg']-row['co2_estimado_kg'])*(row['fraction'] or 0) for row in dashboard.route_metrics(date,district))
            weekly.append({'label':'LMXJVSD'[date.weekday()],'avoidedKg':float(value),'today':date==now().date()})
        return {'co2Avoided':{'avoidedKg':avoided,'avoidedPercent':avoided/base*100 if base else 0,
                'fuelSavedLiters':avoided/float(factor[0]['factor_kg_co2']) if factor and factor[0]['factor_kg_co2'] else None,'kmSaved':None,'weekly':weekly},
                'atRisk':[{'id':str(row['pedido_id']),'customer':row['cliente_nombre'],'district':row['distrito'],
                    'window':row['ventana_inicio'].astimezone(LIMA).strftime('%H:%M')+'–'+row['ventana_fin'].astimezone(LIMA).strftime('%H:%M'),
                    'status':'pending' if row['estado']=='PENDIENTE' else 'inTransit','note':'Sin conductor' if row['conductor_id'] is None else 'Ventana por vencer'} for row in risks],
                'riskMinutes':30,'suggestion':None}

    def records(self, module, driver_id=None):
        if module=='auditoria':
            return rows('''SELECT a.registrada_en AS fecha,u.nombre AS usuario,a.accion,a.entidad,a.detalle
                FROM auditoria a JOIN usuarios u USING(usuario_id) ORDER BY registrada_en DESC LIMIT 200''')
        if module=='incidencias':
            return rows(sql.SQL('''SELECT i.incidencia_id AS id,i.reportada_en AS fecha,p.cliente_nombre AS cliente,c.nombre_completo AS conductor,i.tipo,i.descripcion,i.estado
                FROM incidencias i JOIN pedidos p USING(pedido_id) JOIN conductores c ON c.conductor_id=i.conductor_id''')
                + sql.SQL(' WHERE i.conductor_id=%s' if driver_id else '') + sql.SQL(' ORDER BY reportada_en DESC LIMIT 200'), (driver_id,) if driver_id else ())
        raise ValueError('Sección no válida.')

    def create_incident(self, payload, identity):
        identifier = uuid4()
        with connection() as conn:
            order = conn.execute('SELECT conductor_id FROM pedidos WHERE pedido_id=%s FOR UPDATE',(payload['order_id'],)).fetchone()
            if not order or str(order['conductor_id'])!=identity.driver_id:
                return None
            conn.execute("INSERT INTO incidencias(incidencia_id,pedido_id,conductor_id,tipo,descripcion,estado,reportada_en) VALUES (%s,%s,%s,%s,%s,'ABIERTA',CURRENT_TIMESTAMP)",
                         (identifier,payload['order_id'],identity.driver_id,payload['type'],payload['description']))
            audit(conn,identity.subject_id,'REPORTAR_INCIDENCIA','incidencias',identifier,{})
        return {'id':str(identifier),'status':'ABIERTA'}

    def scope(self):
        pending = rows("""SELECT count(*) FILTER (WHERE latitud IS NOT NULL AND longitud IS NOT NULL) AS n,
            count(DISTINCT distrito) FILTER (WHERE latitud IS NOT NULL AND longitud IS NOT NULL) AS districts,
            count(*) FILTER (WHERE latitud IS NULL OR longitud IS NULL) AS unlocated
            FROM pedidos WHERE estado='PENDIENTE' AND conductor_id IS NULL AND (ventana_inicio AT TIME ZONE 'America/Lima')::date=%s""",(now().date(),))[0]
        depot_available = bool(rows('SELECT almacen_id FROM almacenes LIMIT 1'))
        fleet = rows('SELECT estado FROM vehiculos')
        return {'pendingOrders':pending['n'] if depot_available else 0,'districts':pending['districts'] if depot_available else 0,
                'unlocatedOrders':pending.get('unlocated',0),'depotAvailable':depot_available,
                'availableVehicles':len(rows(AVAILABLE_FLEET,(now().date(),))),
                'totalVehicles':len(fleet),'vehiclesInService':sum(row['estado']=='MANTENIMIENTO' for row in fleet)}

    def proposal(self, settings):
        return self._calculate_proposal(settings, rows, now())[0]

    def _calculate_proposal(self, settings, query, start):
        import time
        started = time.monotonic()
        orders = query("SELECT * FROM pedidos WHERE estado='PENDIENTE' AND conductor_id IS NULL AND latitud IS NOT NULL AND longitud IS NOT NULL AND (ventana_inicio AT TIME ZONE 'America/Lima')::date=%s ORDER BY ventana_inicio,pedido_id LIMIT 151",(start.date(),))
        if len(orders)>150:
            raise ValueError('Selecciona como máximo 150 pedidos para planificar.')
        fleet = query(AVAILABLE_FLEET,(start.date(),))
        depots = query('SELECT latitud,longitud,almacen_id,nombre FROM almacenes ORDER BY nombre,almacen_id LIMIT 1')
        if not depots or not fleet:
            raise ValueError('Se requiere un almacén y vehículos disponibles con conductor para planificar.')
        profiles = {row['combustible']:{'factor':float(row['factor_kg_co2']),
                    'consumption':float(row['consumo_por_km']) if row.get('consumo_por_km') is not None else None} for row in query('SELECT * FROM factores_emision')}
        config = self.parameters(query)
        depot = depots[0]
        result = propose(orders,fleet,(float(depot['latitud']),float(depot['longitud'])),profiles,config,settings,start)
        layout = [(route['plate'],[stop['id'] for stop in route['sequence']]) for route in result['routes']]
        # Detecta cambios de recursos y de secuencia sin depender de los segundos que tarda el usuario en revisar.
        source = {'day':start.date(),'orders':orders,'fleet':fleet,'depot':depot,'profiles':profiles,'config':config,'settings':settings,'layout':layout,
                  'roads':[(r.get('routing'),r.get('legs'),r['path']) for r in result['routes']]}
        result['fingerprint'] = hashlib.sha256(json.dumps(source,sort_keys=True,default=str).encode()).hexdigest()
        routes = [{'id':'proposal:'+route['plate'],'plate':route['plate'],'driver':route['driver'],'color':index%4+1,'path':route['path'],'done_until':0}
                  for index,route in enumerate(result['routes'])]
        assignments = {stop['id']:route['id'] for route,planned in zip(routes,result['routes']) for stop in planned['sequence']}
        stop_numbers = {stop['id']:index for route in result['routes'] for index,stop in enumerate(route['sequence'],1)}
        result['mapData'] = {'depot':{'name':depot.get('nombre','Almacén'),'position':{'lat':float(depot['latitud']),'lng':float(depot['longitud'])}},
            'routes':routes,'vehicles':[],
            'orders':[{'id':str(order['pedido_id']),'customer':order['cliente_nombre'],'district':order['distrito'],'status':order['estado'],
                       'position':{'lat':float(order['latitud']),'lng':float(order['longitud'])},'route_id':assignments[str(order['pedido_id'])],
                       'stop_number':stop_numbers[str(order['pedido_id'])],
                       'window':order['ventana_inicio'].astimezone(LIMA).strftime('%H:%M')+'–'+order['ventana_fin'].astimezone(LIMA).strftime('%H:%M'),
                       'co2_kg':None} for order in orders]}
        result['elapsedSeconds'] = round(time.monotonic()-started,2)
        return result, fleet, depot

    def approve_proposal(self, settings, fingerprint, actor):
        with connection() as conn, conn.transaction():
            # Bloquea los recursos durante la revalidación y el guardado de toda la propuesta.
            conn.execute('LOCK TABLE pedidos,vehiculos,conductores,usuarios,almacenes,parametros_algoritmo,factores_emision,rutas IN SHARE ROW EXCLUSIVE MODE')
            query = lambda statement, params=(): conn.execute(statement,params).fetchall()
            start = now()
            result, fleet, depot = self._calculate_proposal(settings,query,start)
            if result['fingerprint'] != fingerprint:
                raise ValueError('Los pedidos, la flota o la propuesta cambiaron. Vuelve a generar las rutas antes de aprobar.')
            if any(route['baselineCo2Kg'] is None for route in result['routes']):
                raise ValueError('Configura el factor y el consumo diésel para guardar la línea base de las rutas.')
            route_ids = []
            for route in result['routes']:
                identifier = uuid4()
                vehicle = next(row for row in fleet if row['placa']==route['plate'])
                points = route['path']
                geometry = json.dumps({'type':'LineString','coordinates':[[p['lng'],p['lat']] for p in points]})
                energy = route['fuelUsed']
                conn.execute('''INSERT INTO rutas(ruta_id,conductor_id,vehiculo_id,almacen_id,fecha_operacion,distancia_total_km,
                    tiempo_estimado_min,combustible_estimado_l,energia_estimada,unidad_energia,co2_estimado_kg,co2_base_kg,estado,geometria,generada_en)
                    VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,'GENERADA',ST_SetSRID(ST_GeomFromGeoJSON(%s),4326),%s)''',
                    (identifier,vehicle['conductor_id'],vehicle['vehiculo_id'],depot['almacen_id'],start.date(),route['km'],route['minutes'],
                     energy['amount'] if energy['unit']=='L' else None,energy['amount'],energy['unit'],route['co2Kg'],route['baselineCo2Kg'],geometry,start))
                for index, stop in enumerate(route['sequence'],1):
                    conn.execute('INSERT INTO ruta_pedido(ruta_id,pedido_id,orden_entrega) VALUES (%s,%s,%s)',(identifier,stop['id'],index))
                    conn.execute('UPDATE pedidos SET conductor_id=%s,version=version+1 WHERE pedido_id=%s',(vehicle['conductor_id'],stop['id']))
                conn.execute('UPDATE rutas SET ruteo=%s::jsonb WHERE ruta_id=%s',(json.dumps(route['routing']),identifier))
                for index,leg in enumerate(route['legs'],1):
                    origin,target,km = leg['origin'],leg['destination'],leg['km']
                    conn.execute('''INSERT INTO tramos(tramo_id,ruta_id,orden_tramo,latitud_origen,longitud_origen,latitud_destino,
                        longitud_destino,distancia_km,tiempo_estimado_min,co2_estimado_kg) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)''',
                        (uuid4(),identifier,index,origin['lat'],origin['lng'],target['lat'],target['lng'],round(km,2),round(leg['minutes']),round(km*route['co2PerKm'],2)))
                audit(conn,actor,'GENERAR_RUTA','rutas',identifier,{'pedidos':route['stops'],'placa':route['plate']})
                route_ids.append(str(identifier))
        return {'routeIds':route_ids,'ordersAssigned':result['ordersAssigned']}
