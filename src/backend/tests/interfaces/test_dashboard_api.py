from datetime import datetime

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from application.use_cases.get_dashboard_summary import GetDashboardSummary
from infrastructure.persistence.in_memory_dashboard import (
    InMemoryDashboardMetrics,
    InMemoryDistrictCatalog,
    InMemoryOperationalDay,
)
from interfaces.api.dashboard import deps
from interfaces.api.dashboard.router import router
from interfaces.api.security.deps import get_current_identity
from domain.access_control import Identity
from tests.application.fakes import LIMA, FixedClock


@pytest.fixture
def client() -> TestClient:
    app = FastAPI()
    app.include_router(router)
    app.dependency_overrides[get_current_identity] = lambda: Identity("test-logistics", "Logística ficticia", "logistics")
    fixed_use_case = GetDashboardSummary(
        metrics=InMemoryDashboardMetrics(),
        districts=InMemoryDistrictCatalog(),
        operational_day=InMemoryOperationalDay(),
        clock=FixedClock(datetime(2026, 10, 1, 12, 0, tzinfo=LIMA)),
    )
    app.dependency_overrides[deps.get_dashboard_summary_use_case] = lambda: fixed_use_case
    return TestClient(app)


def test_summary_for_all_districts_returns_the_design_mock(client):
    response = client.get("/api/v1/dashboard", params={"date": "2026-10-01"})

    assert response.status_code == 200
    assert response.json() == {
        "day": "2026-10-01",
        "district_id": None,
        "has_routes": True,
        "orders": {
            "delivered": 812,
            "in_transit": 96,
            "pending": 312,
            "cancelled": 28,
            "total": 1248,
        },
        "window_compliance": {
            "evaluated": 813,
            "within_window": 751,
            "percentage": 92.4,
            "target": 90.0,
        },
        "fleet_distance_km": 3482.6,
        "co2_kg": 912.4,
        "operating_hours": {"start": "05:00:00", "end": "22:00:00"},
        "in_progress": True,
        "generated_at": "2026-10-01T12:00:00-05:00",
    }


def test_summary_defaults_to_today_when_date_is_omitted(client):
    assert client.get("/api/v1/dashboard").json()["day"] == "2026-10-01"


def test_summary_filters_by_district(client):
    body = client.get("/api/v1/dashboard", params={"district": "150103"}).json()

    assert body["district_id"] == "150103"
    assert body["orders"]["delivered"] == 214


def test_empty_district_param_means_all_districts(client):
    body = client.get("/api/v1/dashboard", params={"district": ""}).json()

    assert body["district_id"] is None
    assert body["orders"]["delivered"] == 812


def test_district_without_routes_returns_empty_state(client):
    body = client.get("/api/v1/dashboard", params={"district": "150140"}).json()

    assert body["has_routes"] is False
    assert body["orders"]["total"] == 0
    assert body["window_compliance"]["percentage"] is None


def test_unknown_district_returns_404_with_spanish_message(client):
    response = client.get("/api/v1/dashboard", params={"district": "999999"})

    assert response.status_code == 404
    assert response.json() == {"detail": "Distrito no encontrado"}


def test_invalid_date_is_rejected_with_422(client):
    assert client.get("/api/v1/dashboard", params={"date": "ayer"}).status_code == 422


def test_districts_endpoint_lists_id_and_name(client):
    response = client.get("/api/v1/dashboard/districts")

    assert response.status_code == 200
    assert response.json()[0] == {"id": "150103", "name": "Ate"}
    assert len(response.json()) == 4


def test_standalone_dashboard_also_requires_a_verified_session():
    from interfaces.api.dashboard.app import app

    response = TestClient(app).get("/api/v1/dashboard/districts")

    assert response.status_code == 401
