from enum import Enum


class OrderStatus(str, Enum):
    PENDING = "PENDIENTE"
    IN_TRANSIT = "EN_CAMINO"
    DELIVERED = "ENTREGADO"
    CANCELLED = "CANCELADO"

    def __str__(self) -> str:
        return self.value
