from fastapi.testclient import TestClient
from interfaces.api.deps import create_app
from domain.access_control import Identity

# Identidad y protección falsas únicamente para pruebas funcionales aisladas.
app = create_app(authenticate=lambda: Identity("test-admin", "Administrador ficticio", "admin"), protect_mutation=lambda: None)

client = TestClient(app)


def test_api_register_vehicle_success():
    payload = {
        "placa": "PRU-100",
        "capacidad_kg": 1750.5,
        "capacidad_m3": 9.0,
        "tipo_combustible": "GNV",
        "estado": "DISPONIBLE",
    }
    response = client.post("/api/v1/vehicles", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["placa"] == "PRU-100"
    assert data["capacidad_kg"] == 1750.5
    assert data["disponible"] is True
    assert "vehiculo_id" in data


def test_api_register_vehicle_duplicate_plate():
    payload = {
        "placa": "DUP-999",
        "capacidad_kg": 1000.0,
        "tipo_combustible": "DIESEL",
    }
    # Primer registro exitoso
    res1 = client.post("/api/v1/vehicles", json=payload)
    assert res1.status_code == 201

    # Segundo registro con la misma placa debe fallar
    res2 = client.post("/api/v1/vehicles", json=payload)
    assert res2.status_code == 409
    data = res2.json()
    assert data["detail"] == "La placa ingresada ya se encuentra registrada en el sistema"


def test_api_list_vehicles():
    response = client.get("/api/v1/vehicles")
    assert response.status_code == 200
    data = response.json()
    assert "total" in data
    assert "vehiculos" in data
    assert isinstance(data["vehiculos"], list)


def test_api_list_vehicles_only_available():
    response = client.get("/api/v1/vehicles?only_available=true")
    assert response.status_code == 200
    data = response.json()
    for v in data["vehiculos"]:
        assert v["disponible"] is True
        assert v["estado"] == "DISPONIBLE"


def test_api_update_vehicle():
    # Crear uno primero
    res_create = client.post(
        "/api/v1/vehicles",
        json={"placa": "UPD-500", "capacidad_kg": 1200.0, "tipo_combustible": "GASOLINA"},
    )
    assert res_create.status_code == 201
    vehicle_id = res_create.json()["vehiculo_id"]

    # Actualizar estado a MANTENIMIENTO
    res_update = client.put(
        f"/api/v1/vehicles/{vehicle_id}",
        json={"estado": "MANTENIMIENTO", "capacidad_kg": 1350.0},
    )
    assert res_update.status_code == 200
    updated_data = res_update.json()
    assert updated_data["estado"] == "MANTENIMIENTO"
    assert updated_data["capacidad_kg"] == 1350.0
    assert updated_data["disponible"] is False
