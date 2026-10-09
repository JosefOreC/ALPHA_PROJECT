"""Identidad verificada por el proveedor del servidor; nunca por cabeceras de rol."""
from fastapi import Depends, HTTPException, Request
from domain.access_control import Identity, can, canonical_role, scope_for

def get_current_identity(request: Request) -> Identity:
    identity = getattr(request.state, "identity", None)
    if not isinstance(identity, Identity) or not identity.subject_id or not canonical_role(identity.role):
        raise HTTPException(401, "Se requiere una sesión verificada.")
    return identity

def protect_mutation(request: Request, identity: Identity = Depends(get_current_identity)) -> None:
    # Solo el proveedor del servidor puede establecer este estado.
    if getattr(request.state, "mutation_verified", False) is not True:
        raise HTTPException(403, "No se pudo verificar la protección de la operación.")

def require_permission(permission: str):
    def authorize(identity: Identity = Depends(get_current_identity)) -> Identity:
        if not can(identity.role, permission):
            raise HTTPException(403, "Tu perfil no tiene permiso para esta operación.")
        if scope_for(identity.role, permission) == "own" and not getattr(identity, "driver_id", None):
            raise HTTPException(403, "Tu usuario no tiene un conductor vinculado.")
        return identity
    return authorize
