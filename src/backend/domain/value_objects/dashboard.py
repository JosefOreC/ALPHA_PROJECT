"""Value objects del dashboard operativo."""
from dataclasses import dataclass
from datetime import time


@dataclass(frozen=True)
class OrderCounts:
    delivered: int
    in_transit: int
    pending: int
    cancelled: int

    @property
    def total(self) -> int:
        return self.delivered + self.in_transit + self.pending + self.cancelled


@dataclass(frozen=True)
class WindowCompliance:
    evaluated: int
    within_window: int

    @property
    def percentage(self) -> float | None:
        if self.evaluated == 0:
            return None
        return round(self.within_window / self.evaluated * 100, 1)


@dataclass(frozen=True)
class District:
    id: str
    name: str


@dataclass(frozen=True)
class OperatingHours:
    start: time
    end: time
