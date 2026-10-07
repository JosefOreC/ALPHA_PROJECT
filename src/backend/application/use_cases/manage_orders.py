from dataclasses import dataclass

from application.use_cases.confirm_delivery import Forbidden, OrderNotFound
from domain.entities.order import Order
from domain.value_objects import OrderStatus
from domain.order_management import DISTRICTS, InvalidOrder, OrderData, cancel_order, update_order
from domain.ports.order_management import ManagementRepository, OrderIds


@dataclass(frozen=True)
class ManagementPrincipal:
    subject_id: str
    role: str


READ_ROLES = frozenset({"ADMIN", "OPERADOR", "AUDITOR", "RESPONSABLE_LOGISTICA"})
WRITE_ROLES = frozenset({"ADMIN", "OPERADOR"})


class ManageOrders:
    def __init__(self, repository: ManagementRepository, ids: OrderIds):
        self.repository, self.ids = repository, ids

    @staticmethod
    def authorize(principal: ManagementPrincipal, write: bool = False) -> None:
        if principal.role not in (WRITE_ROLES if write else READ_ROLES):
            raise Forbidden("Tu usuario no tiene permiso para esta operación de gestión de pedidos.")

    def create(self, data: OrderData, principal: ManagementPrincipal) -> Order:
        self.authorize(principal, True)
        fields = data.validated()
        order = Order(id=self.ids.new(), driver_id=None, **vars(fields), status=OrderStatus.PENDING)
        with self.repository.transaction():
            self.repository.add(order)
        return order

    def list(self, principal: ManagementPrincipal, *, limit: int = 20, offset: int = 0,
             status: OrderStatus | None = None, district: str | None = None) -> list[Order]:
        self.authorize(principal)
        if type(limit) is not int or not 1 <= limit <= 100 or type(offset) is not int or not 0 <= offset <= 100000:
            raise InvalidOrder("Paginación inválida: límite de 1 a 100 y desplazamiento de 0 a 100000.")
        if status is not None and not isinstance(status, OrderStatus):
            raise InvalidOrder("Estado de filtro inválido.")
        if district is not None and district not in DISTRICTS:
            raise InvalidOrder("Distrito de filtro inválido.")
        return self.repository.list(limit=limit, offset=offset, status=status, district=district)

    def view(self, order_id: str, principal: ManagementPrincipal) -> Order:
        self.authorize(principal)
        order = self.repository.get(order_id)
        if order is None:
            raise OrderNotFound("Pedido no encontrado.")
        return order

    def update(self, order_id: str, data: OrderData, expected_version: int,
               principal: ManagementPrincipal) -> Order:
        self.authorize(principal, True)
        with self.repository.transaction():
            order = update_order(self.view(order_id, principal), data, expected_version)
            self.repository.save(order)
            return order

    def cancel(self, order_id: str, expected_version: int, principal: ManagementPrincipal) -> Order:
        self.authorize(principal, True)
        with self.repository.transaction():
            order = cancel_order(self.view(order_id, principal), expected_version)
            self.repository.save(order)
            return order
