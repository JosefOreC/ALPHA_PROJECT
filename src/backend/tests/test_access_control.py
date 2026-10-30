import json
from pathlib import Path
import pytest
from fastapi.testclient import TestClient
from domain.access_control import GRANTS, ROLE_ALIASES, Identity, can, scope_for
from domain.entities.order import Order
from infrastructure.persistence.memory_orders import MemoryOrderRepository
from interfaces.api.deps import create_app

ROLES = ["admin", "planner", "driver", "logistics", "auditor"]

def actor(role, driver_id="d1"):
    return Identity("test-" + role, "Usuario ficticio", role, driver_id if role == "driver" else None,
                    "ABC-123" if role == "driver" else None)

def client_for(role, repository=None, driver_id="d1"):
    return TestClient(create_app(repository, lambda: actor(role, driver_id), lambda: None))

def test_generated_policy_matches_the_shared_contract_exactly():
    policy = json.loads((Path(__file__).resolve().parents[2] / "shared/rbac.json").read_text(encoding="utf-8"))
    assert GRANTS == policy["permissions"]
    assert set(policy["roles"]) == set(ROLES)
    for role, metadata in policy["roles"].items():
        assert ROLE_ALIASES[metadata["code"]] == ROLE_ALIASES[metadata["backend"]] == role
    assert not can("ROL-06", "dashboard.read")
    assert not can("superadmin", "users.update")
    assert not can("admin", "unknown.permission")

@pytest.mark.parametrize("role", ROLES)
def test_read_permissions_across_the_common_api(role):
    client = client_for(role)
    assert client.get("/api/v1/vehicles").status_code == 200
    assert client.get("/api/pedidos").status_code == 200
    assert client.get("/api/v1/drivers").status_code == 200
    expected = 200 if role in {"admin", "planner", "logistics"} else 403
    assert client.get("/api/v1/dashboard").status_code == expected
    assert client.get("/api/v1/dashboard/districts").status_code == expected
    assert client.get("/api/pedidos/permisos").json() == {"can_write": role in {"admin", "planner"}}
    session = client.get("/api/session").json()
    assert session["role"] == role
    assert session["permissions"] == {key: scope_for(role, key) for key in GRANTS if scope_for(role, key)}

@pytest.mark.parametrize("role", ROLES)
def test_only_admin_and_operator_can_create_vehicles(role):
    plate = {"admin": "ADM-801", "planner": "OPR-802", "driver": "DRV-803", "logistics": "LOG-804", "auditor": "AUD-805"}[role]
    client = client_for(role)
    response = client.post("/api/v1/vehicles", json={"placa": plate, "capacidad_kg": 10.0, "tipo_combustible": "DIESEL"})
    assert response.status_code == (201 if role in {"admin", "planner"} else 403)

@pytest.mark.parametrize("method,path,body", [
    ("GET", "/api/session", None), ("GET", "/api/v1/vehicles", None),
    ("GET", "/api/v1/drivers", None), ("GET", "/api/v1/dashboard", None),
    ("GET", "/api/pedidos", None), ("GET", "/api/conductor/pedidos/p1", None),
    ("POST", "/api/v1/vehicles", {"placa": "BAD-999", "capacidad_kg": 10.0, "tipo_combustible": "DIESEL"}),
    ("POST", "/api/conductor/pedidos/p1/confirmacion", None), ("DELETE", "/api/session", None),
])
def test_no_client_claim_can_replace_a_verified_identity(method, path, body):
    client = TestClient(create_app())
    response = client.request(method, path, headers={"X-Role": "ADMIN", "X-User": "owner", "Authorization": "Bearer invented"},
                              params={"role": "admin", "driver_id": "d1"}, **({"json": body} if body else {}))
    assert response.status_code == 401

def test_driver_can_only_confirm_own_orders_and_requires_a_linked_profile():
    own = Order("own", "d1", "Ficticio", "Dirección ficticia", "Santa Anita", "10:00", "12:00", 1.0, "")
    other = Order("other", "d2", "Ficticio", "Dirección ficticia", "Santa Anita", "10:00", "12:00", 1.0, "")
    unassigned = Order("free", None, "Ficticio", "Dirección ficticia", "Santa Anita", "10:00", "12:00", 1.0, "")
    repo = MemoryOrderRepository([own, other, unassigned])
    for role in ROLES:
        client = client_for(role, repo)
        assert client.post("/api/conductor/pedidos/own/confirmacion").status_code == (200 if role == "driver" else 403)
    client = client_for("driver", repo)
    for order_id in ["other", "free", "missing"]:
        assert client.get("/api/conductor/pedidos/" + order_id).status_code == 404
        assert client.post("/api/conductor/pedidos/" + order_id + "/confirmacion").status_code == 404
    assert client_for("driver", repo, driver_id=None).get("/api/conductor/pedidos/free").status_code == 403
    assert repo.get("other").confirmed_at is None
    assert repo.get("free").confirmed_at is None

def test_driver_directory_is_limited_to_the_own_profile():
    admin = client_for("admin")
    created = []
    for index in range(2):
        response = admin.post("/api/v1/drivers", json={"nombre_completo": "Conductor ficticio", "dni": f"9810000{index}",
                             "licencia": f"R9810000{index}", "vehiculo_id": f"fake-rbac-{index}"})
        assert response.status_code == 201
        created.append(response.json()["conductor_id"])
    client = client_for("driver", driver_id=created[0])
    page = client.get("/api/v1/drivers").json()
    assert page["total"] == 1
    assert page["items"][0]["conductor_id"] == created[0]
    assert client.get("/api/v1/drivers/" + created[1]).status_code == 404
    assert client.get("/api/v1/drivers/" + created[0]).status_code == 200
    assert client_for("driver", driver_id=None).get("/api/v1/drivers").status_code == 403

def test_mutations_require_server_verified_protection_even_with_an_identity():
    client = TestClient(create_app(authenticate=lambda: actor("admin")))
    assert client.get("/api/v1/vehicles").status_code == 200
    assert client.post("/api/v1/vehicles", json={"placa": "CSF-888", "capacidad_kg": 10.0, "tipo_combustible": "DIESEL"},
                       headers={"X-CSRF-Token": "invented"}).status_code == 403
    assert client.delete("/api/session").status_code == 403

def test_default_dependencies_accept_trusted_server_state_and_reject_revoked_sessions():
    app = create_app()
    active = True

    def revoke():
        nonlocal active
        active = False

    @app.middleware("http")
    async def verified_test_provider(request, call_next):
        # Doble del proveedor del servidor; no toma identidad ni permisos del cliente.
        if active:
            request.state.identity = Identity("test-user", "Usuario ficticio", "ADMIN")
            request.state.mutation_verified = True
            request.state.revoke_session = revoke
        return await call_next(request)

    client = TestClient(app)
    assert client.get("/api/session").json()["role"] == "admin"
    assert client.delete("/api/session").status_code == 204
    assert client.get("/api/session").status_code == 401
    assert client.get("/api/v1/vehicles").status_code == 401
