from fastapi import FastAPI, HTTPException

from application.use_cases.confirm_delivery import DriverOrders
from infrastructure.clock import SystemClock
from infrastructure.persistence.memory_orders import MemoryOrderRepository
from interfaces.api.orders.router import create_orders_router


def authentication_required():
    raise HTTPException(401, "Se requiere integrar el proveedor de autenticación.")


def create_app(repository=None, authenticate=authentication_required):
    app = FastAPI(title="EcoLogística Lima")
    service = DriverOrders(repository if repository is not None else MemoryOrderRepository(), SystemClock())
    app.include_router(create_orders_router(service, authenticate))
    return app


app = create_app()
