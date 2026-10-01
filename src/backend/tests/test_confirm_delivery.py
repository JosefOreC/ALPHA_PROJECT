import unittest
from concurrent.futures import ThreadPoolExecutor
from dataclasses import replace
from datetime import datetime, timezone

from application.use_cases.confirm_delivery import DriverOrders, Forbidden, OrderNotFound, Principal
from domain.entities.order import Order, OrderConflict, OrderStatus
from infrastructure.persistence.memory_orders import MemoryOrderRepository


class FixedClock:
    def now(self):
        return datetime(2026, 10, 1, 15, 30, tzinfo=timezone.utc)


class ConfirmationTests(unittest.TestCase):
    def setUp(self):
        self.order = Order("p1", "d1", "Cliente", "Dirección", "Santa Anita", "10:00", "12:00", 4.5, "")
        self.repo = MemoryOrderRepository([self.order])
        self.service = DriverOrders(self.repo, FixedClock())
        self.driver = Principal("d1", "CONDUCTOR")

    def test_confirmation_persists_server_time(self):
        result = self.service.confirm("p1", self.driver)
        self.assertEqual(result.status, OrderStatus.DELIVERED)
        self.assertEqual(result.confirmed_at, FixedClock().now())
        self.assertEqual(self.repo.get("p1"), result)

    def test_repeated_confirmation_preserves_time(self):
        first = self.service.confirm("p1", self.driver)
        self.assertIs(self.service.confirm("p1", self.driver), first)

    def test_other_driver_cannot_view_or_confirm(self):
        for action in (self.service.view, self.service.confirm):
            with self.assertRaises(OrderNotFound):
                action("p1", Principal("d2", "CONDUCTOR"))
        self.assertEqual(self.repo.get("p1"), self.order)

    def test_other_role_is_forbidden(self):
        with self.assertRaises(Forbidden):
            self.service.confirm("p1", Principal("d1", "OPERADOR"))

    def test_invalid_states_do_not_change(self):
        for status in (OrderStatus.PENDING, OrderStatus.CANCELLED):
            order = replace(self.order, status=status)
            self.repo.save(order)
            with self.assertRaises(OrderConflict):
                self.service.confirm("p1", self.driver)
            self.assertEqual(self.repo.get("p1"), order)

    def test_missing_order(self):
        with self.assertRaises(OrderNotFound):
            self.service.view("missing", self.driver)

    def test_concurrent_confirmation_is_idempotent(self):
        with ThreadPoolExecutor(max_workers=4) as pool:
            results = list(pool.map(lambda _: self.service.confirm("p1", self.driver), range(12)))
        self.assertTrue(all(result is results[0] for result in results))


if __name__ == "__main__":
    unittest.main()
