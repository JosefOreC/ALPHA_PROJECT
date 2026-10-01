import unittest
from concurrent.futures import ThreadPoolExecutor
from dataclasses import replace
from datetime import datetime, timezone

from application.use_cases.confirm_delivery import DriverOrders, Forbidden, OrderNotFound, Principal
from application.use_cases.manage_orders import ManageOrders, ManagementPrincipal
from domain.entities.order import OrderConflict, OrderStatus
from domain.order_management import InvalidOrder, OrderData
from infrastructure.persistence.memory_orders import MemoryOrderRepository


class FixedIds:
    def new(self):
        return "pedido-ficticio"


class FixedClock:
    def now(self):
        return datetime(2026, 10, 1, 16, tzinfo=timezone.utc)


def valid_data():
    return OrderData("Destinatario ficticio", "Dirección ficticia 123", "Santa Anita",
                     "2026-10-01T10:00:00-05:00", "2026-10-01T12:00:00-05:00", 4.5, "")


class ManagementTests(unittest.TestCase):
    def setUp(self):
        self.repo = MemoryOrderRepository()
        self.service = ManageOrders(self.repo, FixedIds())
        self.actor = ManagementPrincipal("operador-ficticio", "OPERADOR")
        self.data = valid_data()

    def create(self):
        return self.service.create(self.data, self.actor)

    def test_create_list_view_update_cancel(self):
        order = self.create()
        self.assertEqual(order.status, OrderStatus.PENDING)
        self.assertIsNone(order.driver_id)
        self.assertEqual(self.service.list(self.actor), [order])
        self.assertEqual(self.service.view(order.id, self.actor), order)
        updated = self.service.update(order.id, replace(self.data, customer="Otro ficticio"), 1, self.actor)
        self.assertEqual(updated.version, 2)
        cancelled = self.service.cancel(order.id, 2, self.actor)
        self.assertEqual(cancelled.status, OrderStatus.CANCELLED)
        self.assertIsNone(cancelled.confirmed_at)
        self.assertEqual(cancelled.version, 3)

    def test_normalizes_text_and_preserves_inert_script(self):
        order = self.service.create(replace(self.data, customer="  <script>alert(1)</script>  "), self.actor)
        self.assertEqual(order.customer, "<script>alert(1)</script>")

    def test_invalid_inputs_do_not_persist(self):
        cases = {
            "customer": ["", "  ", "x" * 201, 12, None],
            "address": [" ", "x" * 501, {}],
            "district": ["Fuera de cobertura", "", "x" * 81],
            "instructions": ["x" * 1001, None],
            "weight_kg": [0, -1, float("nan"), float("inf"), "4.5", True, {}, 0.001, 100000000],
            "window_start": ["10:00", "2026-02-30T10:00:00-05:00", "2026-10-01T24:00:00-05:00",
                             "2026-10-01T10:00:00", "2026-10-01T10:00:00+15:00", "2026-10-01T10:00:00+05:90"],
            "window_end": ["2026-10-01T10:00:00-05:00", "2026-10-01T09:00:00-05:00"],
        }
        for field, values in cases.items():
            for value in values:
                with self.subTest(field=field, value=value):
                    with self.assertRaises(InvalidOrder):
                        self.service.create(replace(self.data, **{field: value}), self.actor)
                    self.assertEqual(self.repo.list(limit=100, offset=0), [])

    def test_approved_boundaries_and_offset_comparison(self):
        data = replace(self.data, customer="x" * 200, address="x" * 500, instructions="x" * 1000,
                       weight_kg=99999999.99, window_start="2026-10-01T15:00:00Z")
        order = self.service.create(data, self.actor)
        self.assertEqual(order.window_start, "2026-10-01T15:00:00+00:00")

    def test_duplicate_rejected_without_overwrite(self):
        order = self.create()
        with self.assertRaises(OrderConflict):
            self.service.create(replace(self.data, customer="Otra persona"), self.actor)
        self.assertEqual(self.repo.get(order.id), order)

    def test_permissions_for_each_operation(self):
        order = self.create()
        for role in ("ADMIN", "OPERADOR", "AUDITOR", "RESPONSABLE_LOGISTICA", "CONDUCTOR", "CLIENTE", "desconocido"):
            actor = ManagementPrincipal("ficticio", role)
            for operation in (lambda: self.service.list(actor), lambda: self.service.view(order.id, actor)):
                if role in {"ADMIN", "OPERADOR", "AUDITOR", "RESPONSABLE_LOGISTICA"}:
                    operation()
                else:
                    with self.assertRaises(Forbidden):
                        operation()
            for operation in (lambda: self.service.create(self.data, actor),
                              lambda: self.service.update(order.id, self.data, 1, actor),
                              lambda: self.service.cancel(order.id, 1, actor)):
                if role not in {"ADMIN", "OPERADOR"}:
                    with self.assertRaises(Forbidden):
                        operation()

    def test_missing_for_view_update_cancel(self):
        for action in (lambda: self.service.view("missing", self.actor),
                       lambda: self.service.update("missing", self.data, 1, self.actor),
                       lambda: self.service.cancel("missing", 1, self.actor)):
            with self.assertRaises(OrderNotFound):
                action()

    def test_stale_edit_and_cancel_rejected(self):
        order = self.create()
        changed = self.service.update(order.id, replace(self.data, weight_kg=2), 1, self.actor)
        for action in (lambda: self.service.update(order.id, self.data, 1, self.actor),
                       lambda: self.service.cancel(order.id, 1, self.actor)):
            with self.assertRaises(OrderConflict):
                action()
        self.assertEqual(self.repo.get(order.id), changed)

    def test_protected_states_and_assignment(self):
        order = self.create()
        for protected in (replace(order, status=OrderStatus.IN_TRANSIT),
                          replace(order, status=OrderStatus.DELIVERED, confirmed_at=FixedClock().now()),
                          replace(order, status=OrderStatus.CANCELLED), replace(order, driver_id="d1")):
            self.repo.save(protected)
            for action in (lambda: self.service.update(order.id, self.data, 1, self.actor),
                           lambda: self.service.cancel(order.id, 1, self.actor)):
                with self.assertRaises(OrderConflict):
                    action()
            self.assertEqual(self.repo.get(order.id), protected)

    def test_two_writers_only_one_succeeds(self):
        order = self.create()
        def update(weight):
            try:
                self.service.update(order.id, replace(self.data, weight_kg=weight), 1, self.actor)
                return "ok"
            except OrderConflict:
                return "conflict"
        with ThreadPoolExecutor(max_workers=2) as pool:
            self.assertCountEqual(list(pool.map(update, (2, 3))), ["ok", "conflict"])

    def test_confirmation_racing_with_management_preserves_delivery(self):
        order = replace(self.create(), status=OrderStatus.IN_TRANSIT, driver_id="d1")
        self.repo.save(order)
        driver = DriverOrders(self.repo, FixedClock())
        def cancel():
            with self.assertRaises(OrderConflict):
                self.service.cancel(order.id, 1, self.actor)
        with ThreadPoolExecutor(max_workers=2) as pool:
            list(pool.map(lambda action: action(), (cancel, lambda: driver.confirm(order.id, Principal("d1", "CONDUCTOR")))))
        confirmed = self.repo.get(order.id)
        self.assertEqual(confirmed.status, OrderStatus.DELIVERED)
        self.assertEqual(confirmed.confirmed_at, FixedClock().now())
        self.assertEqual(confirmed.version, 2)

    def test_filters_pagination_and_malformed_parameters(self):
        order = self.create()
        self.assertEqual(self.service.list(self.actor, district="Ate"), [])
        self.assertEqual(self.service.list(self.actor, status=OrderStatus.PENDING), [order])
        self.assertEqual(self.service.list(self.actor, offset=1), [])
        for params in ({"limit": 101}, {"limit": 0}, {"limit": True}, {"offset": -1},
                       {"offset": 100001}, {"status": "INVENTADO"}, {"district": "' OR 1=1 --"}):
            with self.assertRaises(InvalidOrder):
                self.service.list(self.actor, **params)

    def test_transaction_rolls_back(self):
        order = self.create()
        with self.assertRaises(RuntimeError):
            with self.repo.transaction():
                self.repo.save(replace(order, customer="Cambio"))
                raise RuntimeError("Fallo simulado")
        self.assertEqual(self.repo.get(order.id), order)
