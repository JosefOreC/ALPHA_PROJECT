from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from application.use_cases.confirm_delivery import DriverOrders
from application.use_cases.manage_orders import ManageOrders
from infrastructure.clock import SystemClock
from infrastructure.persistence.memory_orders import MemoryOrderRepository
from infrastructure.order_ids import UuidOrderIds
from interfaces.api.orders.management import create_management_router, mutation_protection_required
from interfaces.api.orders.router import create_orders_router


def authentication_required():
    raise HTTPException(401, "Se requiere integrar el proveedor de autenticación.")


def create_app(repository=None, authenticate=authentication_required,
               protect_mutation=mutation_protection_required):
    app = FastAPI(title="EcoLogística Lima")
    @app.exception_handler(RequestValidationError)
    async def invalid_payload(request: Request, error: RequestValidationError):
        # No reflejar payloads personales ni NaN/Infinity en errores JSON.
        return JSONResponse(status_code=422, content={"detail": [
            {"loc": item["loc"], "msg": item["msg"], "type": item["type"]}
            for item in error.errors()
        ]})
    repository = repository if repository is not None else MemoryOrderRepository()
    service = DriverOrders(repository, SystemClock())
    app.include_router(create_orders_router(service, authenticate))
    app.include_router(create_management_router(ManageOrders(repository, UuidOrderIds()), authenticate, protect_mutation))
    return app


app = create_app()
