"""Adaptadores en memoria del dashboard (datos semilla del mock de diseno).

Sustituir por adaptadores PostgreSQL cuando exista el esquema de BD.
"""
from datetime import date, datetime, time
from zoneinfo import ZoneInfo

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

_DISTRICTS = [
    District("150103", "Ate"),
    District("150122", "Miraflores"),
    District("150131", "San Isidro"),
    District("150140", "Santiago de Surco"),
]

# clave None = todos los distritos
_SEED: dict[str | None, tuple[OrderCounts, WindowCompliance, float, float]] = {
    None: (OrderCounts(812, 96, 312, 28), WindowCompliance(813, 751), 3482.6, 912.4),
    "150103": (OrderCounts(214, 31, 88, 7), WindowCompliance(220, 197), 921.3, 241.0),
    "150122": (OrderCounts(156, 18, 42, 4), WindowCompliance(160, 151), 512.8, 134.4),
    "150131": (OrderCounts(131, 12, 37, 3), WindowCompliance(134, 126), 438.2, 114.8),
}

_LIMA = ZoneInfo("America/Lima")


class InMemoryDashboardMetrics(DashboardMetricsPort):
    def get_order_counts(self, day: date, district_id: str | None) -> OrderCounts:
        return _SEED.get(district_id, (OrderCounts(0,0,0,0), WindowCompliance(0,0),0,0))[0]

    def get_window_compliance(
        self, day: date, district_id: str | None
    ) -> WindowCompliance:
        return _SEED.get(district_id, (OrderCounts(0,0,0,0), WindowCompliance(0,0),0,0))[1]

    def get_fleet_distance_km(self, day: date, district_id: str | None) -> float:
        return _SEED[district_id][2]

    def get_co2_emitted_kg(self, day: date, district_id: str | None) -> float:
        return _SEED[district_id][3]


class InMemoryDistrictCatalog(DistrictCatalogPort):
    def list_districts(self) -> list[District]:
        return list(_DISTRICTS)

    def exists(self, district_id: str) -> bool:
        return any(d.id == district_id for d in _DISTRICTS)


class InMemoryOperationalDay(OperationalDayPort):
    def has_routes(self, day: date, district_id: str | None) -> bool:
        return district_id is None or district_id in _SEED

    def operating_hours(self) -> OperatingHours:
        return OperatingHours(start=time(5, 0), end=time(22, 0))


class SystemClock(ClockPort):
    def now(self) -> datetime:
        return datetime.now(_LIMA)
