from dataclasses import dataclass

from domain.entities.order import Order
from domain.ports.orders import Clock, OrderRepository
from domain.access_control import can, canonical_role


class OrderNotFound(Exception):
    pass


class Forbidden(Exception):
    pass


@dataclass(frozen=True)
class Principal:
    driver_id: str
    role: str


class DriverOrders:
    def __init__(self, repository: OrderRepository, clock: Clock):
        self.repository = repository
        self.clock = clock

    def view(self, order_id: str, principal: Principal) -> Order:
        if canonical_role(principal.role) != "driver" or not principal.driver_id or not can(principal.role, "deliveries.read"):
            raise Forbidden("Esta acción requiere el rol conductor.")
        order = self.repository.get(order_id)
        # No divulgar pedidos ajenos.
        if order is None or order.driver_id != principal.driver_id:
            raise OrderNotFound("Pedido no encontrado o no asignado a este conductor.")
        return order

    def confirm(self, order_id: str, principal: Principal) -> Order:
        if not can(principal.role, "deliveries.update"):
            raise Forbidden("Tu usuario no tiene permiso para confirmar entregas.")
        with self.repository.transaction():
            order = self.view(order_id, principal)
            confirmed = order.confirm_delivery(self.clock.now())
            if confirmed is not order:
                self.repository.save(confirmed)
            return confirmed
