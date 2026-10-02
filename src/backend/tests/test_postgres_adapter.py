"""Pruebas unitarias de SQL/mapeo con dobles; NO son integración PostgreSQL."""
import unittest
from contextlib import contextmanager
from dataclasses import replace
from datetime import datetime, timezone
from decimal import Decimal
from uuid import uuid4

from domain.entities.order import Order, OrderConflict, OrderStatus
from infrastructure.persistence.postgres_orders import PostgresOrderRepository, from_row, values


class Cursor:
    rowcount = 1
    def __init__(self, row=None):
        self.row = row
    def fetchone(self):
        return self.row
    def fetchall(self):
        return [self.row] if self.row else []


class Connection:
    def __init__(self, row=None):
        self.calls = []
        self.cursor = Cursor(row)
        self.closed = False
        self.rollbacks = 0
        self.commits = 0
    def __enter__(self):
        return self
    def __exit__(self, *args):
        self.closed = True
    def execute(self, sql, parameters):
        self.calls.append((sql, parameters))
        return self.cursor
    @contextmanager
    def transaction(self):
        try:
            yield
        except Exception:
            self.rollbacks += 1
            raise
        else:
            self.commits += 1


class PostgresAdapterUnitTests(unittest.TestCase):
    def setUp(self):
        self.order = Order(str(uuid4()), None, "Ficticio", "Dirección ficticia", "Ate",
                           "2026-10-01T10:00:00-05:00", "2026-10-01T12:00:00-05:00", 2.5, "", OrderStatus.PENDING)
        self.row = (*values(self.order)[:5], datetime(2026, 10, 1, 15, tzinfo=timezone.utc),
                    datetime(2026, 10, 1, 17, tzinfo=timezone.utc), *values(self.order)[7:])
        self.connections = []
        def connect():
            connection = Connection(self.row)
            self.connections.append(connection)
            return connection
        self.repo = PostgresOrderRepository(connect)

    def test_mapping_decimal_optional_assignment_and_time(self):
        mapped = from_row(self.row)
        self.assertIsNone(mapped.driver_id)
        self.assertEqual(mapped.window_start, "2026-10-01T15:00:00+00:00")
        self.assertEqual(mapped.status, OrderStatus.PENDING)
        self.assertEqual(values(mapped)[7], Decimal("2.5"))

    def test_reads_close_connections_and_use_parameters(self):
        self.repo.get(self.order.id)
        connection = self.connections[0]
        sql, parameters = connection.calls[0]
        self.assertNotIn(self.order.id, sql)
        self.assertEqual(parameters, (self.order.id,))
        self.assertNotIn("FOR UPDATE", sql)
        self.assertTrue(connection.closed)

    def test_mutation_get_locks_same_connection(self):
        with self.repo.transaction():
            self.repo.get(self.order.id)
            self.repo.save(replace(self.order, version=2))
        self.assertEqual(len(self.connections), 1)
        self.assertIn("FOR UPDATE", self.connections[0].calls[0][0])
        self.assertEqual(self.connections[0].calls[1][1][-2:], (self.order.id, 1))
        self.assertEqual(self.connections[0].commits, 1)

    def test_rollback_and_connection_cleanup_on_error(self):
        with self.assertRaises(RuntimeError):
            with self.repo.transaction():
                self.repo.add(self.order)
                raise RuntimeError("Fallo ficticio")
        self.assertEqual(self.connections[0].rollbacks, 1)
        self.assertTrue(self.connections[0].closed)
        with self.repo.transaction():
            self.repo.add(self.order)
        self.assertEqual(len(self.connections), 2)

    def test_duplicate_and_stale_rows_report_conflict(self):
        for action in (lambda: self.repo.add(self.order), lambda: self.repo.save(replace(self.order, version=2))):
            with self.assertRaises(OrderConflict):
                with self.repo.transaction():
                    self.connections[-1].cursor.rowcount = 0
                    action()

    def test_no_write_outside_transaction(self):
        for action in (lambda: self.repo.add(self.order), lambda: self.repo.save(self.order)):
            with self.assertRaises(RuntimeError):
                action()
        self.assertEqual(self.connections, [])

    def test_filters_cannot_become_sql(self):
        injection = "' OR 1=1 --"
        self.repo.list(limit=20, offset=0, district=injection, status=OrderStatus.PENDING)
        sql, parameters = self.connections[0].calls[0]
        self.assertNotIn(injection, sql)
        self.assertEqual(parameters, ("PENDIENTE", injection, 20, 0))

    def test_invalid_uuid_is_not_queried(self):
        self.assertIsNone(self.repo.get("' OR 1=1 --"))
        self.assertEqual(self.connections, [])
