from fastapi import APIRouter, Depends, HTTPException, Request, Response
from domain.access_control import GRANTS, Identity, canonical_role, scope_for
from interfaces.api.security.deps import get_current_identity, protect_mutation
from interfaces.api.security.deps import get_sessions, cookie_options, verify_origin
from pydantic import BaseModel, Field

router = APIRouter(prefix="/api/session", tags=["Sesión"])

class LoginRequest(BaseModel):
    email: str = Field(min_length=3, max_length=255)
    password: str = Field(min_length=1, max_length=256)

@router.post("")
def login(payload: LoginRequest, request: Request, response: Response, sessions=Depends(get_sessions)):
    verify_origin(request)
    result, error = sessions.login(payload.email.strip(), payload.password, request.client.host if request.client else 'unknown')
    if error:
        raise HTTPException(429 if error == 'limited' else 401,
                            'Demasiados intentos. Intenta en 15 minutos.' if error == 'limited' else 'Correo o contraseña incorrectos.')
    token, csrf = result
    response.set_cookie('eco_session', token, httponly=True, max_age=28800, **cookie_options())
    identity, _ = sessions.resolve(token)
    return {**session(identity), 'csrf_token': csrf}

@router.get("")
def session(identity: Identity = Depends(get_current_identity), request: Request = None):
    return {"subject_id": identity.subject_id, "name": identity.name,
            "role": canonical_role(identity.role), "driver_id": identity.driver_id, "plate": identity.plate,
            "permissions": {key: scope_for(identity.role, key) for key in GRANTS if scope_for(identity.role, key)},
            "csrf_token": getattr(request.state, 'csrf_token', None) if request else None}

@router.delete("", status_code=204, dependencies=[Depends(protect_mutation)])
def logout(request: Request, identity: Identity = Depends(get_current_identity)):
    revoke = getattr(request.state, "revoke_session", None)
    if not callable(revoke):
        raise HTTPException(503, "El proveedor de sesiones aún no permite cerrar la sesión.")
    revoke()
    response = Response(status_code=204)
    response.delete_cookie('eco_session', **cookie_options())
    return response
