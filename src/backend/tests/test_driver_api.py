from fastapi.testclient import TestClient

from interfaces.api.main import app


client = TestClient(app)


def test_register_driver():
    response = client.post(
        "/api/v1/drivers",
        json={
            "nombre_completo": "Alex Cueva",
            "dni": "12345678",
            "licencia": "A12345678",
            "vehiculo_id": "vehiculo-001",
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert data["nombre_completo"] == "Alex Cueva"
    assert data["dni"] == "12345678"
    assert data["licencia"] == "A12345678"
    assert data["vehiculo_id"] == "vehiculo-001"
    assert data["estado"] == "ACTIVO"


def test_duplicate_dni():
    client.post(
        "/api/v1/drivers",
        json={
            "nombre_completo": "Primer Conductor",
            "dni": "87654321",
            "licencia": "B12345678",
            "vehiculo_id": "vehiculo-002",
        },
    )

    response = client.post(
        "/api/v1/drivers",
        json={
            "nombre_completo": "Segundo Conductor",
            "dni": "87654321",
            "licencia": "C12345678",
            "vehiculo_id": "vehiculo-003",
        },
    )

    assert response.status_code == 409

    assert response.json()["detail"] == (
        "El DNI ingresado ya corresponde a un conductor registrado en el sistema"
    )

def test_duplicate_license():
    client.post(
        "/api/v1/drivers",
        json={
            "nombre_completo": "Primer Conductor",
            "dni": "77777777",
            "licencia": "LIC-001",
            "vehiculo_id": "vehiculo-010",
        },
    )

    response = client.post(
        "/api/v1/drivers",
        json={
            "nombre_completo": "Segundo Conductor",
            "dni": "88888888",
            "licencia": "LIC-001",
            "vehiculo_id": "vehiculo-011",
        },
    )

    assert response.status_code == 409

    assert response.json()["detail"] == (
        "La licencia ingresada ya corresponde a un conductor registrado en el sistema"
    )

def test_get_drivers():
    response = client.get("/api/v1/drivers")

    assert response.status_code == 200

    data = response.json()

    assert "items" in data
    assert "total" in data


def test_get_driver_by_id():
    create_response = client.post(
        "/api/v1/drivers",
        json={
            "nombre_completo": "Conductor Consulta",
            "dni": "11111111",
            "licencia": "A11111111",
            "vehiculo_id": "vehiculo-003",
        },
    )

    conductor_id = create_response.json()["conductor_id"]

    response = client.get(
        f"/api/v1/drivers/{conductor_id}"
    )

    assert response.status_code == 200
    assert response.json()["conductor_id"] == conductor_id
    assert response.json()["dni"] == "11111111"


def test_get_driver_not_found():
    response = client.get(
        "/api/v1/drivers/id-inexistente"
    )

    assert response.status_code == 404


def test_update_driver():
    create_response = client.post(
        "/api/v1/drivers",
        json={
            "nombre_completo": "Conductor Original",
            "dni": "22222222",
            "licencia": "A22222222",
            "vehiculo_id": "vehiculo-004",
        },
    )

    conductor_id = create_response.json()["conductor_id"]

    response = client.put(
        f"/api/v1/drivers/{conductor_id}",
        json={
            "nombre_completo": "Conductor Actualizado",
            "licencia": "B22222222",
            "vehiculo_id": "vehiculo-005",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["nombre_completo"] == "Conductor Actualizado"
    assert data["dni"] == "22222222"
    assert data["licencia"] == "B22222222"
    assert data["vehiculo_id"] == "vehiculo-005"


def test_update_driver_duplicate_dni():
    first_response = client.post(
        "/api/v1/drivers",
        json={
            "nombre_completo": "Conductor Uno",
            "dni": "33333333",
            "licencia": "A33333333",
            "vehiculo_id": "vehiculo-006",
        },
    )

    second_response = client.post(
        "/api/v1/drivers",
        json={
            "nombre_completo": "Conductor Dos",
            "dni": "44444444",
            "licencia": "A44444444",
            "vehiculo_id": "vehiculo-007",
        },
    )

    first_id = first_response.json()["conductor_id"]

    response = client.put(
        f"/api/v1/drivers/{first_id}",
        json={
            "dni": "44444444",
        },
    )

    assert response.status_code == 409

    assert response.json()["detail"] == (
        "El DNI ingresado ya corresponde a un conductor registrado en el sistema"
    )


def test_deactivate_driver():
    create_response = client.post(
        "/api/v1/drivers",
        json={
            "nombre_completo": "Conductor Activo",
            "dni": "55555555",
            "licencia": "A55555555",
            "vehiculo_id": "vehiculo-008",
        },
    )

    conductor_id = create_response.json()["conductor_id"]

    response = client.patch(
        f"/api/v1/drivers/{conductor_id}/deactivate"
    )

    assert response.status_code == 200
    assert response.json()["estado"] == "INACTIVO"


def test_activate_driver():
    create_response = client.post(
        "/api/v1/drivers",
        json={
            "nombre_completo": "Conductor Inactivo",
            "dni": "66666666",
            "licencia": "A66666666",
            "vehiculo_id": "vehiculo-009",
            "estado": "INACTIVO",
        },
    )

    conductor_id = create_response.json()["conductor_id"]

    response = client.patch(
        f"/api/v1/drivers/{conductor_id}/activate"
    )

    assert response.status_code == 200
    assert response.json()["estado"] == "ACTIVO"
