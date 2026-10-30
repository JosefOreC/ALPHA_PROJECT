"""Contratos de persistencia con conexiones simuladas; no sustituye PostgreSQL real."""
from contextlib import contextmanager
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from uuid import uuid4

import psycopg
import pytest

from domain.access_control import Identity
from domain.entities.driver import Driver
from domain.entities.vehicle import Vehicle
from domain.exceptions.driver_exceptions import DriverAlreadyExistsError
from domain.exceptions.vehicle_exceptions import VehiclePlateAlreadyExistsError
from domain.value_objects import VehicleStates
from infrastructure import security
from infrastructure.persistence import database, postgres_dashboard as dashboard, postgres_fleet as fleet, postgres_portal as portal

TODAY = datetime(2026, 10, 30, 10, tzinfo=portal.LIMA)


class Connection:
    def __init__(self, responses=None):
        self.responses = responses or {}
        self.calls = []
        self.result = []

    def execute(self, sql, params=()):
        self.calls.append((sql, params))
        self.result = next((value for fragment, value in self.responses.items() if fragment in sql), [])
        if isinstance(self.result, Exception):
            raise self.result
        return self

    def fetchone(self):
        return self.result[0] if self.result else None

    def fetchall(self):
        return self.result

    def __enter__(self):
        return self

    def __exit__(self, *args):
        return False


@pytest.fixture
def db(monkeypatch):
    conn = Connection()

    @contextmanager
    def connect():
        yield conn

    for module in (portal, fleet, security, database):
        monkeypatch.setattr(module, 'connection', connect)
    for module in (portal, fleet, dashboard):
        monkeypatch.setattr(module, 'rows', lambda sql, params=(): conn.execute(sql, params).fetchall())
    monkeypatch.setattr(portal, 'now', lambda: TODAY)
    return conn


def user(**changes):
    return dict(usuario_id=uuid4(), nombre='Ana Pérez', email='ana@example.invalid', rol='CONDUCTOR',
                estado='ACTIVO', ultimo_acceso=None, **changes)


def order(status='PENDIENTE', **changes):
    value = dict(pedido_id=uuid4(), cliente_nombre='Cliente', distrito='Ate', estado=status,
                 ventana_inicio=TODAY, ventana_fin=TODAY+timedelta(hours=2), confirmed_at=TODAY,
                 conductor_id=None, ruta_id=None, latitud=Decimal('-12'), longitud=Decimal('-77'), direccion_entrega='Calle 1')
    return {**value, **changes}


def route(**changes):
    return {**dict(ruta_id=uuid4(), placa='TST-001', tipo_combustible='DIESEL', nombre_completo='Ana Pérez',
                   depot='Central', geo={'coordinates': [[-77, -12], [-77.1, -12.1]]}, co2_base_kg=Decimal('20'),
                   co2_estimado_kg=Decimal('10'), distancia_total_km=Decimal('100'), tiempo_estimado_min=60,
                   generada_en=TODAY, fecha_operacion=TODAY.date(), fraction=1), **changes}


def parameters():
    return dict(peso_co2=50, tiempo_maximo_seg=30, carga_maxima_pct=90, holgura_ventana_min=10, reoptimizar_automaticamente=True)


def test_connection_requires_dsn_and_preserves_bound_values(monkeypatch):
    monkeypatch.delenv('DATABASE_URL', raising=False)
    with pytest.raises(database.DatabaseUnavailable):
        with database.connection():
            pytest.fail('No connection without DSN')
    conn = Connection({'SELECT': [{'n': 1}]})
    captured = []
    monkeypatch.setenv('DATABASE_URL', 'postgresql://example.invalid/test')
    monkeypatch.setattr(psycopg, 'connect', lambda dsn, **kwargs: captured.append((dsn, kwargs)) or conn)
    assert database.rows('SELECT %s AS n', ("untrusted'",)) == [{'n': 1}]
    assert conn.calls == [('SELECT %s AS n', ("untrusted'",))]
    assert captured[0][1]['connect_timeout'] == 5


def test_vehicle_repository_reads_writes_and_translates_unique_conflicts(db):
    item = Vehicle('TST-001', 500, 'DIESEL', capacidad_m3=2)
    row = dict(vehiculo_id=item.vehiculo_id, placa=item.placa, capacidad_kg=Decimal('500'), capacidad_m3=2,
               tipo_combustible='DIESEL', estado='DISPONIBLE', creado_en=TODAY)
    db.responses = {'SELECT': [row]}
    repo = fleet.PostgresVehicles()
    assert repo.find_all()[0].capacidad_kg == 500
    assert repo.find_all(VehicleStates.DISPONIBLE)[0].placa == item.placa
    assert repo.find_by_id(item.vehiculo_id).vehiculo_id == item.vehiculo_id
    assert repo.find_by_plate('tst-001').placa == 'TST-001'
    assert repo.save(item) is item and repo.update(item) is item
    assert db.calls[-1][1][-1] == item.vehiculo_id
    db.responses = {'SELECT': []}
    assert repo.find_by_id(item.vehiculo_id) is None
    assert repo.find_by_id('bad') is None
    assert repo.find_by_plate('missing') is None
    assert fleet.vehicle({**row, 'capacidad_m3': None}).capacidad_m3 is None
    db.responses = {'INSERT': psycopg.errors.UniqueViolation()}
    with pytest.raises(VehiclePlateAlreadyExistsError):
        repo.save(item)


def test_driver_repository_checks_linked_account_and_vehicle(db):
    item = Driver('Ana Pérez', '12345678', 'LIC-123', str(uuid4()), usuario_id=str(uuid4()))
    row = dict(conductor_id=item.conductor_id, nombre_completo=item.nombre_completo, dni=item.dni,
               licencia=item.licencia, vehiculo_id=item.vehiculo_id, usuario_id=item.usuario_id, estado='ACTIVO', creado_en=TODAY)
    repo = fleet.PostgresDrivers()
    db.responses = {'SELECT usuario_id': [{'usuario_id': item.usuario_id, 'rol': 'CONDUCTOR'}], 'SELECT': [row]}
    assert repo.find_all()[0].dni == item.dni
    assert repo.find_by_id(item.conductor_id).conductor_id == item.conductor_id
    assert repo.find_by_dni(item.dni).dni == item.dni
    assert repo.save(item) is item and repo.update(item) is item
    db.responses = {}
    assert repo.find_by_id('bad') is None
    assert repo.find_by_id(item.conductor_id) is None and repo.find_by_dni('missing') is None
    for account in (None, [{'usuario_id': item.usuario_id, 'rol': 'ADMIN'}]):
        db.responses = {'SELECT usuario_id': account or []}
        with pytest.raises(ValueError, match='cuenta activa'):
            repo.save(item)
    item.usuario_id = None
    with pytest.raises(ValueError, match='cuenta activa'):
        repo.save(item)
    item.vehiculo_id = 'bad'
    with pytest.raises(ValueError, match='vehículo registrado'):
        repo.update(item)
    item.vehiculo_id = str(uuid4())
    db.responses = {'UPDATE': psycopg.errors.UniqueViolation()}
    with pytest.raises(DriverAlreadyExistsError):
        repo.update(item)


def test_dashboard_aggregates_statuses_windows_and_fractional_emissions(db):
    db.responses = {'SELECT * FROM pedidos': [order(s) for s in ('ENTREGADO', 'EN_CAMINO', 'PENDIENTE', 'CANCELADO')],
                    'SELECT r.distancia': [route(fraction=0.5), route(fraction=None)]}
    service = dashboard.PostgresDashboard()
    counts = service.get_order_counts(TODAY.date(), None)
    assert counts.delivered == 1
    compliance = service.get_window_compliance(TODAY.date(), '150103')
    assert compliance.evaluated == 1 and compliance.percentage == 100
    assert service.get_fleet_distance_km(TODAY.date(), None) == 50
    assert service.get_co2_emitted_kg(TODAY.date(), None) == 5
    assert service.has_routes(TODAY.date(), None)
    db.responses = {}
    assert not service.has_routes(TODAY.date(), None)
    assert service.operating_hours().start.hour == 5
    catalog = dashboard.PostgresDistrictCatalog()
    assert len(catalog.list_districts()) == 4
    assert catalog.exists('150103') and not catalog.exists('invalid')


def test_portal_user_creation_normalizes_email_hashes_password_and_audits(db):
    service = portal.PostgresPortal()
    account = user()
    db.responses = {'SELECT rol': [{'rol': 'ADMIN'}, {'rol': 'CONDUCTOR'}], 'INSERT INTO usuarios': [account], 'SELECT * FROM usuarios': [account]}
    payload = dict(name=' Ana Pérez ', email=' ANA@EXAMPLE.INVALID ', password='Test password 123!', role='driver')
    created = service.create_user(payload, 'actor')
    assert created['role'] == 'driver' and created['lastAccess'] == 'Sin acceso'
    args = next(args for sql, args in db.calls if sql.startswith('INSERT INTO usuarios'))
    assert args[1:3] == ('Ana Pérez', 'ana@example.invalid')
    assert args[3] != payload['password'] and security.verify_password(payload['password'], args[3])
    assert any('INSERT INTO auditoria' in sql for sql, _ in db.calls)
    assert service.users()['roleCounts']['driver'] == 1
    assert portal.user_dto({**account, 'estado': 'INACTIVO', 'ultimo_acceso': TODAY})['status'] == 'inactive'
    assert service.driver_accounts() == []
    db.responses['INSERT INTO usuarios'] = psycopg.errors.UniqueViolation()
    with pytest.raises(ValueError, match='correo'):
        service.create_user(payload, 'actor')
    db.responses = {}
    with pytest.raises(ValueError, match='rol'):
        service.create_user(payload, 'actor')


@pytest.mark.parametrize('existing', [False, True])
def test_parameters_preserve_legacy_consumption_and_remove_disabled_factors(db, existing):
    db.responses = {'SELECT * FROM parametros': [parameters()], 'SELECT parametro_id': [{'parametro_id': uuid4()}] if existing else [],
                    'SELECT * FROM factores': [{'combustible': 'DIESEL', 'factor_kg_co2': Decimal('2.68'), 'consumo_por_km': Decimal('.1')},
                                               {'combustible': 'GNV', 'factor_kg_co2': 2, 'consumo_por_km': None}]}
    service = portal.PostgresPortal()
    data = service.parameters()
    assert data['emissionFactors']['DIESEL'] == 2.68 and data['fuelConsumption']['GNV'] is None
    data['emissionFactors']['GNV'] = None
    if not existing:
        data.pop('fuelConsumption')
    assert service.save_parameters(data, 'actor')['co2Weight'] == 50
    assert any('DELETE FROM factores' in sql and args == ('GNV',) for sql, args in db.calls)
    assert any('INSERT INTO auditoria' in sql for sql, _ in db.calls)
    db.responses = {}
    with pytest.raises(ValueError, match='parámetros'):
        service.parameters()


@pytest.mark.parametrize('driver_id', [None, 'driver-1'])
def test_map_preserves_geography_scopes_queries_and_vehicle_states(db, driver_id):
    r = route()
    db.responses = {'SELECT r.*': [r], 'SELECT nombre,latitud': [{'nombre': 'Central', 'latitud': -12, 'longitud': -77}],
                    'SELECT p.*': [order(ruta_id=r['ruta_id']), order()],
                    'SELECT DISTINCT': [dict(vehiculo_id=uuid4(), placa='TST-001', ruta_id=r['ruta_id'] if i == 0 else None,
                                             latitud=-12, longitud=-77, estado=state) for i, state in enumerate(('EN_RUTA','DISPONIBLE','MANTENIMIENTO'))]}
    result = portal.PostgresPortal().map(driver_id)
    assert result['routes'][0]['path'][0] == {'lat': -12, 'lng': -77}
    assert [v['status'] for v in result['vehicles']] == ['En ruta', 'Disponible', 'Detenido']
    if driver_id:
        assert any('p.conductor_id=%s' in sql and args[-1] == driver_id for sql, args in db.calls)
    db.responses = {}
    assert portal.PostgresPortal().map(driver_id)['depot'] is None


@pytest.mark.parametrize('baseline', [0, 20])
def test_driver_route_selects_next_stop_and_handles_zero_baseline(db, baseline):
    r = route(co2_base_kg=baseline)
    db.responses = {'SELECT r.*': [r], 'SELECT p.*': [order('ENTREGADO'), order(), order()], 'SELECT distancia_km': [{'distancia_km': Decimal('3.5')}]}
    result = portal.PostgresPortal().driver_route('driver-1')
    assert [stop['kind'] for stop in result['stops']] == ['done', 'now', 'next']
    assert result['delivered'] == 1 and result['km_remaining'] == 3.5
    assert result['co2_saved_percent'] == (50 if baseline else 0)
    db.responses = {}
    assert portal.PostgresPortal().driver_route('driver-1') is None


@pytest.mark.parametrize('period,unit', [('week','día'), ('month','semana'), ('quarter','mes')])
def test_sustainability_report_aggregates_routes_without_duplicating_emissions(db, period, unit):
    db.responses = {'SELECT r.*': [route(), route(placa='TST-002', distancia_total_km=0)],
                    'SELECT tipo_combustible': [{'tipo_combustible':'GNV'}, {'tipo_combustible':'DIESEL'}],
                    'WITH counts': [{'distrito':'Ate', 'emitted':Decimal('10'), 'base':Decimal('20')}, {'distrito':'Santa Anita','emitted':0,'base':0}],
                    'SELECT factor_kg_co2': [{'factor_kg_co2': 2}]}
    result = portal.PostgresPortal().report(period)
    assert result['emittedKg'] == 20 and result['avoidedKg'] == 20
    assert sum(point['emittedKg'] for point in result['series']) == 20
    assert result['seriesUnit'] == unit and result['fuelSavedLiters'] == 10
    assert result['byVehicle'][1]['kgPer100Km'] == 0
    assert result['byDistrict'][0]['savingPercent'] == 50
    db.responses = {}
    assert portal.PostgresPortal().report(period)['fuelSavedLiters'] is None


def test_insights_filters_district_and_handles_missing_metrics(db):
    db.responses = {'SELECT r.distancia': [route(), route(fraction=None)], 'SELECT * FROM pedidos': [order(), order('EN_CAMINO', conductor_id='driver-1')],
                    'SELECT factor_kg_co2': [{'factor_kg_co2': 2}]}
    result = portal.PostgresPortal().insights(TODAY.date(), '150103')
    assert result['co2Avoided']['avoidedKg'] == 10
    assert result['co2Avoided']['avoidedPercent'] == 50
    assert [r['note'] for r in result['atRisk']] == ['Sin conductor', 'Ventana por vencer']
    assert len(result['co2Avoided']['weekly']) == 7
    db.responses = {}
    result = portal.PostgresPortal().insights(TODAY.date())
    assert result['co2Avoided']['avoidedPercent'] == 0 and result['co2Avoided']['fuelSavedLiters'] is None
    with pytest.raises(ValueError, match='Distrito'):
        portal.PostgresPortal().insights(TODAY.date(), 'invalid')


def test_records_incidents_scope_and_integrations(db):
    service = portal.PostgresPortal()
    db.responses = {'SELECT * FROM integraciones': [{'integracion_id': value, 'nombre': value, 'descripcion':'Integración'} for value in ('db','map')],
                    'SELECT count(*)': [{'n': 3, 'districts': 2}], 'SELECT estado': [{'estado':'DISPONIBLE'}, {'estado':'MANTENIMIENTO'}]}
    assert [item['status'] for item in service.integrations()] == ['connected','pending']
    assert service.scope()['availableVehicles'] == 1
    for module in ('auditoria','incidencias'):
        assert service.records(module) == []
    assert service.records('incidencias','driver-1') == []
    assert db.calls[-1][1] == ('driver-1',)
    with pytest.raises(ValueError, match='Sección'):
        service.records('untrusted')
    identity = Identity('user-1','Ana','driver','driver-1')
    payload = dict(order_id=uuid4(), type='Entrega', description='Dirección incorrecta')
    assert service.create_incident(payload,identity) is None
    db.responses = {'SELECT conductor_id': [{'conductor_id':'someone-else'}]}
    assert service.create_incident(payload,identity) is None
    db.responses = {'SELECT conductor_id': [{'conductor_id':'driver-1'}]}
    assert service.create_incident(payload,identity)['status'] == 'ABIERTA'
    assert any('INSERT INTO auditoria' in sql for sql, _ in db.calls)


def test_proposal_rejects_oversized_or_unavailable_scope_and_passes_profiles(db, monkeypatch):
    service = portal.PostgresPortal()
    db.responses = {'SELECT * FROM pedidos': [order()]*151}
    with pytest.raises(ValueError, match='150'):
        service.proposal({})
    db.responses = {}
    with pytest.raises(ValueError, match='almacén'):
        service.proposal({})
    db.responses = {'SELECT * FROM pedidos': [order()], 'SELECT v.*': [{'placa':'TST-001'}],
                    'SELECT latitud': [{'latitud':-12,'longitud':-77}], 'SELECT * FROM factores': [{'combustible':'DIESEL','factor_kg_co2':2,'consumo_por_km':None}],
                    'SELECT * FROM parametros': [parameters()]}
    def optimizer(orders, vehicles, depot, profiles, config, settings, now):
        assert len(orders) == len(vehicles) == 1
        assert depot == (-12,-77) and profiles['DIESEL']['consumption'] is None
        assert settings['goal'] == 'co2'
        return {'routes': []}
    monkeypatch.setattr(portal,'propose',optimizer)
    assert service.proposal({'goal':'co2'})['elapsedSeconds'] >= 0


@pytest.mark.parametrize('scenario', ['success','unknown','inactive','password','limited'])
def test_database_login_rate_limit_invalid_credentials_and_hashed_tokens(db, monkeypatch, scenario):
    account = user()
    account['password_hash'] = 'verified-hash'
    account['estado'] = 'INACTIVO' if scenario == 'inactive' else 'ACTIVO'
    db.responses = {'SELECT count(*)': [{'n':10 if scenario == 'limited' else 0}],
                    'SELECT * FROM usuarios': [] if scenario == 'unknown' else [account]}
    checks = []
    monkeypatch.setattr(security,'verify_password',lambda password, stored: checks.append(stored) or scenario != 'password')
    result, error = security.DatabaseSessions().login('ANA@EXAMPLE.INVALID','password','client')
    if scenario == 'success':
        assert result and error is None
        token, csrf = result
        args = next(args for sql, args in db.calls if sql.startswith('INSERT INTO sesiones'))
        assert args[0] == security.token_hash(token) and args[0] != token and args[2] == csrf
        assert any('pg_advisory_xact_lock' in sql for sql, _ in db.calls)
    else:
        assert result is None and error == ('limited' if scenario == 'limited' else 'invalid')
        assert not any('INSERT INTO sesiones' in sql for sql, _ in db.calls)
        if scenario == 'unknown':
            assert 'unavailable' in checks[0]


@pytest.mark.parametrize('linked', [False, True])
def test_database_session_resolution_and_revocation(db, linked):
    row = {**user(), 'conductor_id': uuid4() if linked else None, 'placa':'TST-001', 'csrf_token':'csrf'}
    db.responses = {'SELECT u.usuario_id': [row]}
    service = security.DatabaseSessions()
    identity, csrf = service.resolve('opaque')
    assert identity.role == 'CONDUCTOR' and csrf == 'csrf'
    assert bool(identity.driver_id) == linked
    service.revoke('opaque')
    assert db.calls[-1][1] == (security.token_hash('opaque'),)
    db.responses = {}
    assert service.resolve('revoked') is None
