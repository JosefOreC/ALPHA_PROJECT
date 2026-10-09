from fastapi import APIRouter, Depends, HTTPException, Request, Response
from domain.access_control import GRANTS, Identity, canonical_role, scope_for
from interfaces.api.security.deps import get_current_identity, protect_mutation

router = APIRouter(prefix="/api/session", tags=["Sesión"])

@router.get("")
def session(identity: Identity = Depends(get_current_identity)):
    return {"subject_id": identity.subject_id, "name": identity.name,
            "role": canonical_role(identity.role), "driver_id": identity.driver_id, "plate": identity.plate,
            "permissions": {key: scope_for(identity.role, key) for key in GRANTS if scope_for(identity.role, key)}}

@router.delete("", status_code=204, dependencies=[Depends(protect_mutation)])
def logout(request: Request, identity: Identity = Depends(get_current_identity)):
    revoke = getattr(request.state, "revoke_session", None)
    if not callable(revoke):
        raise HTTPException(503, "El proveedor de sesiones aún no permite cerrar la sesión.")
    revoke()
    return Response(status_code=204)
