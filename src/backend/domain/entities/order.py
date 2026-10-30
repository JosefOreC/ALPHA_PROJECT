from dataclasses import dataclass, replace
from datetime import datetime

from domain.exceptions.order_conflict import OrderConflict
from domain.value_objects import OrderStatus


@dataclass(frozen=True)
class Order:
    id: str
    driver_id: str | None
    customer: str
    address: str
    district: str
    window_start: str
    window_end: str
    weight_kg: float
    instructions: str
    status: OrderStatus = OrderStatus.IN_TRANSIT
    confirmed_at: datetime | None = None
    version: int = 1

    def confirm_delivery(self, now: datetime) -> "Order":
        if self.status == OrderStatus.DELIVERED:
            return self
        if self.status != OrderStatus.IN_TRANSIT:
            raise OrderConflict("Solo se puede confirmar un pedido en camino.")
        return replace(self, status=OrderStatus.DELIVERED, confirmed_at=now, version=self.version + 1)
