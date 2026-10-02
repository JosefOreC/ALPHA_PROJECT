from contextlib import AbstractContextManager
from datetime import datetime
from typing import Protocol

from domain.entities.order import Order


class OrderRepository(Protocol):
    def transaction(self) -> AbstractContextManager: ...
    def get(self, order_id: str) -> Order | None: ...
    def save(self, order: Order) -> None: ...


class Clock(Protocol):
    def now(self) -> datetime: ...
