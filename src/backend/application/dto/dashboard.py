"""DTOs del dashboard operativo."""
from dataclasses import dataclass
from datetime import date, datetime

from domain.value_objects.dashboard import (
    OperatingHours,
    OrderCounts,
    WindowCompliance,
)


@dataclass(frozen=True)
class WindowComplianceSummary:
    compliance: WindowCompliance
    target: float | None

    @property
    def percentage(self) -> float | None:
        return self.compliance.percentage


@dataclass(frozen=True)
class DashboardSummary:
    day: date
    district_id: str | None
    has_routes: bool
    orders: OrderCounts
    window_compliance: WindowComplianceSummary
    fleet_distance_km: float
    co2_kg: float
    operating_hours: OperatingHours
    in_progress: bool
    generated_at: datetime
