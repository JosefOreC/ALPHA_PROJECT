"""Fakes de puertos para tests del caso de uso (comportamiento real, sin mocks)."""
from datetime import date, datetime, time, timedelta, timezone

from domain.ports.dashboard import (
    ClockPort,
    DashboardMetricsPort,
    DistrictCatalogPort,
    OperationalDayPort,
)
from domain.value_objects.dashboard import (
    District,
    OperatingHours,
    OrderCounts,
    WindowCompliance,
)

LIMA = timezone(timedelta(hours=-5))


class FixedClock(ClockPort):
    def __init__(self, moment: datetime) -> None:
        self._moment = moment

    def now(self) -> datetime:
        return self._moment


class FakeMetrics(DashboardMetricsPort):
    def __init__(self) -> None:
        self.calls: list[tuple[str, date, str | None]] = []

    def _record(self, name: str, day: date, district_id: str | None) -> None:
        self.calls.append((name, day, district_id))

    def get_order_counts(self, day, district_id):
        self._record("order_counts", day, district_id)
        return OrderCounts(delivered=10, in_transit=2, pending=5, cancelled=1)

    def get_window_compliance(self, day, district_id):
        self._record("window_compliance", day, district_id)
        return WindowCompliance(evaluated=20, within_window=18)

    def get_fleet_distance_km(self, day, district_id):
        self._record("distance", day, district_id)
        return 123.4

    def get_co2_emitted_kg(self, day, district_id):
        self._record("co2", day, district_id)
        return 56.7


class FakeCatalog(DistrictCatalogPort):
    def __init__(self, districts: list[District]) -> None:
        self._districts = districts

    def list_districts(self) -> list[District]:
        return list(self._districts)

    def exists(self, district_id: str) -> bool:
        return any(d.id == district_id for d in self._districts)


class FakeOperationalDay(OperationalDayPort):
    def __init__(self, has_routes: bool = True) -> None:
        self._has_routes = has_routes

    def has_routes(self, day: date, district_id: str | None) -> bool:
        return self._has_routes

    def operating_hours(self) -> OperatingHours:
        return OperatingHours(start=time(5, 0), end=time(22, 0))
