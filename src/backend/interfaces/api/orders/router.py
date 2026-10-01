from dataclasses import asdict
from typing import Annotated, Callable

from fastapi import APIRouter, Depends, HTTPException

from application.use_cases.confirm_delivery import DriverOrders, Forbidden, OrderNotFound, Principal
from domain.entities.order import OrderConflict


def create_orders_router(service: DriverOrders, authenticate: Callable) -> APIRouter:
    router = APIRouter(prefix="/api/conductor/pedidos", tags=["Pedidos del conductor"])

    def execute(action, order_id, principal):
        try:
            return asdict(action(order_id, principal))
        except Forbidden as error:
            raise HTTPException(403, str(error)) from error
        except OrderNotFound as error:
            raise HTTPException(404, str(error)) from error
        except OrderConflict as error:
            raise HTTPException(409, str(error)) from error

    @router.get("/{order_id}")
    def view(order_id: str, principal: Annotated[Principal, Depends(authenticate)]):
        return execute(service.view, order_id, principal)

    @router.post("/{order_id}/confirmacion")
    def confirm(order_id: str, principal: Annotated[Principal, Depends(authenticate)]):
        return execute(service.confirm, order_id, principal)

    return router
