from typing import Protocol
from domain.entities.order import Order, OrderStatus
from domain.ports.orders import OrderRepository


class ManagementRepository(OrderRepository, Protocol):
    """Puerto complementario: no amplía el contrato de los adaptadores del conductor."""
    def add(self, order: Order) -> None: ...
    def list(self, *, limit: int, offset: int, status: OrderStatus | None,
             district: str | None) -> list[Order]: ...


class OrderIds(Protocol):
    def new(self) -> str: ...
