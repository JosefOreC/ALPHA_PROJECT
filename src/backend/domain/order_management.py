"""Políticas del CRUD aprobadas; no valida geográficamente una dirección."""
from dataclasses import dataclass, replace
from datetime import datetime
from decimal import Decimal, InvalidOperation
import re

from domain.entities.order import Order, OrderConflict, OrderStatus

DISTRICTS = ("San Juan de Lurigancho", "El Agustino", "Santa Anita", "Ate")
MAX_WEIGHT = Decimal("99999999.99")  # Capacidad de DECIMAL(10,2), no límite vehicular.
TIMESTAMP = re.compile(r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|[+-]\d{2}:\d{2})$")


class InvalidOrder(ValueError):
    pass


def text_field(value: str, label: str, limit: int, required: bool = True) -> str:
    if not isinstance(value, str) or len(value) > limit:
        raise InvalidOrder(f"{label}: debe ser texto de hasta {limit} caracteres.")
    value = value.strip()
    if required and not value:
        raise InvalidOrder(f"{label}: es obligatorio.")
    return value


def timestamp(value: str) -> datetime:
    if not isinstance(value, str) or len(value) > 40 or not TIMESTAMP.fullmatch(value):
        raise InvalidOrder("La ventana debe incluir fecha, hora, segundos y zona horaria ISO 8601.")
    try:
        result = datetime.fromisoformat(value.replace("Z", "+00:00"))
        offset = result.utcoffset()
        if offset is None or abs(offset.total_seconds()) > 14 * 3600:
            raise ValueError
        # fromisoformat tolera minutos de offset fuera de rango; el contrato no.
        if value[-1] != "Z" and int(value[-2:]) > 59:
            raise ValueError
        return result
    except ValueError as error:
        raise InvalidOrder("Fecha, hora o zona horaria inválida.") from error


@dataclass(frozen=True)
class OrderData:
    customer: str
    address: str
    district: str
    window_start: str
    window_end: str
    weight_kg: float
    instructions: str = ""

    def validated(self) -> "OrderData":
        customer = text_field(self.customer, "Destinatario", 200)
        address = text_field(self.address, "Dirección", 500)
        district = text_field(self.district, "Distrito", 80)
        instructions = text_field(self.instructions, "Indicaciones", 1000, False)
        if district not in DISTRICTS:
            raise InvalidOrder("La dirección indicada está fuera del área de cobertura operativa")
        start, end = timestamp(self.window_start), timestamp(self.window_end)
        if end <= start:
            raise InvalidOrder("El fin de la ventana debe ser posterior al inicio.")
        if isinstance(self.weight_kg, bool) or not isinstance(self.weight_kg, (int, float, Decimal)):
            raise InvalidOrder("El peso debe ser un número positivo con hasta dos decimales.")
        try:
            weight = Decimal(str(self.weight_kg))
            if not weight.is_finite() or weight <= 0 or weight > MAX_WEIGHT or weight != weight.quantize(Decimal("0.01")):
                raise InvalidOrder("El peso debe ser positivo, finito, con hasta dos decimales y máximo 99999999.99 kg.")
        except InvalidOperation as error:
            raise InvalidOrder("Peso inválido.") from error
        return OrderData(customer, address, district, start.isoformat(), end.isoformat(), float(weight), instructions)


def require_editable(order: Order, expected_version: int) -> None:
    if isinstance(expected_version, bool) or not isinstance(expected_version, int) or expected_version < 1:
        raise InvalidOrder("La versión debe ser un entero positivo.")
    if order.version != expected_version:
        raise OrderConflict("El pedido cambió. Vuelve a cargarlo antes de modificarlo.")
    if order.status != OrderStatus.PENDING or order.driver_id is not None:
        raise OrderConflict("Solo se puede modificar o cancelar un pedido pendiente y sin conductor.")


def update_order(order: Order, data: OrderData, expected_version: int) -> Order:
    require_editable(order, expected_version)
    fields = data.validated()
    return replace(order, **vars(fields), version=order.version + 1)


def cancel_order(order: Order, expected_version: int) -> Order:
    require_editable(order, expected_version)
    return replace(order, status=OrderStatus.CANCELLED, version=order.version + 1)
