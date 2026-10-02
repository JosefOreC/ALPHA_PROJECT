import inspect

import pytest

from domain.exceptions.dashboard import DistrictNotFoundError
from domain.ports.dashboard import (
    ClockPort,
    DashboardMetricsPort,
    DistrictCatalogPort,
    OperationalDayPort,
)


def test_district_not_found_error_keeps_the_district_id():
    error = DistrictNotFoundError("999999")

    assert error.district_id == "999999"
    assert "999999" in str(error)


@pytest.mark.parametrize(
    "port, methods",
    [
        (
            DashboardMetricsPort,
            {
                "get_order_counts",
                "get_window_compliance",
                "get_fleet_distance_km",
                "get_co2_emitted_kg",
            },
        ),
        (DistrictCatalogPort, {"list_districts", "exists"}),
        (OperationalDayPort, {"has_routes", "operating_hours"}),
        (ClockPort, {"now"}),
    ],
)
def test_ports_are_abstract_and_declare_their_methods(port, methods):
    assert inspect.isabstract(port)
    assert port.__abstractmethods__ == methods
