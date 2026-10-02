from dataclasses import asdict
from typing import Annotated, Callable

from fastapi import APIRouter, Depends, HTTPException, Path, Query, Request
from pydantic import BaseModel, ConfigDict, Field

from application.use_cases.confirm_delivery import Forbidden, OrderNotFound
from application.use_cases.manage_orders import ManageOrders, ManagementPrincipal
from application.use_cases.register_order import register_order
from domain.entities.order import Order, OrderConflict, OrderStatus
from domain.order_management import InvalidOrder, OrderData


class CreateOrderBody(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True, allow_inf_nan=False)
    customer: str = Field(min_length=1, max_length=200)
    address: str = Field(min_length=1, max_length=500)
    district: str = Field(min_length=1, max_length=80)
    window_start: str = Field(min_length=1, max_length=40)
    window_end: str = Field(min_length=1, max_length=40)
    weight_kg: float = Field(gt=0, le=99999999.99)
    instructions: str = Field(default="", max_length=1000)

    def order_data(self) -> OrderData:
        return OrderData(**self.model_dump(include=set(OrderData.__dataclass_fields__)))


class UpdateOrderBody(CreateOrderBody):
    expected_version: int = Field(ge=1)


class CancelOrderBody(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)
    expected_version: int = Field(ge=1)


class OrderRead(BaseModel):
    id: str
    customer: str
    address: str
    district: str
    window_start: str
    window_end: str
    weight_kg: float
    instructions: str
    status: OrderStatus
    confirmed_at: str | None
    assigned: bool
    version: int


class OrderPage(BaseModel):
    items: list[OrderRead]
    limit: int
    offset: int
    has_more: bool


class PermissionsRead(BaseModel):
    can_write: bool


def read_order(order: Order) -> OrderRead:
    fields = asdict(order)
    fields.pop("driver_id")
    fields["assigned"] = order.driver_id is not None
    fields["confirmed_at"] = order.confirmed_at.isoformat() if order.confirmed_at else None
    return OrderRead(**fields)


def mutation_protection_required(request: Request) -> None:
    """Falla cerrado hasta integrar token CSRF/origen o un mecanismo autenticado equivalente."""
    raise HTTPException(403, "Se requiere integrar la protección de las operaciones de gestión.")


def create_management_router(service: ManageOrders, authenticate: Callable,
                             protect_mutation: Callable = mutation_protection_required) -> APIRouter:
    router = APIRouter(prefix="/api/pedidos", tags=["Gestión de pedidos"])
    principal_dependency = Annotated[ManagementPrincipal, Depends(authenticate)]
    mutation_dependency = Annotated[None, Depends(protect_mutation)]
    order_id_parameter = Annotated[str, Path(min_length=1, max_length=100)]

    def execute(action, *args, **kwargs):
        try:
            return action(*args, **kwargs)
        except Forbidden as error:
            raise HTTPException(403, str(error)) from error
        except OrderNotFound as error:
            raise HTTPException(404, str(error)) from error
        except OrderConflict as error:
            raise HTTPException(409, str(error)) from error
        except InvalidOrder as error:
            raise HTTPException(422, str(error)) from error

    @router.post("", status_code=201, response_model=OrderRead)
    def create(body: CreateOrderBody, principal: principal_dependency, protection: mutation_dependency):
        return read_order(execute(register_order, service, body.order_data(), principal))

    @router.get("", response_model=OrderPage)
    def list_orders(principal: principal_dependency,
                    limit: Annotated[int, Query(ge=1, le=100)] = 20,
                    offset: Annotated[int, Query(ge=0, le=100000)] = 0,
                    status: OrderStatus | None = None,
                    district: Annotated[str | None, Query(max_length=80)] = None):
        # Puerto limitado: obtener uno adicional solo cuando no excede el máximo.
        orders = execute(service.list, principal, limit=limit, offset=offset, status=status, district=district)
        more = execute(service.list, principal, limit=1, offset=offset + limit,
                       status=status, district=district) if offset + limit <= 100000 else []
        return OrderPage(items=[read_order(order) for order in orders], limit=limit, offset=offset, has_more=bool(more))

    @router.get("/permisos", response_model=PermissionsRead)
    def permissions(principal: principal_dependency):
        execute(service.authorize, principal)
        from application.use_cases.manage_orders import WRITE_ROLES
        return PermissionsRead(can_write=principal.role in WRITE_ROLES)

    @router.get("/{order_id}", response_model=OrderRead)
    def view(order_id: order_id_parameter, principal: principal_dependency):
        return read_order(execute(service.view, order_id, principal))

    @router.put("/{order_id}", response_model=OrderRead)
    def update(order_id: order_id_parameter, body: UpdateOrderBody,
               principal: principal_dependency, protection: mutation_dependency):
        return read_order(execute(service.update, order_id, body.order_data(), body.expected_version, principal))

    @router.post("/{order_id}/cancelacion", response_model=OrderRead)
    def cancel(order_id: order_id_parameter, body: CancelOrderBody,
               principal: principal_dependency, protection: mutation_dependency):
        return read_order(execute(service.cancel, order_id, body.expected_version, principal))

    return router
