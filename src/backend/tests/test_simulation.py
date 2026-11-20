"""El laboratorio calcula con el motor real sin consultar ni escribir PostgreSQL."""
from copy import deepcopy
import pytest
from fastapi.testclient import TestClient
from domain.access_control import GRANTS, Identity
from interfaces.api.deps import create_app
from interfaces.api.simulation.schemas import Scenario
from application.use_cases.generate_routes import simulate_routes
from functools import partial
from infrastructure.road_routing import road_proposal
from interfaces.api.simulation.deps import get_simulation_router
from tests.road_fixtures import TestRoadRouter
from domain.road_network import RoadServiceUnavailable


def scenario():
    return {'vehicles': [{'id': 'M1', 'lat': -12.04, 'lng': -76.96, 'capacity': 10}],
            'orders': [{'id': 'P1', 'lat': -12.043, 'lng': -76.956, 'weight': 5, 'fromMinute': 0, 'toMinute': 480}]}


def client(role='admin'):
    app = create_app(authenticate=lambda: Identity('test', 'Test', role), protect_mutation=lambda: None, persistent=False)
    app.dependency_overrides[get_simulation_router] = lambda: TestRoadRouter()
    return TestClient(app)


def test_admin_has_every_known_permission_but_unknown_permissions_stay_denied():
    from domain.access_control import can
    assert all(can('admin', permission) for permission in GRANTS)
    assert not can('admin', 'invented')


@pytest.mark.parametrize('role', ['admin', 'planner'])
def test_simulation_uses_real_costs_without_persistence(role, monkeypatch):
    import infrastructure.persistence.database as db
    def forbidden(*args, **kwargs):
        raise AssertionError('La simulación no debe consultar PostgreSQL')
    monkeypatch.setattr(db, 'connection', forbidden)
    response = client(role).post('/api/routes/simulate', json=scenario())
    assert response.status_code == 200
    result = response.json()
    assert result['simulation'] and result['totalKm'] > 0
    assert result['ordersAssigned'] == 1
    assert result['routes'][0]['path'][0] == {'lat': -12.04, 'lng': -76.96}
    assert result['routes'][0]['path'][-1] == {'lat': -12.043, 'lng': -76.956}
    assert len(result['routes'][0]['path']) == 3
    assert result['routes'][0]['routing']['provider'] == 'Test network'
    assert 'fingerprint' not in result


def calculate(data, router=None):
    return simulate_routes(Scenario(**data).model_dump(), partial(road_proposal, router=router or TestRoadRouter()))


def test_return_uses_road_costs_and_preserves_the_vehicle_origin():
    data = scenario()
    first = calculate(data)
    data['settings'] = {'returnToDepot': True}
    second = calculate(data)
    assert second['totalKm'] == pytest.approx(first['totalKm'] * 2, abs=.02)
    assert second['routes'][0]['minutes'] > first['routes'][0]['minutes']
    path = second['routes'][0]['path']
    assert path[0] == path[-1] == {'lat': -12.04, 'lng': -76.96}


def test_each_vehicle_starts_from_its_own_position():
    data = scenario()
    data['vehicles'] = [{'id': 'M1', 'lat': -12.04, 'lng': -76.96, 'capacity': 5},
                        {'id': 'M2', 'lat': -12.06, 'lng': -76.98, 'capacity': 5}]
    data['orders'] = [{**data['orders'][0], 'lat': -12.041, 'lng': -76.96},
                      {**data['orders'][0], 'id': 'P2', 'lat': -12.061, 'lng': -76.98}]
    result = calculate(data)
    assert result['routeCount'] == 2
    routes = {r['plate']: r for r in result['routes']}
    assert routes['M1']['sequence'][0]['id'] == 'P1'
    assert routes['M2']['sequence'][0]['id'] == 'P2'
    assert routes['M1']['path'][0] == {'lat': -12.04, 'lng': -76.96}
    assert routes['M2']['path'][0] == {'lat': -12.06, 'lng': -76.98}
    assert result['totalKm'] == pytest.approx(sum(r['km'] for r in result['routes']), abs=.02)


def test_simulation_reports_road_outage_without_straight_line_fallback():
    class Offline(TestRoadRouter):
        def matrix(self, *args):
            raise RoadServiceUnavailable('Proveedor vial no disponible')
    api = client()
    api.app.dependency_overrides[get_simulation_router] = lambda: Offline()
    response = api.post('/api/routes/simulate', json=scenario())
    assert response.status_code == 503
    assert 'Proveedor vial' in response.json()['detail']


def test_provider_road_distances_are_used_instead_of_geographic_shortcuts():
    from domain.road_network import RoadNetwork
    class Detour(TestRoadRouter):
        def matrix(self, points, *args):
            return RoadNetwork({(a, b): (0, 0) if a == b else (5, 10) for a in points for b in points})

        def route(self, points, mode, *args):
            value = super().route(points, mode)
            for leg in value['legs']:
                leg.update(km=5, minutes=10)
            return value
    result = calculate(scenario(), Detour())
    assert result['totalKm'] == 5
    assert result['co2Kg'] == 1.34
    assert len(result['routes'][0]['path']) == 3


def test_default_composition_uses_the_production_road_provider(monkeypatch):
    from interfaces.api.simulation import deps
    expected = object()
    monkeypatch.setattr(deps.road_routing, 'ValhallaRouter', lambda budget: expected if budget == 45 else None)
    assert deps.get_simulation_router() is expected


@pytest.mark.parametrize('role', ['driver', 'logistics', 'auditor'])
def test_readonly_roles_cannot_simulate(role):
    assert client(role).post('/api/routes/simulate', json=scenario()).status_code == 403


@pytest.mark.parametrize('change', ['empty', 'duplicate', 'capacity', 'window', 'coordinate', 'limit', 'legacy', 'extra'])
def test_invalid_or_infeasible_scenarios_explain_the_failure(change):
    data = deepcopy(scenario())
    if change == 'empty': data['vehicles'] = []
    if change == 'duplicate': data['orders'] *= 2
    if change == 'capacity': data['vehicles'][0]['capacity'] = 1
    if change == 'window': data['orders'][0]['toMinute'] = 0
    if change == 'coordinate': data['orders'][0]['lng'] = -78
    if change == 'limit': data['orders'] = [{**data['orders'][0], 'id': str(i)} for i in range(51)]
    if change == 'legacy': data['speedKmh'] = 25
    if change == 'extra': data['orders'][0]['persist'] = True
    assert client().post('/api/routes/simulate', json=data).status_code == 422


def test_simulation_requires_authentication_and_csrf():
    assert TestClient(create_app(persistent=False)).post('/api/routes/simulate', json=scenario()).status_code == 401
    app = create_app(authenticate=lambda: Identity('a', 'Admin', 'admin'), persistent=False)
    assert TestClient(app).post('/api/routes/simulate', json=scenario()).status_code == 403
