from datetime import date, datetime

import pytest

from application.use_cases.get_dashboard_summary import GetDashboardSummary
from application.use_cases.list_districts import ListDistricts
from domain.exceptions.dashboard import DistrictNotFoundError
from domain.value_objects.dashboard import District, OrderCounts, WindowCompliance
from tests.application.fakes import (
    LIMA,
    FakeCatalog,
    FakeMetrics,
    FakeOperationalDay,
    FixedClock,
)

TODAY = date(2026, 10, 1)
NOON = datetime(2026, 10, 1, 12, 0, tzinfo=LIMA)
ATE = District(id="150103", name="Ate")


def build(has_routes=True, now=NOON, compliance_target=90.0):
    metrics = FakeMetrics()
    use_case = GetDashboardSummary(
        metrics=metrics,
        districts=FakeCatalog([ATE]),
        operational_day=FakeOperationalDay(has_routes),
        clock=FixedClock(now),
        compliance_target=compliance_target,
    )
    return use_case, metrics


def test_summary_assembles_metrics_from_ports():
    use_case, _ = build()

    summary = use_case.execute(day=TODAY)

    assert summary.has_routes is True
    assert summary.orders == OrderCounts(10, 2, 5, 1)
    assert summary.window_compliance.compliance == WindowCompliance(20, 18)
    assert summary.window_compliance.percentage == 90.0
    assert summary.fleet_distance_km == 123.4
    assert summary.co2_kg == 56.7
    assert summary.generated_at == NOON


def test_day_defaults_to_the_clock_date():
    use_case, metrics = build()

    summary = use_case.execute()

    assert summary.day == TODAY
    assert {call[1] for call in metrics.calls} == {TODAY}


def test_unknown_district_raises_district_not_found():
    use_case, _ = build()

    with pytest.raises(DistrictNotFoundError) as error:
        use_case.execute(day=TODAY, district_id="999999")

    assert error.value.district_id == "999999"


def test_known_district_is_forwarded_to_metrics():
    use_case, metrics = build()

    summary = use_case.execute(day=TODAY, district_id="150103")

    assert summary.district_id == "150103"
    assert {call[2] for call in metrics.calls} == {"150103"}


def test_empty_district_id_means_all_districts():
    use_case, metrics = build()

    summary = use_case.execute(day=TODAY, district_id="")

    assert summary.district_id is None
    assert {call[2] for call in metrics.calls} == {None}


def test_day_without_routes_yields_empty_summary_and_skips_metrics():
    use_case, metrics = build(has_routes=False)

    summary = use_case.execute(day=TODAY)

    assert summary.has_routes is False
    assert summary.orders == OrderCounts(0, 0, 0, 0)
    assert summary.window_compliance.percentage is None
    assert summary.fleet_distance_km == 0.0
    assert summary.co2_kg == 0.0
    assert metrics.calls == []


def test_compliance_target_is_carried_in_the_summary():
    use_case, _ = build(compliance_target=95.0)

    assert use_case.execute(day=TODAY).window_compliance.target == 95.0


def test_compliance_target_defaults_to_ninety_and_can_be_disabled():
    default_case, _ = build()
    disabled_case, _ = build(compliance_target=None)

    assert default_case.execute(day=TODAY).window_compliance.target == 90.0
    assert disabled_case.execute(day=TODAY).window_compliance.target is None


def test_operating_hours_come_from_the_operational_day_port():
    use_case, _ = build()

    hours = use_case.execute(day=TODAY).operating_hours

    assert (hours.start.hour, hours.end.hour) == (5, 22)


@pytest.mark.parametrize(
    "now, expected",
    [
        (datetime(2026, 10, 1, 12, 0, tzinfo=LIMA), True),
        (datetime(2026, 10, 1, 4, 59, tzinfo=LIMA), False),
        (datetime(2026, 10, 1, 22, 30, tzinfo=LIMA), False),
    ],
)
def test_in_progress_when_now_is_within_operating_hours_of_that_day(now, expected):
    use_case, _ = build(now=now)

    assert use_case.execute(day=TODAY).in_progress is expected


def test_past_day_is_never_in_progress():
    use_case, _ = build()

    assert use_case.execute(day=date(2026, 9, 30)).in_progress is False


def test_future_day_is_never_in_progress():
    use_case, _ = build()

    assert use_case.execute(day=date(2026, 10, 2)).in_progress is False


def test_list_districts_returns_the_catalog():
    use_case = ListDistricts(FakeCatalog([ATE]))

    assert use_case.execute() == [ATE]
