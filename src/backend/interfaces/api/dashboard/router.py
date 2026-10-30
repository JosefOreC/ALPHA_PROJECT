"""Rutas HTTP del dashboard: solo traduccion HTTP <-> casos de uso."""
from datetime import date as date_type

from fastapi import APIRouter, Depends, HTTPException
from interfaces.api.security.deps import require_permission

from application.use_cases.get_dashboard_summary import GetDashboardSummary
from application.use_cases.list_districts import ListDistricts
from domain.exceptions.dashboard import DistrictNotFoundError
from interfaces.api.dashboard import deps
from interfaces.api.dashboard.schemas import DashboardSummarySchema, DistrictSchema

router = APIRouter(prefix="/api/v1/dashboard", tags=["dashboard"], dependencies=[Depends(require_permission("dashboard.read"))])


@router.get("", response_model=DashboardSummarySchema)
def get_dashboard(
    date: date_type | None = None,
    district: str | None = None,
    use_case: GetDashboardSummary = Depends(deps.get_dashboard_summary_use_case),
) -> DashboardSummarySchema:
    try:
        summary = use_case.execute(day=date, district_id=district)
    except DistrictNotFoundError:
        raise HTTPException(status_code=404, detail="Distrito no encontrado")
    return DashboardSummarySchema.from_dto(summary)


@router.get("/districts", response_model=list[DistrictSchema])
def list_districts(
    use_case: ListDistricts = Depends(deps.get_list_districts_use_case),
) -> list[DistrictSchema]:
    return [DistrictSchema.from_domain(d) for d in use_case.execute()]
