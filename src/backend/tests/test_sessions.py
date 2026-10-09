from fastapi.testclient import TestClient
from domain.access_control import Identity
from infrastructure.security import hash_password, verify_password
from interfaces.api.deps import create_app
from interfaces.api.security.deps import get_sessions
from interfaces.api.portal.deps import get_portal


class Sessions:
    def __init__(self):
        self.active = False
        self.role = 'admin'
        self.driver_id = None

    def login(self, email, password, client):
        if email != 'admin@empresa.pe' or password != 'clave-verificada':
            return None, 'invalid'
        self.active = True
        return ('opaque-session', 'csrf-secret'), None

    def resolve(self, token):
        if token == 'opaque-session' and self.active:
            return Identity('00000000-0000-0000-0000-000000000001','Usuario',self.role,self.driver_id), 'csrf-secret'

    def revoke(self, token):
        self.active = False


class Portal:
    def __init__(self):
        self.created = []

    def create_user(self, payload, actor):
        self.created.append(payload)
        return {'id':'new-user','name':payload['name'],'role':payload['role']}


def setup():
    sessions, portal = Sessions(), Portal()
    app = create_app(persistent=False)
    app.dependency_overrides[get_sessions] = lambda: sessions
    app.dependency_overrides[get_portal] = lambda: portal
    return TestClient(app), sessions, portal


def login(client):
    return client.post('/api/session', json={'email':'admin@empresa.pe','password':'clave-verificada'})


def test_password_hash_uses_unique_salt_and_verifies_existing_format():
    first, second = hash_password('contraseña-larga'), hash_password('contraseña-larga')
    assert first != second
    assert verify_password('contraseña-larga', first)
    assert not verify_password('incorrecta', first)
    assert not verify_password('contraseña-larga', 'broken')
    assert not verify_password('contraseña-larga', 'pbkdf2_sha256$999999999$x$abc')


def test_login_load_csrf_and_logout_revoke_server_session():
    client, sessions, portal = setup()
    assert client.get('/api/session').status_code == 401
    response = login(client)
    assert response.status_code == 200
    cookie = response.headers['set-cookie']
    assert 'HttpOnly' in cookie and 'SameSite=lax' in cookie and 'Max-Age=28800' in cookie
    assert response.json()['role'] == 'admin'
    assert client.get('/api/session').json()['csrf_token'] == 'csrf-secret'
    assert client.delete('/api/session').status_code == 403
    assert client.delete('/api/session',headers={'X-CSRF-Token':'wrong'}).status_code == 403
    assert sessions.active
    assert client.delete('/api/session',headers={'X-CSRF-Token':'csrf-secret'}).status_code == 204
    assert not sessions.active
    client.cookies.set('eco_session','opaque-session')
    assert client.get('/api/session').status_code == 401


def test_invalid_credentials_origin_and_no_public_registration():
    client, _, _ = setup()
    assert client.post('/api/session',json={'email':'admin@empresa.pe','password':'wrong'}).status_code == 401
    assert client.post('/api/session',json={'email':'admin@empresa.pe','password':'clave-verificada'},headers={'Origin':'https://unknown.invalid'}).status_code == 403
    assert client.post('/api/register',json={}).status_code == 404


def test_only_authenticated_admin_can_create_users_with_verified_mutation():
    client, sessions, portal = setup()
    data = {'name':'Nuevo conductor','email':'nuevo@empresa.pe','password':'una-clave-larga','role':'driver'}
    assert client.post('/api/admin/users',json=data).status_code == 401
    login(client)
    assert client.post('/api/admin/users',json=data).status_code == 403
    sessions.role = 'planner'
    assert client.post('/api/admin/users',json=data,headers={'X-CSRF-Token':'csrf-secret'}).status_code == 403
    assert portal.created == []
    sessions.role = 'admin'
    assert client.post('/api/admin/users',json={**data,'role':'superadmin'},headers={'X-CSRF-Token':'csrf-secret'}).status_code == 422
    assert client.post('/api/admin/users',json={**data,'password':'short'},headers={'X-CSRF-Token':'csrf-secret'}).status_code == 422
    assert client.post('/api/admin/users',json=data,headers={'X-CSRF-Token':'csrf-secret'}).status_code == 201
    assert len(portal.created) == 1


def test_database_failure_returns_safe_error_without_fallback_or_secrets():
    import psycopg
    client, _, portal = setup()
    login(client)
    def unavailable():
        raise psycopg.OperationalError('sensitive-connection-data')
    portal.users = unavailable
    response = client.get('/api/admin/users')
    assert response.status_code == 503
    assert 'base de datos' in response.json()['detail']
    assert 'sensitive' not in response.text


def test_driver_route_scope_and_map_do_not_expose_global_planning():
    client, sessions, portal = setup()
    login(client)
    sessions.role = 'driver'
    assert client.get('/api/map').status_code == 403
    assert client.get('/api/routes/scope').status_code == 403
    sessions.driver_id = '00000000-0000-0000-0000-000000000002'
    portal.map = lambda driver_id: {'driver_id':driver_id}
    assert client.get('/api/map').json() == {'driver_id':sessions.driver_id}
    assert client.get('/api/routes/scope').status_code == 403
