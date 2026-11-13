"""Endurecimiento OWASP A02/A04: cabeceras de seguridad y cookie Secure por defecto."""
from fastapi.testclient import TestClient

from interfaces.api.deps import create_app
from interfaces.api.security.deps import cookie_options, get_sessions
from interfaces.api.security.headers import STRICT_CSP, HSTS_VALUE, security_headers
from tests.test_sessions import Sessions


def client(base_url="http://testserver"):
    return TestClient(create_app(persistent=False), base_url=base_url)


def test_api_responses_include_security_headers():
    response = client().get("/health")
    assert response.status_code == 200
    assert response.headers["X-Content-Type-Options"] == "nosniff"
    assert response.headers["X-Frame-Options"] == "DENY"
    assert response.headers["Referrer-Policy"] == "no-referrer"
    assert response.headers["Content-Security-Policy"] == STRICT_CSP
    assert "Strict-Transport-Security" not in response.headers


def test_error_responses_also_include_security_headers():
    response = client().get("/ruta-inexistente")
    assert response.status_code == 404
    assert response.headers["X-Content-Type-Options"] == "nosniff"
    assert response.headers["Content-Security-Policy"] == STRICT_CSP


def test_docs_keep_working_without_strict_csp():
    response = client().get("/docs")
    assert response.status_code == 200
    assert "Content-Security-Policy" not in response.headers
    assert response.headers["X-Content-Type-Options"] == "nosniff"


def test_hsts_is_sent_over_https_or_when_enabled(monkeypatch):
    assert client("https://testserver").get("/health").headers["Strict-Transport-Security"] == HSTS_VALUE
    monkeypatch.setenv("SECURITY_HSTS", "true")
    assert security_headers("/health", "http")["Strict-Transport-Security"] == HSTS_VALUE


def test_session_cookie_is_secure_by_default(monkeypatch):
    monkeypatch.delenv("SESSION_COOKIE_SECURE", raising=False)
    assert cookie_options()["secure"] is True
    monkeypatch.setenv("SESSION_COOKIE_SECURE", "cualquier-valor")
    assert cookie_options()["secure"] is True


def test_secure_flag_can_only_be_disabled_explicitly(monkeypatch):
    monkeypatch.setenv("SESSION_COOKIE_SECURE", "false")
    assert cookie_options()["secure"] is False


def test_login_sets_httponly_secure_samesite_cookie(monkeypatch):
    monkeypatch.delenv("SESSION_COOKIE_SECURE", raising=False)
    app = create_app(persistent=False)
    sessions = Sessions()
    app.dependency_overrides[get_sessions] = lambda: sessions
    response = TestClient(app, base_url="https://testserver").post(
        "/api/session", json={"email": "admin@empresa.pe", "password": "clave-verificada"})
    assert response.status_code == 200
    cookie = response.headers["set-cookie"].lower()
    assert "eco_session=" in cookie and "httponly" in cookie and "secure" in cookie and "samesite=lax" in cookie
