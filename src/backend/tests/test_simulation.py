"""El laboratorio calcula con el motor real sin consultar ni escribir PostgreSQL."""
from copy import deepcopy
import pytest
from fastapi.testclient import TestClient
from domain.access_control import GRANTS, Identity
from interfaces.api.deps import create_app
from interfaces.api.simulation.schemas import Scenario
from application.use_cases.generate_routes import simulate_routes


def scenario():
    return {'vehicles': [{'id': 'M1', 'x': 0, 'y': 0, 'capacity': 10}],
            'orders': [{'id': 'P1', 'x': 3, 'y': 4, 'weight': 5, 'fromMinute': 0, 'toMinute': 480}]}


def client(role='admin'):
    return TestClient(create_app(authenticate=lambda: Identity('test', 'Test', role), protect_mutation=lambda: None, persistent=False))


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
    assert result['simulation'] and result['totalKm'] == 5
    assert result['ordersAssigned'] == 1
    assert result['routes'][0]['points'] == [{'x': 0, 'y': 0}, {'x': 3, 'y': 4}]
    assert 'fingerprint' not in result


def test_positions_return_and_speed_change_the_result():
    data = scenario()
    first = simulate_routes(Scenario(**data).model_dump())
    data['settings'] = {'returnToDepot': True}
    data['speedKmh'] = 5
    second = simulate_routes(Scenario(**data).model_dump())
    assert first['totalKm'] == 5 and second['totalKm'] == 10
    assert second['routes'][0]['minutes'] > first['routes'][0]['minutes']
    data['vehicles'][0]['x'] = 3
    data['vehicles'][0]['y'] = 4
    assert simulate_routes(Scenario(**data).model_dump())['totalKm'] == 0


def test_each_vehicle_starts_from_its_own_position():
    data = scenario()
    data['vehicles'] = [{'id': 'M1', 'x': 0, 'y': 0, 'capacity': 5}, {'id': 'M2', 'x': 20, 'y': 0, 'capacity': 5}]
    data['orders'] = [{**data['orders'][0], 'x': 1, 'y': 0}, {**data['orders'][0], 'id': 'P2', 'x': 19, 'y': 0}]
    result = simulate_routes(Scenario(**data).model_dump())
    assert result['routeCount'] == 2 and result['totalKm'] == 2
    assert {r['plate']: r['sequence'][0]['id'] for r in result['routes']} == {'M1': 'P1', 'M2': 'P2'}


@pytest.mark.parametrize('role', ['driver', 'logistics', 'auditor'])
def test_readonly_roles_cannot_simulate(role):
    assert client(role).post('/api/routes/simulate', json=scenario()).status_code == 403


@pytest.mark.parametrize('change', ['empty', 'duplicate', 'capacity', 'window', 'coordinate', 'limit', 'speed', 'extra'])
def test_invalid_or_infeasible_scenarios_explain_the_failure(change):
    data = deepcopy(scenario())
    if change == 'empty': data['vehicles'] = []
    if change == 'duplicate': data['orders'] *= 2
    if change == 'capacity': data['vehicles'][0]['capacity'] = 1
    if change == 'window': data['orders'][0]['toMinute'] = 0
    if change == 'coordinate': data['orders'][0]['x'] = 101
    if change == 'limit': data['orders'] = [{**data['orders'][0], 'id': str(i)} for i in range(51)]
    if change == 'speed': data['speedKmh'] = 0
    if change == 'extra': data['orders'][0]['persist'] = True
    assert client().post('/api/routes/simulate', json=data).status_code == 422


def test_simulation_requires_authentication_and_csrf():
    assert TestClient(create_app(persistent=False)).post('/api/routes/simulate', json=scenario()).status_code == 401
    app = create_app(authenticate=lambda: Identity('a', 'Admin', 'admin'), persistent=False)
    assert TestClient(app).post('/api/routes/simulate', json=scenario()).status_code == 403
