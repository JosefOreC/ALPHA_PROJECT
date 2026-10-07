"""Adaptador preparado para el futuro contrato de pedidos; nunca crea ni migra tablas.

Importar este módulo no conecta a ninguna base ni requiere Psycopg instalado.
La activación es explícita y necesita el esquema acordado en la documentación CRUD.
"""
from contextlib import contextmanager
from decimal import Decimal
from threading import local
from typing import Callable

from domain.entities.order import Order
from domain.exceptions.order_conflict import OrderConflict
from domain.value_objects import OrderStatus

COLUMNS = ("pedido_id", "conductor_id", "cliente_nombre", "direccion_entrega", "distrito",
           "ventana_inicio", "ventana_fin", "peso_kg", "instrucciones", "estado", "confirmed_at", "version")
SELECT_COLUMNS = ", ".join(COLUMNS)


def values(order: Order) -> tuple:
    return (order.id, order.driver_id, order.customer, order.address, order.district,
            order.window_start, order.window_end, Decimal(str(order.weight_kg)), order.instructions,
            order.status.value, order.confirmed_at, order.version)


def from_row(row: tuple) -> Order:
    data = dict(zip(COLUMNS, row, strict=True))
    return Order(
        id=str(data["pedido_id"]), driver_id=str(data["conductor_id"]) if data["conductor_id"] is not None else None,
        customer=data["cliente_nombre"], address=data["direccion_entrega"], district=data["distrito"],
        window_start=data["ventana_inicio"].isoformat(), window_end=data["ventana_fin"].isoformat(),
        weight_kg=float(data["peso_kg"]), instructions=data["instrucciones"],
        status=OrderStatus(data["estado"]), confirmed_at=data["confirmed_at"], version=data["version"],
    )


class PostgresOrderRepository:
    def __init__(self, connect: Callable):
        self._connect = connect
        self._local = local()
        self._local.connection = None

    @contextmanager
    def _session(self):
        connection = self._current_connection()
        if connection is not None:
            yield connection
        else:
            with self._connect() as connection:
                yield connection

    def _current_connection(self):
        # threading.local inicializa por hilo, sin ocultar contratos de repositorio.
        try:
            return self._local.connection
        except AttributeError:
            self._local.connection = None
            return None

    @contextmanager
    def transaction(self):
        current = self._current_connection()
        if current is not None:
            with current.transaction():
                yield
            return
        with self._connect() as connection:
            self._local.connection = connection
            try:
                with connection.transaction():
                    yield
            finally:
                self._local.connection = None

    def get(self, order_id: str) -> Order | None:
        # UUID inválido no llega al motor como error de conversión ni fuga SQL.
        from uuid import UUID
        try:
            UUID(order_id)
        except (ValueError, TypeError, AttributeError):
            return None
        lock = " FOR UPDATE" if self._current_connection() is not None else ""
        with self._session() as connection:
            row = connection.execute(f"SELECT {SELECT_COLUMNS} FROM pedidos WHERE pedido_id = %s{lock}", (order_id,)).fetchone()
            return from_row(row) if row is not None else None

    def add(self, order: Order) -> None:
        connection = self._current_connection()
        if connection is None:
            raise RuntimeError("El registro requiere una transacción explícita.")
        placeholders = ", ".join(["%s"] * len(COLUMNS))
        cursor = connection.execute(
            f"INSERT INTO pedidos ({SELECT_COLUMNS}) VALUES ({placeholders}) ON CONFLICT (pedido_id) DO NOTHING",
            values(order),
        )
        if cursor.rowcount != 1:
            raise OrderConflict("Ya existe un pedido con ese identificador.")

    def save(self, order: Order) -> None:
        connection = self._current_connection()
        if connection is None:
            raise RuntimeError("La actualización requiere una transacción explícita.")
        assignments = ", ".join(f"{column} = %s" for column in COLUMNS[1:])
        cursor = connection.execute(
            f"UPDATE pedidos SET {assignments} WHERE pedido_id = %s AND version = %s",
            values(order)[1:] + (order.id, order.version - 1),
        )
        if cursor.rowcount != 1:
            raise OrderConflict("El pedido cambió. Vuelve a cargarlo antes de modificarlo.")

    def list(self, *, limit: int, offset: int, status: OrderStatus | None = None,
             district: str | None = None) -> list[Order]:
        clauses, parameters = [], []
        if status is not None:
            clauses.append("estado = %s")
            parameters.append(status.value)
        if district is not None:
            clauses.append("distrito = %s")
            parameters.append(district)
        where = " WHERE " + " AND ".join(clauses) if clauses else ""
        parameters.extend((limit, offset))
        with self._session() as connection:
            rows = connection.execute(
                f"SELECT {SELECT_COLUMNS} FROM pedidos{where} ORDER BY pedido_id LIMIT %s OFFSET %s",
                tuple(parameters),
            ).fetchall()
            return [from_row(row) for row in rows]


def postgres_repository(dsn: str) -> PostgresOrderRepository:
    """Usar solo después de configurar identidad, protección y esquema aprobado."""
    import psycopg
    return PostgresOrderRepository(lambda: psycopg.connect(dsn, autocommit=True))
