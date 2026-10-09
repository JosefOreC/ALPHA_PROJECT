"""Identidad verificada por el proveedor del servidor; nunca por cabeceras de rol."""
from fastapi import Depends, HTTPException, Request
from domain.access_control import Identity, can, canonical_role, scope_for
import os
import hmac
from infrastructure.security import DatabaseSessions

def get_sessions():
    return DatabaseSessions()

def cookie_options():
    return {'path': '/', 'samesite': 'lax', 'secure': os.getenv('SESSION_COOKIE_SECURE', 'false').lower() == 'true'}

def verify_origin(request: Request):
    origin = request.headers.get('origin')
    allowed = [item.strip() for item in os.getenv('CORS_ALLOW_ORIGINS', 'http://localhost:5173,http://127.0.0.1:5173').split(',')]
    if origin and origin not in allowed and origin != str(request.base_url).rstrip('/'):
        raise HTTPException(403, 'Origen de la solicitud no permitido.')

def get_current_identity(request: Request, sessions=Depends(get_sessions)) -> Identity:
    identity = getattr(request.state, "identity", None)
    if not isinstance(identity, Identity):
        token = request.cookies.get('eco_session')
        if token:
            resolved = sessions.resolve(token)
            if resolved:
                identity, csrf = resolved
                request.state.identity = identity
                request.state.csrf_token = csrf
                request.state.revoke_session = lambda: sessions.revoke(token)
    if not isinstance(identity, Identity) or not identity.subject_id or not canonical_role(identity.role):
        raise HTTPException(401, "Se requiere una sesión verificada.")
    return identity

def protect_mutation(request: Request, identity: Identity = Depends(get_current_identity)) -> None:
    # Solo el proveedor del servidor puede establecer este estado.
    if getattr(request.state, "mutation_verified", False) is True:
        return
    verify_origin(request)
    expected = getattr(request.state, 'csrf_token', '')
    provided = request.headers.get('X-CSRF-Token', '')
    if not expected or not hmac.compare_digest(expected, provided):
        raise HTTPException(403, "No se pudo verificar la protección de la operación.")

def require_permission(permission: str):
    def authorize(identity: Identity = Depends(get_current_identity)) -> Identity:
        if not can(identity.role, permission):
            raise HTTPException(403, "Tu perfil no tiene permiso para esta operación.")
        if scope_for(identity.role, permission) == "own" and not getattr(identity, "driver_id", None):
            raise HTTPException(403, "Tu usuario no tiene un conductor vinculado.")
        return identity
    return authorize
