import unittest
import json
from dataclasses import asdict, replace

from fastapi.testclient import TestClient

from application.use_cases.confirm_delivery import Principal
from application.use_cases.manage_orders import ManagementPrincipal
from domain.entities.order import OrderStatus
from infrastructure.persistence.memory_orders import MemoryOrderRepository
from manage import create_app
from tests.test_manage_orders import valid_data


class ManagementApiTests(unittest.TestCase):
    def setUp(self):
        self.repo = MemoryOrderRepository()
        self.actor = ManagementPrincipal("operador-ficticio", "OPERADOR")
        # Autenticación y protección falsas exclusivamente en esta prueba aislada.
        self.client = TestClient(create_app(self.repo, lambda: self.actor, lambda: None))
        self.body = asdict(valid_data())

    def create(self):
        response = self.client.post("/api/pedidos", json=self.body)
        self.assertEqual(response.status_code, 201, response.text)
        return response.json()

    def test_crud_and_read_dto(self):
        order = self.create()
        path = "/api/pedidos/" + order["id"]
        self.assertFalse(order["assigned"])
        self.assertNotIn("driver_id", order)
        self.assertEqual(self.client.get(path).json(), order)
        self.assertEqual(self.client.get("/api/pedidos").json()["items"], [order])
        updated = self.client.put(path, json={**self.body, "customer": "Actualización ficticia", "expected_version": 1})
        self.assertEqual(updated.status_code, 200)
        self.assertEqual(updated.json()["version"], 2)
        self.assertEqual(self.client.put(path, json={**self.body, "expected_version": 1}).status_code, 409)
        self.assertEqual(self.client.post(path + "/cancelacion", json={"expected_version": 1}).status_code, 409)
        cancelled = self.client.post(path + "/cancelacion", json={"expected_version": 2})
        self.assertEqual(cancelled.status_code, 200)
        self.assertEqual(cancelled.json()["status"], "CANCELADO")
        self.assertEqual(self.client.put(path, json={**self.body, "expected_version": 3}).status_code, 409)
        self.assertEqual(self.client.delete(path).status_code, 405)

    def test_mass_assignment_and_invalid_payloads(self):
        for field, value in (("id", "fake"), ("driver_id", "d1"), ("role", "ADMIN"),
                             ("status", "ENTREGADO"), ("confirmed_at", "2026-10-01"), ("version", 99)):
            with self.subTest(field=field):
                self.assertEqual(self.client.post("/api/pedidos", json={**self.body, field: value}).status_code, 422)
        for value in ("4.5", True, None, {}, -1, 0, 1.001):
            self.assertEqual(self.client.post("/api/pedidos", json={**self.body, "weight_kg": value}).status_code, 422)
        for extra in ({"window_end": self.body["window_start"]}, {"customer": " "},
                      {"district": "Fuera de cobertura"}, {"window_start": "2026-02-30T10:00:00-05:00"}):
            self.assertEqual(self.client.post("/api/pedidos", json={**self.body, **extra}).status_code, 422)
        self.assertEqual(self.client.get("/api/pedidos").json()["items"], [])

    def test_nonfinite_json_does_not_crash_or_echo_payload(self):
        for value in (float("nan"), float("inf"), -float("inf")):
            response = self.client.post("/api/pedidos", content=json.dumps({**self.body, "weight_kg": value}),
                                        headers={"Content-Type": "application/json"})
            self.assertEqual(response.status_code, 422)
            self.assertNotIn("input", response.json()["detail"][0])
            self.assertNotIn(self.body["customer"], response.text)

    def test_permissions_endpoint_and_untrusted_headers(self):
        self.assertEqual(self.client.get("/api/pedidos/permisos").json(), {"can_write": True})
        reader = TestClient(create_app(self.repo, lambda: ManagementPrincipal("ficticio", "AUDITOR")))
        self.assertEqual(reader.get("/api/pedidos/permisos").json(), {"can_write": False})
        closed = TestClient(create_app(self.repo))
        self.assertEqual(closed.get("/api/pedidos/permisos", headers={"X-Role": "ADMIN", "X-User": "ficticio"}).status_code, 401)

    def test_protected_fields_on_update_and_cancellation(self):
        order = self.create()
        path = "/api/pedidos/" + order["id"]
        for field in ("id", "driver_id", "confirmed_at", "status", "role"):
            self.assertEqual(self.client.put(path, json={**self.body, "expected_version": 1, field: "fake"}).status_code, 422)
        for version in (True, "1", None, 0):
            self.assertEqual(self.client.post(path + "/cancelacion", json={"expected_version": version}).status_code, 422)
        self.assertEqual(self.client.put(path, json={"expected_version": 1}).status_code, 422)

    def test_no_session_all_routes_fail_closed(self):
        client = TestClient(create_app(self.repo))
        for method, path, body in (("get", "/api/pedidos", None), ("get", "/api/pedidos/missing", None),
                                   ("post", "/api/pedidos", self.body),
                                   ("put", "/api/pedidos/missing", {**self.body, "expected_version": 1}),
                                   ("post", "/api/pedidos/missing/cancelacion", {"expected_version": 1})):
            response = client.request(method, path, **({"json": body} if body is not None else {}))
            self.assertEqual(response.status_code, 401)

    def test_mutations_blocked_without_integrated_protection(self):
        order = self.create()
        client = TestClient(create_app(self.repo, lambda: self.actor))
        self.assertEqual(client.get("/api/pedidos").status_code, 200)
        self.assertEqual(client.post("/api/pedidos", json=self.body).status_code, 403)
        self.assertEqual(client.put("/api/pedidos/" + order["id"], json={**self.body, "expected_version": 1}).status_code, 403)
        self.assertEqual(client.post("/api/pedidos/" + order["id"] + "/cancelacion", json={"expected_version": 1}).status_code, 403)

    def test_roles_enforced_on_server_and_list(self):
        order = self.create()
        for role in ("CONDUCTOR", "CLIENTE", "desconocido", "AUDITOR", "RESPONSABLE_LOGISTICA", "ADMIN"):
            client = TestClient(create_app(self.repo, lambda: ManagementPrincipal("ficticio", role), lambda: None))
            read_status = 403 if role in {"CLIENTE", "desconocido"} else 200
            self.assertEqual(client.get("/api/pedidos").status_code, read_status)
            self.assertEqual(client.get("/api/pedidos/" + order["id"]).status_code, read_status)
            if role != "ADMIN":
                self.assertEqual(client.post("/api/pedidos", json=self.body).status_code, 403)
                self.assertEqual(client.put("/api/pedidos/" + order["id"], json={**self.body, "expected_version": 1}).status_code, 403)
                self.assertEqual(client.post("/api/pedidos/" + order["id"] + "/cancelacion", json={"expected_version": 1}).status_code, 403)

    def test_server_pagination_filters_and_errors(self):
        self.create()
        self.create()
        first = self.client.get("/api/pedidos?limit=1").json()
        second = self.client.get("/api/pedidos?limit=1&offset=1").json()
        self.assertTrue(first["has_more"])
        self.assertFalse(second["has_more"])
        self.assertNotEqual(first["items"][0]["id"], second["items"][0]["id"])
        self.assertEqual(self.client.get("/api/pedidos?district=Ate").json()["items"], [])
        for query in ("limit=101", "limit=0", "offset=-1", "offset=100001", "status=foo", "district=foo", "limit=abc"):
            self.assertEqual(self.client.get("/api/pedidos?" + query).status_code, 422)
        self.assertEqual(self.client.get("/api/pedidos/missing").status_code, 404)
        self.assertEqual(self.client.put("/api/pedidos/missing", json={**self.body, "expected_version": 1}).status_code, 404)
        self.assertEqual(self.client.post("/api/pedidos/missing/cancelacion", json={"expected_version": 1}).status_code, 404)

    def test_driver_and_management_use_same_source(self):
        created = self.create()
        order = self.repo.get(created["id"])
        self.repo.save(replace(order, driver_id="d1", status=OrderStatus.IN_TRANSIT))
        driver = TestClient(create_app(self.repo, lambda: Principal("d1", "CONDUCTOR"), lambda: None))
        path = "/api/conductor/pedidos/" + order.id
        self.assertEqual(driver.get(path).status_code, 200)
        confirmed = driver.post(path + "/confirmacion").json()
        self.assertEqual(confirmed["status"], "ENTREGADO")
        self.assertEqual(self.client.get("/api/pedidos/" + order.id).json()["confirmed_at"], confirmed["confirmed_at"])
        self.assertEqual(self.client.put("/api/pedidos/" + order.id, json={**self.body, "expected_version": 1}).status_code, 409)
