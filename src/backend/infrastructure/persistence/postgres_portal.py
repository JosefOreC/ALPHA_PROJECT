"""Consultas operativas del esquema PostgreSQL compartido por todas las vistas."""
import json
from datetime import datetime, timedelta
from uuid import uuid4
from zoneinfo import ZoneInfo
from domain.access_control import canonical_role
from domain.planning import propose
from infrastructure.persistence.database import connection, rows
from infrastructure.security import hash_password
from infrastructure.persistence.postgres_dashboard import DISTRICTS, PostgresDashboard

LIMA = ZoneInfo('America/Lima')
FUELS = ('DIESEL','GASOLINA','GLP','GNV','ELECTRICO','HIBRIDO')


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

    def parameters(self):
        result = rows('SELECT * FROM parametros_algoritmo ORDER BY actualizado_en DESC LIMIT 1')
        if not result:
            raise ValueError('No hay parámetros configurados en la base de datos.')
        row = result[0]
        factors = {fuel:None for fuel in FUELS}
        factors.update({item['combustible']:float(item['factor_kg_co2']) for item in rows('SELECT * FROM factores_emision')})
        return {'co2Weight':row['peso_co2'],'maxSeconds':row['tiempo_maximo_seg'],'maxLoadPercent':row['carga_maxima_pct'],
                'windowSlackMinutes':row['holgura_ventana_min'],'autoReoptimize':row['reoptimizar_automaticamente'],'emissionFactors':factors}

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
            for fuel, factor in data['emissionFactors'].items():
                if factor is None:
                    conn.execute('DELETE FROM factores_emision WHERE combustible=%s',(fuel,))
                else:
                    conn.execute('''INSERT INTO factores_emision(combustible,factor_kg_co2,unidad,fuente) VALUES (%s,%s,%s,'Configurado por administración')
                        ON CONFLICT(combustible) DO UPDATE SET factor_kg_co2=EXCLUDED.factor_kg_co2,fuente=EXCLUDED.fuente''',
                        (fuel,factor,'kWh' if fuel=='ELECTRICO' else 'm3' if fuel=='GNV' else 'L'))
            audit(conn,actor,'ACTUALIZAR_PARAMETROS','parametros_algoritmo',identifier,{})
        return self.parameters()

    def integrations(self):
        result = rows('SELECT * FROM integraciones ORDER BY nombre')
        return [{'id':row['integracion_id'],'name':row['nombre'],'description':row['descripcion'],
                 'status':'connected' if row['integracion_id']=='db' else 'pending'} for row in result]

    def route_rows(self, day=None, driver_id=None):
        return rows('''SELECT r.*,v.placa,v.tipo_combustible,c.nombre_completo,a.nombre AS depot,ST_AsGeoJSON(r.geometria)::json AS geo
            FROM rutas r JOIN vehiculos v USING(vehiculo_id) JOIN conductores c USING(conductor_id) JOIN almacenes a USING(almacen_id)
            WHERE fecha_operacion=%s''' + (' AND r.conductor_id=%s' if driver_id else '') + ' ORDER BY v.placa',
            (day or now().date(),driver_id) if driver_id else (day or now().date(),))

    def map(self, driver_id=None):
        route_rows = self.route_rows(driver_id=driver_id)
        route_ids = [row['ruta_id'] for row in route_rows]
        depots = rows('SELECT nombre,latitud,longitud FROM almacenes ORDER BY nombre LIMIT 1')
        orders = rows('''SELECT p.*,rp.ruta_id FROM pedidos p LEFT JOIN ruta_pedido rp USING(pedido_id)
            WHERE (ventana_inicio AT TIME ZONE 'America/Lima')::date=%s AND latitud IS NOT NULL AND longitud IS NOT NULL'''
            + (' AND p.conductor_id=%s' if driver_id else ''),(now().date(),driver_id) if driver_id else (now().date(),))
        routes = [{'id':str(row['ruta_id']),'plate':row['placa'],'color':i%4+1,
                   'path':[{'lat':point[1],'lng':point[0]} for point in row['geo']['coordinates']], 'done_until':0} for i,row in enumerate(route_rows)]
        vehicles = rows('''SELECT DISTINCT ON (p.vehiculo_id) p.*,v.placa,v.estado FROM posiciones_vehiculos p JOIN vehiculos v USING(vehiculo_id)
            WHERE (p.registrada_en AT TIME ZONE 'America/Lima')::date=%s'''+(' AND p.ruta_id=ANY(%s)' if driver_id else '')+' ORDER BY p.vehiculo_id,p.registrada_en DESC',
            (now().date(),route_ids) if driver_id else (now().date(),))
        return {'depot':{'name':depots[0]['nombre'],'position':{'lat':float(depots[0]['latitud']),'lng':float(depots[0]['longitud'])}} if depots else None,
                'orders':[{'id':str(row['pedido_id']),'customer':row['cliente_nombre'],'district':row['distrito'],'status':row['estado'],
                           'position':{'lat':float(row['latitud']),'lng':float(row['longitud'])},
                           'window':row['ventana_inicio'].astimezone(LIMA).strftime('%H:%M')+'–'+row['ventana_fin'].astimezone(LIMA).strftime('%H:%M'),
                           'route_id':str(row['ruta_id']) if row['ruta_id'] else None,'co2_kg':None} for row in orders],
                'routes':routes,'vehicles':[{'id':str(row['vehiculo_id']),'plate':row['placa'],
                    'position':{'lat':float(row['latitud']),'lng':float(row['longitud'])},'route_id':str(row['ruta_id']) if row['ruta_id'] else None,
                    'color':next((route['color'] for route in routes if route['id']==str(row['ruta_id'])),1),
                    'status':'En ruta' if row['estado']=='EN_RUTA' else 'Disponible' if row['estado']=='DISPONIBLE' else 'Detenido'} for row in vehicles]}

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
                'depot':route['depot'],'change':None}

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
            return rows('''SELECT i.incidencia_id AS id,i.reportada_en AS fecha,p.cliente_nombre AS cliente,c.nombre_completo AS conductor,i.tipo,i.descripcion,i.estado
                FROM incidencias i JOIN pedidos p USING(pedido_id) JOIN conductores c ON c.conductor_id=i.conductor_id'''
                + (' WHERE i.conductor_id=%s' if driver_id else '') + ' ORDER BY reportada_en DESC LIMIT 200', (driver_id,) if driver_id else ())
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
        pending = rows("SELECT count(*) AS n,count(DISTINCT distrito) AS districts FROM pedidos WHERE estado='PENDIENTE' AND conductor_id IS NULL AND (ventana_inicio AT TIME ZONE 'America/Lima')::date=%s",(now().date(),))[0]
        fleet = rows('SELECT estado FROM vehiculos')
        return {'pendingOrders':pending['n'],'districts':pending['districts'],'availableVehicles':sum(row['estado']=='DISPONIBLE' for row in fleet),
                'totalVehicles':len(fleet),'vehiclesInService':sum(row['estado']=='MANTENIMIENTO' for row in fleet)}

    def proposal(self, settings):
        import time
        started = time.monotonic()
        orders = rows("SELECT * FROM pedidos WHERE estado='PENDIENTE' AND conductor_id IS NULL AND (ventana_inicio AT TIME ZONE 'America/Lima')::date=%s ORDER BY ventana_inicio LIMIT 151",(now().date(),))
        if len(orders)>150:
            raise ValueError('Selecciona como máximo 150 pedidos para planificar.')
        fleet = rows("""SELECT v.*,c.nombre_completo FROM vehiculos v JOIN conductores c USING(vehiculo_id)
            WHERE v.estado='DISPONIBLE' AND c.estado='ACTIVO' AND NOT EXISTS
            (SELECT 1 FROM rutas r WHERE r.fecha_operacion=%s AND (r.vehiculo_id=v.vehiculo_id OR r.conductor_id=c.conductor_id)) ORDER BY placa LIMIT 15""",(now().date(),))
        depots = rows('SELECT latitud,longitud FROM almacenes ORDER BY nombre LIMIT 1')
        if not depots or not fleet:
            raise ValueError('Se requiere un almacén y vehículos disponibles con conductor para planificar.')
        factors = {row['combustible']:float(row['factor_kg_co2']) for row in rows('SELECT * FROM factores_emision')}
        result = propose(orders,fleet,(float(depots[0]['latitud']),float(depots[0]['longitud'])),factors,self.parameters(),settings,now())
        result['elapsedSeconds'] = round(time.monotonic()-started,2)
        return result
