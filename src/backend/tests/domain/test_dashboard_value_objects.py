from datetime import time

import pytest

from domain.value_objects.dashboard import (
    District,
    OperatingHours,
    OrderCounts,
    WindowCompliance,
)


def test_order_counts_total_sums_all_statuses():
    counts = OrderCounts(delivered=812, in_transit=96, pending=312, cancelled=28)

    assert counts.total == 1248


def test_order_counts_are_immutable():
    counts = OrderCounts(1, 2, 3, 4)

    with pytest.raises(Exception):
        counts.delivered = 9



def test_window_compliance_percentage_rounds_to_one_decimal():
    assert WindowCompliance(evaluated=813, within_window=751).percentage == 92.4


def test_window_compliance_percentage_is_none_when_nothing_evaluated():
    assert WindowCompliance(evaluated=0, within_window=0).percentage is None



def test_district_exposes_id_and_name():
    district = District(id="150103", name="Ate")

    assert (district.id, district.name) == ("150103", "Ate")


def test_operating_hours_expose_start_and_end():
    hours = OperatingHours(start=time(5, 0), end=time(22, 0))

    assert (hours.start, hours.end) == (time(5, 0), time(22, 0))
