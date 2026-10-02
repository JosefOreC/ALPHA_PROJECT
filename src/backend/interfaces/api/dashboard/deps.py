"""Proveedores de dependencias (cableado con adaptadores en memoria).

Sobrescribibles con ``app.dependency_overrides``.
"""
from application.use_cases.get_dashboard_summary import GetDashboardSummary
from application.use_cases.list_districts import ListDistricts
from infrastructure.persistence.in_memory_dashboard import (
    InMemoryDashboardMetrics,
    InMemoryDistrictCatalog,
    InMemoryOperationalDay,
    SystemClock,
)


def get_dashboard_summary_use_case() -> GetDashboardSummary:
    return GetDashboardSummary(
        metrics=InMemoryDashboardMetrics(),
        districts=InMemoryDistrictCatalog(),
        operational_day=InMemoryOperationalDay(),
        clock=SystemClock(),
    )


def get_list_districts_use_case() -> ListDistricts:
    return ListDistricts(InMemoryDistrictCatalog())
