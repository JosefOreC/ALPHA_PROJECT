"""Integración opcional con la base configurada; toda escritura se revierte."""
import os
from contextlib import contextmanager
from datetime import datetime, timedelta
from uuid import uuid4
from zoneinfo import ZoneInfo

import pytest
from fastapi.testclient import TestClient


@pytest.fixture
def database_client(monkeypatch):
    if os.getenv('ECOLOGISTICA_VERIFY_DATABASE') != '1':
        pytest.skip('Activar ECOLOGISTICA_VERIFY_DATABASE=1 para verificar PostgreSQL con rollback.')
    import psycopg
    from psycopg.rows import dict_row, tuple_row
    from infrastructure.config import load_environment
    from infrastructure.security import hash_password
    from infrastructure.persistence.postgres_orders import PostgresOrderRepository
    from interfaces.api.deps import create_app
    from tests.road_fixtures import TestRoadRouter
    monkeypatch.setattr('infrastructure.road_routing.ValhallaRouter',TestRoadRouter)

    load_environment()
    conn = psycopg.connect(os.environ['DATABASE_URL'], row_factory=dict_row, connect_timeout=5)

    @contextmanager
    def shared_connection():
        yield conn

    class TupleConnection:
        def execute(self, *args):
            return conn.cursor(row_factory=tuple_row).execute(*args)

        def transaction(self):
            return conn.transaction()

    @contextmanager
    def order_connection():
        yield TupleConnection()

    for module in ('infrastructure.persistence.database', 'infrastructure.persistence.postgres_fleet',
                   'infrastructure.persistence.postgres_portal', 'infrastructure.security'):
        monkeypatch.setattr(f'{module}.connection', shared_connection)
    repository = PostgresOrderRepository(order_connection)
    monkeypatch.setattr('interfaces.api.deps.postgres_repository', lambda _: repository)
    identifier, email, password = uuid4(), f'{uuid4()}@integration.invalid', 'Integration-password-2026'
    try:
        conn.execute("INSERT INTO usuarios(usuario_id,nombre,email,password_hash,rol,estado) VALUES (%s,'Integration admin',%s,%s,'ADMIN','ACTIVO')",
                     (identifier,email,hash_password(password)))
        with TestClient(create_app()) as client:
            response = client.post('/api/session',json={'email':email,'password':password})
            assert response.status_code == 200
            yield client, conn, response.json()['csrf_token'], identifier
    finally:
        conn.rollback()
        conn.close()


def test_database_login_user_creation_fleet_orders_and_operational_views(database_client):
    client, conn, csrf, actor = database_client
    headers = {'X-CSRF-Token':csrf}
    email, password = f'{uuid4()}@integration.invalid', 'Driver-password-2026'
    created = client.post('/api/admin/users',headers=headers,json={
        'name':'Integration driver','email':email,'password':password,'role':'driver'})
    assert created.status_code == 201
    assert 'password' not in created.text
    user = created.json()['id']
    assert any(item['id']==user for item in client.get('/api/drivers/accounts').json())
    vehicle = client.post('/api/v1/vehicles',headers=headers,json={
        'placa':f'V{uuid4().hex[:8]}','capacidad_kg':1000,'tipo_combustible':'DIESEL'})
    assert vehicle.status_code == 201
    vehicle_id = vehicle.json()['vehiculo_id']
    driver = client.post('/api/v1/drivers',headers=headers,json={
        'nombre_completo':'Integration driver','dni':str(uuid4().int % 100000000).zfill(8),
        'licencia':uuid4().hex,'vehiculo_id':vehicle_id,'usuario_id':user})
    assert driver.status_code == 201
    driver_id = driver.json()['conductor_id']
    assert not any(item['id']==user for item in client.get('/api/drivers/accounts').json())
    factors = {fuel:None for fuel in ('DIESEL','GASOLINA','GNV','GLP','ELECTRICO','HIBRIDO')}
    factors.update(DIESEL=2.68,ELECTRICO=0)
    settings = client.put('/api/admin/parameters',headers=headers,json={
        'co2Weight':70,'maxSeconds':45,'maxLoadPercent':95,'windowSlackMinutes':10,
        'autoReoptimize':False,'emissionFactors':factors,'fuelConsumption':{'DIESEL':0.095}})
    assert settings.status_code == 200
    assert settings.json()['emissionFactors']['ELECTRICO']==0
    assert settings.json()['fuelConsumption']['DIESEL']==0.095
    # La pantalla de parámetros no envía consumo: un factor nuevo toma el consumo de referencia.
    factors.update(GNV=1.95)
    readded = client.put('/api/admin/parameters',headers=headers,json={
        'co2Weight':70,'maxSeconds':45,'maxLoadPercent':95,'windowSlackMinutes':10,'autoReoptimize':False,'emissionFactors':factors})
    assert readded.json()['emissionFactors']['GNV']==1.95
    assert readded.json()['fuelConsumption']['GNV']==0.08
    assert readded.json()['fuelConsumption']['DIESEL']==0.095
    start = datetime.now(ZoneInfo('America/Lima')).replace(hour=8,minute=0,second=0,microsecond=0)
    order = client.post('/api/pedidos',headers=headers,json={
        'customer':'Integration customer','address':'Integration address','district':'Ate',
        'window_start':start.isoformat(),'window_end':(start+timedelta(hours=10)).isoformat(),
        'weight_kg':25.0,'instructions':''})
    assert order.status_code == 201
    order_id = order.json()['id']
    assert client.get(f'/api/pedidos/{order_id}').json()['customer']=='Integration customer'
    conn.execute("UPDATE pedidos SET conductor_id=%s,latitud=-12.04,longitud=-76.95,estado='EN_CAMINO' WHERE pedido_id=%s",(driver_id,order_id))
    depot, route = uuid4(), uuid4()
    conn.execute("INSERT INTO almacenes VALUES (%s,'Integration depot','Integration address',-12.03,-76.96)",(depot,))
    conn.execute("""INSERT INTO rutas(ruta_id,conductor_id,vehiculo_id,almacen_id,fecha_operacion,
        distancia_total_km,tiempo_estimado_min,energia_estimada,unidad_energia,co2_estimado_kg,
        co2_base_kg,estado,geometria,generada_en) VALUES (%s,%s,%s,%s,%s,10,60,2,'L',5,8,
        'EN_CURSO',ST_GeomFromText('LINESTRING(-76.96 -12.03,-76.95 -12.04)',4326),%s)""",
        (route,driver_id,vehicle_id,depot,start.date(),start))
    conn.execute('INSERT INTO ruta_pedido VALUES (%s,%s,1)',(route,order_id))
    conn.execute('INSERT INTO posiciones_vehiculos VALUES (%s,%s,%s,-12.04,-76.95,%s)',(uuid4(),vehicle_id,route,start))
    for path in ('/api/admin/users','/api/admin/integrations','/api/v1/vehicles','/api/v1/drivers',
                 '/api/v1/dashboard','/api/v1/dashboard/districts','/api/dashboard/insights?district=150103',
                 '/api/map','/api/reports/sustainability?period=week','/api/reports/sustainability?period=month',
                 '/api/reports/sustainability?period=quarter','/api/routes/scope','/api/audit','/api/incidents'):
        assert client.get(path).status_code==200, path
    assert any(item['id']==str(route) for item in client.get('/api/map').json()['routes'])
    conn.execute("UPDATE usuarios SET estado='INACTIVO' WHERE usuario_id=%s",(user,))
    assert client.post('/api/session',json={'email':email,'password':password}).status_code==401
    conn.execute("UPDATE usuarios SET estado='ACTIVO' WHERE usuario_id=%s",(user,))
    assert client.delete('/api/session',headers=headers).status_code==204
    assert client.get('/api/session').status_code==401
    response = client.post('/api/session',json={'email':email,'password':password})
    assert response.status_code==200
    assert response.json()['driver_id']==driver_id
    csrf = response.json()['csrf_token']
    assigned = client.get('/api/conductor/ruta')
    assert assigned.status_code==200
    assert assigned.json()['stops'][0]['order_id']==order_id
    assert client.get('/api/routes/scope').status_code==403
    assert client.get('/api/admin/users').status_code==403
    assert client.post('/api/admin/users',headers={'X-CSRF-Token':csrf},json={
        'name':'Forbidden','email':'forbidden@integration.invalid','password':password,'role':'admin'}).status_code==403
    incident = client.post('/api/incidents',headers={'X-CSRF-Token':csrf},json={
        'order_id':order_id,'type':'Acceso','description':'Integration incident'})
    assert incident.status_code==201
    assert any(item['id']==incident.json()['id'] for item in client.get('/api/incidents').json())
    assert client.delete('/api/session',headers={'X-CSRF-Token':csrf}).status_code==204


def test_generate_preview_approve_and_reload_routes_with_real_postgis(database_client, monkeypatch):
    """Regresión: un pedido registrado desde la API debe llegar al mapa y a su conductor."""
    from infrastructure.persistence import postgres_portal
    client, conn, csrf, actor = database_client
    headers = {'X-CSRF-Token':csrf}
    start = datetime.now(ZoneInfo('America/Lima')).replace(hour=8,minute=0,second=0,microsecond=0)
    monkeypatch.setattr(postgres_portal,'now',lambda: start)
    # Aislar el alcance diario sin conservar cambios de los datos existentes.
    conn.execute("UPDATE pedidos SET estado='CANCELADO' WHERE estado='PENDIENTE' AND conductor_id IS NULL AND (ventana_inicio AT TIME ZONE 'America/Lima')::date=%s",(start.date(),))
    conn.execute("UPDATE vehiculos SET estado='MANTENIMIENTO' WHERE estado='DISPONIBLE'")
    depot = uuid4()
    conn.execute("INSERT INTO almacenes VALUES (%s,'! Routing integration depot','Test address',-12.03,-76.96)",(depot,))
    email = f'{uuid4()}@integration.invalid'
    account = client.post('/api/admin/users',headers=headers,json={
        'name':'Routing driver','email':email,'password':'Routing-test-password','role':'driver'})
    assert account.status_code==201, account.text
    vehicle = client.post('/api/v1/vehicles',headers=headers,json={
        'placa':f'R{uuid4().hex[:8]}','capacidad_kg':1000,'tipo_combustible':'DIESEL'})
    assert vehicle.status_code==201, vehicle.text
    driver = client.post('/api/v1/drivers',headers=headers,json={
        'nombre_completo':'Routing driver','dni':str(uuid4().int % 100000000).zfill(8),
        'licencia':uuid4().hex,'vehiculo_id':vehicle.json()['vehiculo_id'],'usuario_id':account.json()['id']})
    assert driver.status_code==201, driver.text
    factors = {fuel:None for fuel in ('DIESEL','GASOLINA','GNV','GLP','ELECTRICO','HIBRIDO')}
    factors['DIESEL'] = 2.68
    assert client.put('/api/admin/parameters',headers=headers,json={
        'co2Weight':70,'maxSeconds':45,'maxLoadPercent':95,'windowSlackMinutes':10,
        'autoReoptimize':False,'emissionFactors':factors,'fuelConsumption':{'DIESEL':0.09}}).status_code==200
    settings = {'goal':'co2','respectWindows':True,'prioritizeLowEmission':True}
    assert client.post('/api/routes/proposal',headers=headers,json=settings).status_code==403
    conn.execute("UPDATE usuarios SET rol='OPERADOR' WHERE usuario_id=%s",(actor,))
    payload = {'customer':'Routing customer','address':'Routing address','district':'Ate',
        'window_start':start.isoformat(),'window_end':(start+timedelta(hours=8)).isoformat(),'weight_kg':25.0}
    created = client.post('/api/pedidos',headers=headers,json=payload)
    assert created.status_code==201, created.text
    order_id = created.json()['id']
    assert client.get('/api/routes/scope').json()['unlocatedOrders']==1
    assert client.get('/api/routes/scope').json()['pendingOrders']==0
    assert not any(item['id']==order_id for item in client.get('/api/routes/map').json()['orders'])
    missing = client.post('/api/routes/proposal',headers=headers,json=settings)
    assert missing.status_code==422 and 'No hay pedidos pendientes' in missing.text
    payload.update(latitude=-12.04,longitude=-76.95)
    updated = client.put(f'/api/pedidos/{order_id}',headers=headers,json={**payload,'expected_version':1})
    assert updated.status_code==200, updated.text
    assert updated.json()['latitude']==-12.04 and updated.json()['longitude']==-76.95
    assert client.get('/api/routes/scope').json()['availableVehicles']==1
    assert any(item['id']==order_id for item in client.get('/api/routes/map').json()['orders'])
    proposal = client.post('/api/routes/proposal',headers=headers,json=settings)
    assert proposal.status_code==200, proposal.text
    plan = proposal.json()
    assert plan['ordersAssigned']==1
    assert len(plan['mapData']['routes'][0]['path'])==3
    assert plan['routes'][0]['routing']['returnToDepot'] is False
    assert plan['mapData']['orders'][0]['id']==order_id
    assert plan['mapData']['orders'][0]['route_id']==plan['mapData']['routes'][0]['id']
    approval = {'settings':settings,'fingerprint':plan['fingerprint']}
    assert client.post('/api/routes/approve',json=approval).status_code==403
    assert client.post('/api/routes/approve',headers=headers,json={**approval,'fingerprint':'0'*64}).status_code==422
    assert conn.execute('SELECT count(*) AS n FROM ruta_pedido WHERE pedido_id=%s',(order_id,)).fetchone()['n']==0
    # Un cambio de pedido invalida la vista previa, sin asignaciones parciales.
    payload['weight_kg'] = 30.0
    assert client.put(f'/api/pedidos/{order_id}',headers=headers,json={**payload,'expected_version':2}).status_code==200
    stale = client.post('/api/routes/approve',headers=headers,json=approval)
    assert stale.status_code==422 and 'cambiaron' in stale.text
    plan = client.post('/api/routes/proposal',headers=headers,json=settings).json()
    approval['fingerprint'] = plan['fingerprint']
    # Un fallo después de guardar ruta, asignaciones y tramos revierte la operación completa.
    original_audit = postgres_portal.audit
    def fail_audit(*args):
        raise ValueError('Fallo de auditoría simulado')
    monkeypatch.setattr(postgres_portal,'audit',fail_audit)
    failed = client.post('/api/routes/approve',headers=headers,json=approval)
    assert failed.status_code==422
    assert conn.execute('SELECT count(*) AS n FROM ruta_pedido WHERE pedido_id=%s',(order_id,)).fetchone()['n']==0
    assert client.get(f'/api/pedidos/{order_id}').json()['assigned'] is False
    assert conn.execute('SELECT count(*) AS n FROM rutas WHERE vehiculo_id=%s',(vehicle.json()['vehiculo_id'],)).fetchone()['n']==0
    monkeypatch.setattr(postgres_portal,'audit',original_audit)
    saved = client.post('/api/routes/approve',headers=headers,json=approval)
    assert saved.status_code==201, saved.text
    route_id = saved.json()['routeIds'][0]
    assert client.get('/api/routes/scope').json()['pendingOrders']==0
    assert client.get('/api/routes/scope').json()['availableVehicles']==0
    map_data = client.get('/api/map').json()
    assert next(row for row in map_data['orders'] if row['id']==order_id)['route_id']==route_id
    assert next(row for row in map_data['routes'] if row['id']==route_id)['path']==plan['routes'][0]['path']
    stored = conn.execute('SELECT estado,ST_IsValid(geometria) AS valid FROM rutas WHERE ruta_id=%s',(route_id,)).fetchone()
    assert stored=={'estado':'GENERADA','valid':True}
    assert conn.execute('SELECT count(*) AS n FROM tramos WHERE ruta_id=%s',(route_id,)).fetchone()['n']==1
    assert conn.execute('SELECT ruteo FROM rutas WHERE ruta_id=%s',(route_id,)).fetchone()['ruteo']['provider']=='Test network'
    assert client.get(f'/api/pedidos/{order_id}').json()['assigned'] is True
    assert client.post('/api/routes/approve',headers=headers,json=approval).status_code==422
    assert conn.execute('SELECT count(*) AS n FROM ruta_pedido WHERE pedido_id=%s',(order_id,)).fetchone()['n']==1
    # Un pedido en camino permanece en seguimiento y no vuelve al generador.
    conn.execute("UPDATE pedidos SET estado='EN_CAMINO' WHERE pedido_id=%s",(order_id,))
    route_map = client.get('/api/routes/map')
    assert route_map.status_code==200,route_map.text
    assert next(row for row in route_map.json()['orders'] if row['id']==order_id)['status']=='EN_CAMINO'
    assert client.get('/api/routes/scope').json()['pendingOrders']==0
    assert client.post('/api/routes/proposal',headers=headers,json=settings).status_code==422
    # El conductor consulta la ruta desde su propia sesión y los datos guardados.
    assert client.delete('/api/session',headers=headers).status_code==204
    logged = client.post('/api/session',json={'email':email,'password':'Routing-test-password'})
    assert logged.status_code==200, logged.text
    assigned = client.get('/api/conductor/ruta')
    assert assigned.status_code==200, assigned.text
    assert assigned.json()['stops'][0]['order_id']==order_id
    assert client.post('/api/routes/approve',headers={'X-CSRF-Token':logged.json()['csrf_token']},json=approval).status_code==403
