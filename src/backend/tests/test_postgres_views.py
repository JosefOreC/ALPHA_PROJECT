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
        'autoReoptimize':False,'emissionFactors':factors})
    assert settings.status_code == 200
    assert settings.json()['emissionFactors']['ELECTRICO']==0
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
