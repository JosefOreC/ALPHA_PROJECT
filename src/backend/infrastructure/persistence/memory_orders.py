from threading import RLock
from contextlib import contextmanager

from domain.entities.order import Order, OrderConflict, OrderStatus


class MemoryOrderRepository:
    """Adaptador para pruebas; no es persistencia de producción."""

    def __init__(self, orders: list[Order] | None = None):
        self._orders = {order.id: order for order in orders or []}
        self._lock = RLock()

    @contextmanager
    def transaction(self):
        with self._lock:
            snapshot = self._orders.copy()
            try:
                yield
            except Exception:
                self._orders = snapshot
                raise

    def get(self, order_id: str) -> Order | None:
        with self._lock:
            return self._orders.get(order_id)

    def save(self, order: Order) -> None:
        with self._lock:
            self._orders[order.id] = order

    def add(self, order: Order) -> None:
        with self._lock:
            if order.id in self._orders:
                raise OrderConflict("Ya existe un pedido con ese identificador.")
            self._orders[order.id] = order

    def list(self, *, limit: int, offset: int, status: OrderStatus | None = None,
             district: str | None = None) -> list[Order]:
        with self._lock:
            orders = sorted((order for order in self._orders.values()
                             if (status is None or order.status == status)
                             and (district is None or order.district == district)), key=lambda order: order.id)
            return orders[offset:offset + limit]
