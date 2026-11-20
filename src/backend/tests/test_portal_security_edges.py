"""Boundary checks for credentials and role-scoped operational endpoints."""
from unittest.mock import MagicMock

import pytest

from domain.email import is_email
from interfaces.api.portal import router as portal
from tests.test_sessions import setup, login


@pytest.mark.parametrize('value', ['a@b.cd', ' User@Example.Invalid '])
def test_email_normalization_accepts_bounded_addresses(value):
    assert portal.normalize_email(value) == value.strip().lower()


@pytest.mark.parametrize('value', ['no-at.example', 'a@@b.cd', 'a@.cd', 'a@b.', 'a b@c.de', 'x' * 256 + '@a.bc'])
def test_email_validation_rejects_invalid_and_oversized_input(value):
    assert not is_email(value)
    with pytest.raises(ValueError):
        portal.normalize_email(value)


@pytest.mark.parametrize('operation,payload', [
    ('email', {'email': 'valid@example.invalid'}),
    ('password', {'password': 'synthetic-test-password'}),
    ('', {'email': 'valid@example.invalid'}),
])
@pytest.mark.parametrize('exists', [True, False])
def test_account_updates_report_missing_users_and_require_csrf(operation, payload, exists):
    client, _, repository = setup()
    repository.update_user_email = MagicMock(return_value=exists)
    repository.reset_user_password = MagicMock(return_value=exists)
    repository.update_credentials = MagicMock(return_value=exists)
    login(client)
    path = '/api/admin/users/00000000-0000-0000-0000-000000000002' + ('/' + operation if operation else '')
    method = client.put if operation else client.patch
    assert method(path, json=payload).status_code == 403
    assert method(path, json=payload, headers={'X-CSRF-Token': 'csrf-secret'}).status_code == (204 if exists else 404)


@pytest.mark.parametrize('role,driver_id,has_route,expected', [
    ('admin', None, False, 403), ('driver', None, False, 403),
    ('driver', 'linked-driver', False, 404), ('driver', 'linked-driver', True, 200),
])
def test_driver_route_requires_linked_driver_and_handles_absent_route(role, driver_id, has_route, expected):
    client, sessions, repository = setup()
    login(client)
    sessions.role, sessions.driver_id = role, driver_id
    repository.driver_route = MagicMock(return_value={'id': 'route'} if has_route else None)
    assert client.get('/api/conductor/ruta').status_code == expected


@pytest.mark.parametrize('role,driver_id,expected', [('admin', None, 200), ('driver', 'linked', 200), ('driver', None, 403), ('logistics', None, 200)])
def test_incidents_are_scoped_to_role_and_driver(role, driver_id, expected):
    client, sessions, repository = setup()
    login(client)
    sessions.role, sessions.driver_id = role, driver_id
    repository.records = MagicMock(return_value=[])
    assert client.get('/api/incidents').status_code == expected
    if expected == 200:
        assert repository.records.call_args.args == (('incidencias', driver_id) if driver_id else ('incidencias',))


@pytest.mark.parametrize('role,expected', [('admin', 200), ('driver', 403)])
def test_global_incident_order_choices_are_restricted(role, expected):
    client, sessions, repository = setup()
    login(client)
    sessions.role = role
    repository.incident_order_choices = MagicMock(return_value=[])
    assert client.get('/api/incidents/order-options').status_code == expected


@pytest.mark.parametrize('exists', [True, False])
def test_incident_creation_honors_repository_assignment_check(exists):
    client, _, repository = setup()
    login(client)
    repository.create_incident = MagicMock(return_value={'id': 'incident'} if exists else None)
    result = client.post('/api/incidents', json={
        'order_id': '00000000-0000-0000-0000-000000000002', 'type': 'Entrega', 'description': 'Synthetic incident',
    }, headers={'X-CSRF-Token': 'csrf-secret'})
    assert result.status_code == (201 if exists else 404)


def test_explicit_null_credential_fields_require_a_real_change():
    assert portal.UpdateAccountCredentials(email=None, password='synthetic-test-password').email is None
    with pytest.raises(ValueError):
        portal.UpdateAccountCredentials(email=None, password=None)


def test_blank_user_name_is_rejected_after_trimming():
    with pytest.raises(ValueError):
        portal.CreateUser(name='   ', email='valid@example.invalid', password='synthetic-test-password', role='driver')


@pytest.mark.parametrize('query', ['', '?date=2026-11-20&district=150103'])
def test_dashboard_insights_accepts_current_day_or_validated_date(query):
    client, _, repository = setup()
    login(client)
    repository.insights = MagicMock(return_value={'pending': 3})
    assert client.get('/api/dashboard/insights' + query).json() == {'pending': 3}
    assert repository.insights.call_args.args[1] == ('150103' if query else None)
