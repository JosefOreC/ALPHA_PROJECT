"""Composición común de API y autorización; proveedor de identidad inyectable."""
import os
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from application.use_cases.confirm_delivery import DriverOrders
from application.use_cases.manage_orders import ManageOrders
from infrastructure.clock import SystemClock
from infrastructure.persistence.memory_orders import MemoryOrderRepository
from infrastructure.order_ids import UuidOrderIds
from interfaces.api.orders.management import create_management_router
from interfaces.api.orders.router import create_orders_router
from interfaces.api.vehicles.router import router as vehicles_router
from interfaces.api.drivers.router import router as drivers_router
from interfaces.api.dashboard.router import router as dashboard_router
from interfaces.api.security.router import router as session_router
from interfaces.api.security.deps import get_current_identity, protect_mutation as default_protection
from interfaces.api.portal.router import router as portal_router
from infrastructure.persistence.postgres_orders import postgres_repository
from infrastructure.persistence.postgres_fleet import PostgresVehicles, PostgresDrivers
from infrastructure.persistence.postgres_dashboard import PostgresDashboard, PostgresDistrictCatalog
from infrastructure.persistence.database import DatabaseError, DatabaseUnavailable
from infrastructure.config import load_environment
from infrastructure import dependencies as repositories
from application.use_cases.get_dashboard_summary import GetDashboardSummary
from application.use_cases.list_districts import ListDistricts
from interfaces.api.dashboard.deps import get_dashboard_summary_use_case, get_list_districts_use_case
from infrastructure.persistence.in_memory_dashboard import SystemClock as DashboardClock

def create_app(repository=None, authenticate=get_current_identity, protect_mutation=default_protection, persistent=None):
    persistent = (repository is None and authenticate is get_current_identity and protect_mutation is default_protection) if persistent is None else persistent
    if persistent:
        load_environment()
    app = FastAPI(title="EcoLogística Lima", version="1.0.0")
    if authenticate is not get_current_identity:
        app.dependency_overrides[get_current_identity] = authenticate
    if protect_mutation is not default_protection:
        app.dependency_overrides[default_protection] = protect_mutation
    origins = os.getenv("CORS_ALLOW_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
    app.add_middleware(CORSMiddleware, allow_origins=[origin.strip() for origin in origins if origin.strip() and origin.strip() != "*"],
                       allow_credentials=True, allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
                       allow_headers=["Content-Type", "Accept", "X-CSRF-Token", "Authorization"])
    @app.exception_handler(RequestValidationError)
    async def invalid_payload(request: Request, error: RequestValidationError):
        return JSONResponse(status_code=422, content={"detail": [
            {"loc": item["loc"], "msg": item["msg"], "type": item["type"]} for item in error.errors()
        ]})
    if persistent:
        # DSN se lee al componer; las conexiones se abren solo al consultar.
        repository = postgres_repository(os.getenv('DATABASE_URL', ''))
        vehicles, drivers = PostgresVehicles(), PostgresDrivers()
        app.dependency_overrides[repositories.get_vehicle_repository] = lambda: vehicles
        # Los proveedores de casos de uso actuales llaman directamente al repositorio.
        from application.use_cases.register_vehicle import RegisterVehicleUseCase
        from application.use_cases.get_vehicles import GetVehiclesUseCase
        from application.use_cases.update_vehicle import UpdateVehicleUseCase
        from application.use_cases.get_vehicle_by_id import GetVehicleByIdUseCase
        from application.use_cases.register_driver import RegisterDriver
        from application.use_cases.get_drivers import GetDrivers
        from application.use_cases.get_driver_by_id import GetDriverById
        from application.use_cases.update_driver import UpdateDriver
        from application.use_cases.activate_driver import ActivateDriver
        from application.use_cases.deactivate_driver import DeactivateDriver
        for provider, factory, repo in [
            (repositories.get_register_vehicle_use_case,RegisterVehicleUseCase,vehicles),
            (repositories.get_vehicles_use_case,GetVehiclesUseCase,vehicles),
            (repositories.get_update_vehicle_use_case,UpdateVehicleUseCase,vehicles),
            (repositories.get_vehicle_by_id_use_case,GetVehicleByIdUseCase,vehicles),
            (repositories.get_register_driver,RegisterDriver,drivers),(repositories.get_get_drivers,GetDrivers,drivers),
            (repositories.get_get_driver_by_id,GetDriverById,drivers),(repositories.get_update_driver,UpdateDriver,drivers),
            (repositories.get_activate_driver,ActivateDriver,drivers),(repositories.get_deactivate_driver,DeactivateDriver,drivers),
        ]:
            # FastAPI no debe interpretar los cierres como parámetros HTTP.
            def provider_for(factory, repo):
                def provide():
                    return factory(repo)
                return provide
            app.dependency_overrides[provider] = provider_for(factory,repo)
        metrics, districts = PostgresDashboard(), PostgresDistrictCatalog()
        app.dependency_overrides[get_dashboard_summary_use_case] = lambda: GetDashboardSummary(metrics,districts,metrics,DashboardClock())
        app.dependency_overrides[get_list_districts_use_case] = lambda: ListDistricts(districts)
    else:
        repository = repository if repository is not None else MemoryOrderRepository()
    @app.exception_handler(DatabaseError)
    @app.exception_handler(DatabaseUnavailable)
    async def database_error(request, error):
        return JSONResponse(status_code=503,content={'detail':'No se pudo acceder a la base de datos. Verifica la conexión y las migraciones.'})
    @app.exception_handler(ValueError)
    async def domain_error(request, error):
        return JSONResponse(status_code=422,content={'detail':str(error)})
    app.include_router(session_router)
    app.include_router(portal_router)
    app.include_router(create_orders_router(DriverOrders(repository, SystemClock()), authenticate))
    app.include_router(create_management_router(ManageOrders(repository, UuidOrderIds()), authenticate, protect_mutation))
    app.include_router(vehicles_router, prefix="/api/v1")
    app.include_router(drivers_router, prefix="/api/v1")
    app.include_router(dashboard_router)
    @app.get("/health", tags=["Health"])
    def health_check():
        return {"status": "ok", "service": "ALPHA_PROJECT Backend"}
    @app.get("/")
    def root():
        return {"message": "ALPHA_PROJECT API funcionando correctamente"}
    return app
