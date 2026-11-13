"""Cabeceras de seguridad HTTP comunes a todas las respuestas de la API (OWASP A02)."""
import os

from starlette.middleware.base import BaseHTTPMiddleware

# La documentación interactiva de FastAPI carga recursos externos; no se le aplica la CSP estricta.
DOCS_PATHS = ("/docs", "/redoc", "/openapi.json")
STRICT_CSP = "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'"
HSTS_VALUE = "max-age=31536000; includeSubDomains"


def hsts_enabled() -> bool:
    return os.getenv("SECURITY_HSTS", "false").strip().lower() == "true"


def security_headers(path: str, scheme: str) -> dict:
    headers = {
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "Referrer-Policy": "no-referrer",
        "Cross-Origin-Opener-Policy": "same-origin",
        "Permissions-Policy": "geolocation=(), camera=(), microphone=()",
    }
    if not path.startswith(DOCS_PATHS):
        headers["Content-Security-Policy"] = STRICT_CSP
    # HSTS solo tiene efecto sobre HTTPS; se envía si la conexión es segura o se habilita detrás de un proxy TLS.
    if scheme == "https" or hsts_enabled():
        headers["Strict-Transport-Security"] = HSTS_VALUE
    return headers


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        for name, value in security_headers(request.url.path, request.url.scheme).items():
            response.headers.setdefault(name, value)
        return response
