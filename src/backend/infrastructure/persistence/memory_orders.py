from threading import RLock

from domain.entities.order import Order


class MemoryOrderRepository:
    """Adaptador para pruebas; no es persistencia de producción."""

    def __init__(self, orders: list[Order] | None = None):
        self._orders = {order.id: order for order in orders or []}
        self._lock = RLock()

    def transaction(self):
        return self._lock

    def get(self, order_id: str) -> Order | None:
        with self._lock:
            return self._orders.get(order_id)

    def save(self, order: Order) -> None:
        with self._lock:
            self._orders[order.id] = order
