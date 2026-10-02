from datetime import date, time, timedelta

import pytest

from domain.value_objects.dashboard import (
    District,
    OperatingHours,
    OrderCounts,
    WindowCompliance,
)
from infrastructure.persistence.in_memory_dashboard import (
    InMemoryDashboardMetrics,
    InMemoryDistrictCatalog,
    InMemoryOperationalDay,
    SystemClock,
)

DAY = date(2026, 10, 1)


def test_catalog_lists_the_four_seed_districts():
    assert InMemoryDistrictCatalog().list_districts() == [
        District("150103", "Ate"),
        District("150122", "Miraflores"),
        District("150131", "San Isidro"),
        District("150140", "Santiago de Surco"),
    ]


def test_catalog_knows_existing_and_unknown_districts():
    catalog = InMemoryDistrictCatalog()

    assert catalog.exists("150103") is True
    assert catalog.exists("999999") is False


@pytest.mark.parametrize(
    "district, counts, compliance, km, co2",
    [
        (None, OrderCounts(812, 96, 312, 28), WindowCompliance(813, 751), 3482.6, 912.4),
        ("150103", OrderCounts(214, 31, 88, 7), WindowCompliance(220, 197), 921.3, 241.0),
        ("150122", OrderCounts(156, 18, 42, 4), WindowCompliance(160, 151), 512.8, 134.4),
        ("150131", OrderCounts(131, 12, 37, 3), WindowCompliance(134, 126), 438.2, 114.8),
    ],
)
def test_metrics_reproduce_the_design_mock(district, counts, compliance, km, co2):
    metrics = InMemoryDashboardMetrics()

    assert metrics.get_order_counts(DAY, district) == counts
    assert metrics.get_window_compliance(DAY, district) == compliance
    assert metrics.get_fleet_distance_km(DAY, district) == km
    assert metrics.get_co2_emitted_kg(DAY, district) == co2


def test_metrics_are_day_independent():
    metrics = InMemoryDashboardMetrics()

    assert metrics.get_order_counts(DAY, None) == metrics.get_order_counts(
        DAY - timedelta(days=30), None
    )


def test_all_districts_and_three_with_routes_have_routes_but_surco_does_not():
    operational = InMemoryOperationalDay()

    assert operational.has_routes(DAY, None) is True
    assert operational.has_routes(DAY, "150103") is True
    assert operational.has_routes(DAY, "150140") is False


def test_operating_hours_are_five_to_ten_pm():
    assert InMemoryOperationalDay().operating_hours() == OperatingHours(
        time(5, 0), time(22, 0)
    )


def test_system_clock_returns_lima_time_utc_minus_five():
    now = SystemClock().now()

    assert now.utcoffset() == timedelta(hours=-5)
