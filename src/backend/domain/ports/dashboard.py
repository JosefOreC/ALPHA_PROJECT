"""Puertos granulares del dashboard operativo."""
from abc import ABC, abstractmethod
from datetime import date, datetime

from domain.value_objects.dashboard import (
    District,
    OperatingHours,
    OrderCounts,
    WindowCompliance,
)


class DashboardMetricsPort(ABC):
    @abstractmethod
    def get_order_counts(self, day: date, district_id: str | None) -> OrderCounts: ...

    @abstractmethod
    def get_window_compliance(
        self, day: date, district_id: str | None
    ) -> WindowCompliance: ...

    @abstractmethod
    def get_fleet_distance_km(self, day: date, district_id: str | None) -> float: ...

    @abstractmethod
    def get_co2_emitted_kg(self, day: date, district_id: str | None) -> float: ...


class DistrictCatalogPort(ABC):
    @abstractmethod
    def list_districts(self) -> list[District]: ...

    @abstractmethod
    def exists(self, district_id: str) -> bool: ...


class OperationalDayPort(ABC):
    @abstractmethod
    def has_routes(self, day: date, district_id: str | None) -> bool: ...

    @abstractmethod
    def operating_hours(self) -> OperatingHours: ...


class ClockPort(ABC):
    @abstractmethod
    def now(self) -> datetime:
        """Hora actual con zona horaria (America/Lima, UTC-5)."""
