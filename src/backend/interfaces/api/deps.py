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

def create_app(repository=None, authenticate=get_current_identity, protect_mutation=default_protection):
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
    repository = repository if repository is not None else MemoryOrderRepository()
    app.include_router(session_router)
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
