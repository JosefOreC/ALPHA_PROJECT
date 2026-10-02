"""Punto de entrada de registro del módulo de gestión."""
from application.use_cases.manage_orders import ManageOrders, ManagementPrincipal
from domain.entities.order import Order
from domain.order_management import OrderData


def register_order(service: ManageOrders, data: OrderData, principal: ManagementPrincipal) -> Order:
    return service.create(data, principal)
