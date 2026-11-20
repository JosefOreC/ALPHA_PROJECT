"""Entradas de simulación validadas; el cálculo es independiente de la persistencia."""
from fastapi import APIRouter, Depends

from interfaces.api.simulation.schemas import Scenario
from application.use_cases.generate_routes import simulate_routes
from interfaces.api.security.deps import protect_mutation, require_permission

router = APIRouter(prefix='/api/routes', tags=['Simulación de rutas'])


@router.post('/simulate', dependencies=[Depends(require_permission('routes.generate')), Depends(protect_mutation)])
def simulate(scenario: Scenario):
    return simulate_routes(scenario.model_dump())
