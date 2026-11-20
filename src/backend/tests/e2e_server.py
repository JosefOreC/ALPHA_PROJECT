"""Servidor exclusivo de E2E: API y persistencia reales, proveedor vial sintético.

La aplicación productiva no importa este módulo ni permite elegir este proveedor.
"""
from interfaces.api.deps import create_app
from interfaces.api.simulation.deps import get_simulation_router
from tests.road_fixtures import TestRoadRouter


def create_test_app():
    app = create_app(persistent=True)
    app.dependency_overrides[get_simulation_router] = lambda: TestRoadRouter()
    return app
