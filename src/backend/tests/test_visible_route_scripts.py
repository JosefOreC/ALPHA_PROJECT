"""Maintenance commands must respect the demonstration boundary and dry-run contract."""
from contextlib import contextmanager
from datetime import datetime, date, timedelta
from pathlib import Path
from uuid import uuid4
from zoneinfo import ZoneInfo
import importlib.util
import pytest
from tests.road_fixtures import TestRoadRouter

ROOT = Path(__file__).resolve().parents[3]
DAY = date(2026,11,12)
START = datetime(2026,11,12,7,tzinfo=ZoneInfo('America/Lima'))


def load(name):
    spec=importlib.util.spec_from_file_location(name,ROOT/'scripts'/f'{name}.py')
    module=importlib.util.module_from_spec(spec); spec.loader.exec_module(module)
    return module


class Database:
    def __init__(self):
        self.calls=[]; self.result=[]; self.owner='ecologistica-test-db'; self.existing=0
        self.fleet=[dict(vehiculo_id=uuid4(),conductor_id=uuid4(),placa=f'TST-00{i}',nombre_completo=f'Persona {i}',tipo_combustible='DIESEL',capacidad_kg=1000) for i in range(4)]
        self.routes=[dict(vehicle,ruta_id=uuid4(),ruteo={},estado='GENERADA',generada_en=START,latitud=-12.04,longitud=-76.96,
                          distancia_total_km=100,co2_estimado_kg=100,co2_base_kg=100) for vehicle in self.fleet]
        self.orders=[dict(pedido_id=uuid4(),cliente_nombre=f'Cliente {i}',direccion_entrega='Ficticia',distrito='Ate',estado='PENDIENTE',
                          latitud=-12.04+i*.001,longitud=-76.96+i*.001,peso_kg=5,ventana_inicio=START,ventana_fin=START+timedelta(hours=16)) for i in (1,2)]

    def execute(self, statement, params=()):
        statement=statement.as_string() if hasattr(statement,'as_string') else str(statement)
        self.calls.append((statement,params))
        if 'SELECT owner' in statement: self.result=[{'owner':self.owner}]
        elif 'SELECT count(*)' in statement: self.result=[{'n':self.existing}]
        elif 'FROM almacenes' in statement: self.result=[dict(almacen_id=uuid4(),nombre='Ficticio',latitud=-12.04,longitud=-76.96)]
        elif 'FROM parametros_algoritmo' in statement: self.result=[dict(peso_co2=70,tiempo_maximo_seg=45,carga_maxima_pct=95,holgura_ventana_min=0,reoptimizar_automaticamente=False)]
        elif 'FROM factores_emision' in statement: self.result=[dict(combustible='DIESEL',factor_kg_co2=2.68,consumo_por_km=.1)]
        elif 'SELECT r.*' in statement: self.result=self.routes
        elif 'SELECT p.*' in statement: self.result=self.orders
        elif 'FROM vehiculos v' in statement: self.result=self.fleet
        elif 'SELECT usuario_id FROM usuarios' in statement: self.result=[{'usuario_id':uuid4()}]
        else: self.result=[]
        return self

    def fetchone(self): return self.result[0] if self.result else None
    def fetchall(self): return self.result


@pytest.fixture
def commands(monkeypatch):
    database=Database()
    monkeypatch.syspath_prepend(str(ROOT/'scripts'))
    seed=load('seed_visible_routes'); refresh=load('refresh_visible_routes')
    @contextmanager
    def connection(): yield database
    for module in (seed,refresh):
        monkeypatch.setattr(module,'load_environment',lambda:None)
        monkeypatch.setattr(module,'connection',connection)
    monkeypatch.setattr('infrastructure.road_routing.ValhallaRouter',TestRoadRouter)
    monkeypatch.setattr(refresh,'ValhallaRouter',TestRoadRouter)
    return database,seed,refresh


def test_seed_dry_run_does_not_write_and_idempotence_never_duplicates_orders(commands):
    db,seed,_=commands
    assert seed.seed(DAY,True)['orders']==24
    assert not any(sql.startswith(('INSERT','UPDATE','DELETE')) for sql,_ in db.calls)
    db.calls.clear()
    result=seed.seed(DAY)
    assert result['routes']==4 and result['orders']==24
    assert sum(sql.startswith('INSERT INTO pedidos') for sql,_ in db.calls)==24
    assert sum(sql.startswith('INSERT INTO rutas') for sql,_ in db.calls)==4
    db.existing=4; db.calls.clear()
    assert seed.seed(DAY)['already_present']
    assert not any(sql.startswith('INSERT') for sql,_ in db.calls)


def test_seed_refuses_foreign_or_incomplete_demonstrations(commands):
    db,seed,_=commands
    db.owner='foreign'
    with pytest.raises(ValueError,match='base de pruebas'): seed.seed(DAY)
    db.owner='ecologistica-test-db'; db.existing=1
    with pytest.raises(ValueError,match='incompleta'): seed.seed(DAY)


@pytest.mark.parametrize('optimize',[False,True])
def test_refresh_checks_real_road_geometry_and_preserves_dry_run(commands,optimize):
    db,_,refresh=commands
    report=refresh.refresh(DAY,True,optimize)
    assert len(report['routes'])==4
    assert all(item['vertices']>2 for item in report['routes'])
    assert not any(sql.startswith(('INSERT','UPDATE','DELETE')) for sql,_ in db.calls)
    db.calls.clear()
    assert len(refresh.refresh(DAY,False,optimize)['routes'])==4
    assert sum(sql.startswith('UPDATE rutas') for sql,_ in db.calls)==4
    assert any(sql.startswith('INSERT INTO tramos') for sql,_ in db.calls)
    assert any(sql.startswith('DELETE FROM ruta_pedido') for sql,_ in db.calls)==optimize


def test_refresh_refuses_foreign_or_missing_routes_and_leaves_completed_geometry_alone(commands):
    db,_,refresh=commands
    db.owner='foreign'
    with pytest.raises(ValueError): refresh.refresh(DAY)
    db.owner='ecologistica-test-db'; db.routes=db.routes[:1]
    with pytest.raises(ValueError): refresh.refresh(DAY)
    db.routes=db.routes*4
    for route in db.routes: route['ruteo']={'provider':'Valhalla / OpenStreetMap','optimizationVersion':2}
    assert all(item['already_routed'] for item in refresh.refresh(DAY)['routes'])


@pytest.mark.parametrize('missing',['FROM almacenes','FROM vehiculos v','SELECT usuario_id FROM usuarios','FROM factores_emision'])
def test_seed_requires_every_resource_before_inserting(commands,monkeypatch,missing):
    db,seed,_=commands
    execute=db.execute
    def without(statement,params=()):
        cursor=execute(statement,params)
        if missing in str(statement): db.result=[]
        return cursor
    monkeypatch.setattr(db,'execute',without)
    with pytest.raises(ValueError): seed.seed(DAY)
    assert not any(sql.startswith('INSERT') for sql,_ in db.calls)


def test_refresh_rejects_a_recalculation_that_increases_distance(commands):
    db,_,refresh=commands
    for route in db.routes:
        route['distancia_total_km']=0; route['co2_estimado_kg']=0
    with pytest.raises(ValueError,match='no reduce'): refresh.refresh(DAY,optimize=True)
    assert not any(sql.startswith('UPDATE rutas') for sql,_ in db.calls)


def test_database_diagnostics_print_counts_without_exposing_connection_details(commands,monkeypatch,capsys):
    from types import SimpleNamespace
    import dotenv
    monkeypatch.setattr(dotenv,'load_dotenv',lambda *args,**kwargs:None)
    module=load('check_database')
    db,_,_=commands
    @contextmanager
    def connection(): yield db
    monkeypatch.setattr(module,'connection',connection)
    portal=SimpleNamespace(users=lambda:{'total':0},parameters=lambda:{'configured':True},integrations=lambda:[],map=lambda:{'orders':[]},
                           report=lambda period:{'series':[]},scope=lambda:{'pendingOrders':0},records=lambda name:[],
                           driver_route=lambda identity:None,insights=lambda day:{})
    monkeypatch.setattr(module,'PostgresPortal',lambda:portal)
    monkeypatch.setattr(module,'PostgresVehicles',lambda:SimpleNamespace(find_all=lambda:[]))
    monkeypatch.setattr(module,'PostgresDrivers',lambda:SimpleNamespace(find_all=lambda:[SimpleNamespace(conductor_id='fake')]))
    monkeypatch.setattr(module,'PostgresDashboard',lambda:SimpleNamespace(get_order_counts=lambda *args:SimpleNamespace(total=0)))
    module.main()
    output=capsys.readouterr().out
    assert 'Conexión PostgreSQL: OK' in output and 'Sin ruta hoy' in output
    assert 'postgresql://' not in output and 'password' not in output
