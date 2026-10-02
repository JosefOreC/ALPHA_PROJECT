"""Caso de uso: resumen del dashboard operativo."""
from datetime import date

from application.dto.dashboard import DashboardSummary, WindowComplianceSummary
from domain.exceptions.dashboard import DistrictNotFoundError
from domain.ports.dashboard import (
    ClockPort,
    DashboardMetricsPort,
    DistrictCatalogPort,
    OperationalDayPort,
)
from domain.value_objects.dashboard import OrderCounts, WindowCompliance


class GetDashboardSummary:
    def __init__(
        self,
        metrics: DashboardMetricsPort,
        districts: DistrictCatalogPort,
        operational_day: OperationalDayPort,
        clock: ClockPort,
        # SUPUESTO de diseno (no proviene de los requisitos): meta de cumplimiento 90 %.
        compliance_target: float | None = 90.0,
    ) -> None:
        self._metrics = metrics
        self._districts = districts
        self._operational_day = operational_day
        self._clock = clock
        self._compliance_target = compliance_target

    def execute(
        self, day: date | None = None, district_id: str | None = None
    ) -> DashboardSummary:
        now = self._clock.now()
        day = day or now.date()
        district_id = district_id or None
        if district_id is not None and not self._districts.exists(district_id):
            raise DistrictNotFoundError(district_id)
        hours = self._operational_day.operating_hours()
        in_progress = day == now.date() and hours.start <= now.time() < hours.end
        target = self._compliance_target

        if not self._operational_day.has_routes(day, district_id):
            return DashboardSummary(
                day=day,
                district_id=district_id,
                has_routes=False,
                orders=OrderCounts(0, 0, 0, 0),
                window_compliance=WindowComplianceSummary(
                    WindowCompliance(0, 0), target
                ),
                fleet_distance_km=0.0,
                co2_kg=0.0,
                operating_hours=hours,
                in_progress=in_progress,
                generated_at=now,
            )

        return DashboardSummary(
            day=day,
            district_id=district_id,
            has_routes=True,
            orders=self._metrics.get_order_counts(day, district_id),
            window_compliance=WindowComplianceSummary(
                self._metrics.get_window_compliance(day, district_id), target
            ),
            fleet_distance_km=self._metrics.get_fleet_distance_km(day, district_id),
            co2_kg=self._metrics.get_co2_emitted_kg(day, district_id),
            operating_hours=hours,
            in_progress=in_progress,
            generated_at=now,
        )
