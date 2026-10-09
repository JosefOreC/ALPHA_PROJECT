from datetime import date
from typing import Literal
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, field_validator
from domain.access_control import scope_for, can
from interfaces.api.security.deps import require_permission, protect_mutation
from interfaces.api.portal.deps import get_portal

router = APIRouter(prefix='/api',tags=['Operación'])


class CreateUser(BaseModel):
    name: str = Field(min_length=2,max_length=200)
    email: str = Field(min_length=5,max_length=255)
    password: str = Field(min_length=12,max_length=256)
    role: Literal['admin','planner','driver','logistics','auditor']

    @field_validator('name','email')
    @classmethod
    def non_empty(cls,value):
        value = value.strip()
        if len(value)<2:
            raise ValueError('Completa este campo.')
        return value

    @field_validator('email')
    @classmethod
    def valid_email(cls,value):
        import re
        if not re.fullmatch(r'[^\s@]+@[^\s@]+\.[^\s@]+',value):
            raise ValueError('Ingresa un correo válido.')
        return value


class Parameters(BaseModel):
    co2Weight: int = Field(ge=0,le=100,strict=True)
    maxSeconds: int = Field(ge=5,le=45,strict=True)
    maxLoadPercent: int = Field(ge=50,le=100,strict=True)
    windowSlackMinutes: int = Field(ge=0,le=60,strict=True)
    autoReoptimize: bool
    emissionFactors: dict[Literal['DIESEL','GASOLINA','GLP','GNV','ELECTRICO','HIBRIDO'],float | None]

    @field_validator('emissionFactors')
    @classmethod
    def valid_factors(cls,value):
        import math
        if len(value)!=6 or any(factor is not None and (not math.isfinite(factor) or not 0<=factor<=100) for factor in value.values()):
            raise ValueError('Completa los seis factores con valores entre 0 y 100 o null.')
        return value


class RouteSettings(BaseModel):
    goal: Literal['co2','balanced','time']
    respectWindows: bool
    prioritizeLowEmission: bool

class Incident(BaseModel):
    order_id: UUID
    type: str = Field(min_length=2,max_length=50)
    description: str = Field(min_length=5,max_length=2000)


@router.get('/admin/users',dependencies=[Depends(require_permission('users.read'))])
def users(portal=Depends(get_portal)):
    return portal.users()

@router.post('/admin/users',status_code=201,dependencies=[Depends(protect_mutation)])
def create_user(payload:CreateUser,identity=Depends(require_permission('users.create')),portal=Depends(get_portal)):
    return portal.create_user(payload.model_dump(),identity.subject_id)

@router.get('/admin/parameters',dependencies=[Depends(require_permission('settings.read'))])
def parameters(portal=Depends(get_portal)):
    return portal.parameters()

@router.put('/admin/parameters',dependencies=[Depends(protect_mutation)])
def save_parameters(payload:Parameters,identity=Depends(require_permission('settings.update')),portal=Depends(get_portal)):
    return portal.save_parameters(payload.model_dump(),identity.subject_id)

@router.get('/admin/integrations',dependencies=[Depends(require_permission('users.read'))])
def integrations(portal=Depends(get_portal)):
    return portal.integrations()

@router.get('/drivers/accounts',dependencies=[Depends(require_permission('drivers.create'))])
def driver_accounts(portal=Depends(get_portal)):
    return portal.driver_accounts()

@router.get('/map')
def map_data(identity=Depends(require_permission('map.read')),portal=Depends(get_portal)):
    return portal.map(identity.driver_id if scope_for(identity.role,'map.read')=='own' else None)

@router.get('/conductor/ruta')
def driver_route(identity=Depends(require_permission('routes.read')),portal=Depends(get_portal)):
    if scope_for(identity.role,'routes.read')!='own' or not identity.driver_id:
        raise HTTPException(403,'Se requiere una cuenta de conductor vinculada.')
    value = portal.driver_route(identity.driver_id)
    if value is None:
        raise HTTPException(404,'Aún no tienes una ruta asignada para hoy.')
    return value

@router.get('/reports/sustainability',dependencies=[Depends(require_permission('reports.read'))])
def report(period:Literal['week','month','quarter']='month',portal=Depends(get_portal)):
    return portal.report(period)

@router.get('/dashboard/insights',dependencies=[Depends(require_permission('dashboard.read'))])
def insights(date:date | None=None,district:str | None=None,portal=Depends(get_portal)):
    from datetime import datetime
    from zoneinfo import ZoneInfo
    return portal.insights(date or datetime.now(ZoneInfo('America/Lima')).date(),district)

@router.get('/routes/scope')
def scope(identity=Depends(require_permission('routes.read')),portal=Depends(get_portal)):
    if scope_for(identity.role,'routes.read')!='all':
        raise HTTPException(403,'Tu perfil solo puede consultar su ruta asignada.')
    return portal.scope()

@router.post('/routes/proposal',dependencies=[Depends(require_permission('routes.generate')),Depends(protect_mutation)])
def proposal(payload:RouteSettings,portal=Depends(get_portal)):
    return portal.proposal(payload.model_dump())

@router.get('/audit',dependencies=[Depends(require_permission('audit.read'))])
def audit(portal=Depends(get_portal)):
    return portal.records('auditoria')

@router.get('/incidents')
def incidents(identity=Depends(require_permission('orders.read')),portal=Depends(get_portal)):
    if can(identity.role,'incidents.read'):
        return portal.records('incidencias')
    if identity.role in ('driver','CONDUCTOR','ROL-03') and identity.driver_id:
        return portal.records('incidencias',identity.driver_id)
    raise HTTPException(403,'No tienes permiso para consultar incidencias.')

@router.post('/incidents',status_code=201,dependencies=[Depends(protect_mutation)])
def create_incident(payload:Incident,identity=Depends(require_permission('incidents.create')),portal=Depends(get_portal)):
    value = portal.create_incident(payload.model_dump(),identity)
    if value is None:
        raise HTTPException(404,'Pedido no encontrado o no asignado a tu usuario.')
    return value
