import unittest
from dataclasses import replace

try:
    from fastapi.testclient import TestClient
except ImportError:
    TestClient = None

from application.use_cases.confirm_delivery import Principal
from domain.entities.order import Order, OrderStatus
from infrastructure.persistence.memory_orders import MemoryOrderRepository


@unittest.skipIf(TestClient is None, "Instalar requirements.txt para las pruebas HTTP")
class OrdersApiTests(unittest.TestCase):
    def setUp(self):
        from manage import create_app
        self.create_app = create_app
        self.order = Order("p1", "d1", "Cliente", "Dirección", "Santa Anita", "10:00", "12:00", 4.5, "")
        self.repo = MemoryOrderRepository([self.order])
        self.client = TestClient(create_app(self.repo, lambda: Principal("d1", "CONDUCTOR")))

    def test_view_and_confirmation(self):
        path = "/api/conductor/pedidos/p1"
        self.assertEqual(self.client.get(path).json()["status"], "EN_CAMINO")
        result = self.client.post(path + "/confirmacion")
        self.assertEqual(result.status_code, 200)
        self.assertEqual(result.json()["status"], "ENTREGADO")
        self.assertIsNotNone(result.json()["confirmed_at"])
        self.assertEqual(self.client.post(path + "/confirmacion").json(), result.json())

    def test_default_authentication_fails_closed(self):
        client = TestClient(self.create_app(self.repo))
        self.assertEqual(client.get("/api/conductor/pedidos/p1").status_code, 401)
        self.assertEqual(client.post("/api/conductor/pedidos/p1/confirmacion").status_code, 401)

    def test_http_permissions(self):
        for principal, status in [(Principal("d1", "OPERADOR"), 403), (Principal("d2", "CONDUCTOR"), 404)]:
            client = TestClient(self.create_app(self.repo, lambda: principal))
            self.assertEqual(client.get("/api/conductor/pedidos/p1").status_code, status)
            self.assertEqual(client.post("/api/conductor/pedidos/p1/confirmacion").status_code, status)

    def test_http_invalid_state(self):
        self.repo.save(replace(self.order, status=OrderStatus.CANCELLED))
        self.assertEqual(self.client.post("/api/conductor/pedidos/p1/confirmacion").status_code, 409)
