from datetime import date
from pathlib import Path
from fastapi.responses import PlainTextResponse
from fastapi.testclient import TestClient
from domain.access_control import Identity
from domain.value_objects import VehicleStates
from infrastructure.persistence.memory_orders import MemoryOrderRepository
from infrastructure.persistence import postgres_fleet as fleet, postgres_dashboard as dashboard
from interfaces.api.deps import create_app
from tests.test_postgres_services import db, user, order, route, TODAY


def test_projected_sql_pages_bind_filters_and_scope_before_offset(db):
    from uuid import uuid4
    vehicle=dict(vehiculo_id=uuid4(),placa='TST-001',capacidad_kg=500,capacidad_m3=None,tipo_combustible='DIESEL',estado='DISPONIBLE',creado_en=TODAY)
    driver=dict(conductor_id=uuid4(),usuario_id=uuid4(),nombre_completo='Persona',dni='12345678',licencia='LIC',vehiculo_id=vehicle['vehiculo_id'],estado='ACTIVO',creado_en=TODAY)
    db.responses={'SELECT count(*)':[{'n':1}], 'FROM vehiculos':[vehicle], 'FROM conductores':[driver]}
    items,total=fleet.PostgresVehicles().find_page(status=VehicleStates.DISPONIBLE,query="%_'",limit=1,offset=2)
    assert len(items)==total==1
    assert db.calls[-1][1][-2:]==(1,2) and '\\%' in db.calls[-1][1][0]
    assert 'LIMIT %s OFFSET %s' in db.calls[-1][0] and "%'" not in db.calls[-1][0]
    fleet.PostgresVehicles().find_page()
    repo=fleet.PostgresDrivers()
    assert repo.find_page(driver_id=str(driver['conductor_id']),limit=1)[1]==1
    assert 'WHERE conductor_id=%s' in db.calls[-1][0]
    assert db.calls[-1][1][0]==str(driver['conductor_id'])
    repo.find_page()


def test_summary_reuses_rows_within_one_request_but_not_between_requests(db):
    db.responses={'FROM pedidos WHERE':[order()], 'SELECT r.distancia':[route()]}
    metrics=dashboard.PostgresDashboard(cache=True)
    metrics.get_order_counts(TODAY.date(),None); metrics.get_window_compliance(TODAY.date(),None)
    metrics.has_routes(TODAY.date(),None); metrics.get_fleet_distance_km(TODAY.date(),None); metrics.get_co2_emitted_kg(TODAY.date(),None)
    assert len(db.calls)==2
    dashboard.PostgresDashboard(cache=True).get_order_counts(TODAY.date(),None)
    assert len(db.calls)==3


def test_memory_adapters_preserve_the_same_page_and_scope_contract():
    from domain.entities.driver import Driver
    from domain.entities.vehicle import Vehicle
    from infrastructure.persistence.in_memory_driver_repository import InMemoryDriverRepository
    from infrastructure.persistence.in_memory_vehicle_repository import InMemoryVehicleRepository
    drivers=InMemoryDriverRepository()
    own=drivers.save(Driver('Persona Uno','12345678','LIC-001','v1'))
    drivers.save(Driver('Persona Dos','87654321','LIC-002','v2'))
    assert drivers.find_page(limit=1,driver_id=own.conductor_id)==([own],1)
    assert drivers.find_page(limit=1,offset=1,driver_id=own.conductor_id)==([],1)
    assert drivers.find_page(driver_id='another-user')==([],0)
    assert drivers.find_page(limit=1)[1]==2
    vehicles=InMemoryVehicleRepository([Vehicle('TST-001',500,'DIESEL'),Vehicle('TST-002',300,'GNV')])
    assert vehicles.find_page(query='diesel',limit=1)[1]==1
    assert vehicles.find_page(query='missing')==([],0)
    assert vehicles.find_page(limit=1,offset=1)[1]==2


def test_record_pages_keep_authorization_scope_and_reject_invalid_account_data():
    import pytest
    from pydantic import ValidationError
    from interfaces.api.portal.deps import get_portal
    from interfaces.api.portal.router import CreateUser, Parameters
    actor=[Identity('admin','Persona','admin')]
    app=create_app(MemoryOrderRepository(),lambda:actor[0],lambda:None)
    calls=[]
    class Portal:
        def records(self,module,driver_id=None,**paging):
            calls.append((module,driver_id,paging)); return []
    app.dependency_overrides[get_portal]=Portal
    client=TestClient(app)
    assert client.get('/api/audit?limit=20&offset=40').status_code==200
    assert calls[-1]==('auditoria',None,{'limit':21,'offset':40})
    assert client.get('/api/incidents?limit=20').status_code==200
    actor[0]=Identity('driver','Persona','driver',driver_id='driver-1')
    assert client.get('/api/incidents?limit=20&offset=20').status_code==200
    assert calls[-1]==('incidencias','driver-1',{'limit':21,'offset':20})
    assert client.get('/api/audit?limit=20').status_code==403
    for changes in ({'name':'  '},{'email':'invalid-mail'}):
        with pytest.raises(ValidationError):
            CreateUser.model_validate(dict(name='Persona',email='persona@example.invalid',password='only-a-fixture-password',role='driver') | changes)
    with pytest.raises(ValueError): Parameters.valid_factors({'DIESEL':1})


def test_production_hosting_sets_csp_and_only_fingerprinted_assets_are_immutable(tmp_path):
    (tmp_path/'assets').mkdir(); (tmp_path/'maps').mkdir()
    (tmp_path/'index.html').write_text('<html>Production</html>')
    (tmp_path/'favicon.svg').write_text('<svg/>')
    (tmp_path/'assets/app-AbCd1234.js').write_text('const value=1;')
    app=create_app(MemoryOrderRepository(),lambda:Identity('u','Persona','planner'),lambda:None,frontend_dist=tmp_path)
    @app.get('/api/export')
    def export(): return PlainTextResponse('not JSON')
    client=TestClient(app)
    assert 'Production' in client.get('/').text
    assert "script-src 'self'" in client.get('/').headers['content-security-policy']
    assert client.get('/favicon.svg').status_code==200
    assert 'immutable' in client.get('/assets/app-AbCd1234.js').headers['cache-control']
    assert client.get('/assets/missing.js').status_code==404
    assert client.get('/api/export').headers['cache-control']=='no-store'
    import pytest
    with pytest.raises(ValueError,match='FRONTEND_DIST'):
        create_app(MemoryOrderRepository(),lambda:None,frontend_dist=tmp_path/'missing')
