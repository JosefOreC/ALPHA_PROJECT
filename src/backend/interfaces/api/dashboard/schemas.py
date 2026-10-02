"""Modelos de respuesta HTTP del dashboard."""
from datetime import date, datetime, time

from pydantic import BaseModel

from application.dto.dashboard import DashboardSummary
from domain.value_objects.dashboard import District


class OrdersSchema(BaseModel):
    delivered: int
    in_transit: int
    pending: int
    cancelled: int
    total: int


class WindowComplianceSchema(BaseModel):
    evaluated: int
    within_window: int
    percentage: float | None
    target: float | None


class OperatingHoursSchema(BaseModel):
    start: time
    end: time


class DashboardSummarySchema(BaseModel):
    day: date
    district_id: str | None
    has_routes: bool
    orders: OrdersSchema
    window_compliance: WindowComplianceSchema
    fleet_distance_km: float
    co2_kg: float
    operating_hours: OperatingHoursSchema
    in_progress: bool
    generated_at: datetime

    @classmethod
    def from_dto(cls, dto: DashboardSummary) -> "DashboardSummarySchema":
        compliance = dto.window_compliance
        return cls(
            day=dto.day,
            district_id=dto.district_id,
            has_routes=dto.has_routes,
            orders=OrdersSchema(
                delivered=dto.orders.delivered,
                in_transit=dto.orders.in_transit,
                pending=dto.orders.pending,
                cancelled=dto.orders.cancelled,
                total=dto.orders.total,
            ),
            window_compliance=WindowComplianceSchema(
                evaluated=compliance.compliance.evaluated,
                within_window=compliance.compliance.within_window,
                percentage=compliance.percentage,
                target=compliance.target,
            ),
            fleet_distance_km=dto.fleet_distance_km,
            co2_kg=dto.co2_kg,
            operating_hours=OperatingHoursSchema(
                start=dto.operating_hours.start, end=dto.operating_hours.end
            ),
            in_progress=dto.in_progress,
            generated_at=dto.generated_at,
        )


class DistrictSchema(BaseModel):
    id: str
    name: str

    @classmethod
    def from_domain(cls, district: District) -> "DistrictSchema":
        return cls(id=district.id, name=district.name)
