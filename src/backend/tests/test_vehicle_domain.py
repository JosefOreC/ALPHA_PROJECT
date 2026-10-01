import pytest
from domain.entities.vehicle import Vehicle


def test_create_valid_vehicle():
    vehicle = Vehicle(
        placa="abc-123",
        capacidad_kg=1500.0,
        tipo_combustible="diesel",
        capacidad_m3=10.5,
        estado="DISPONIBLE",
    )
    assert vehicle.placa == "ABC-123"
    assert vehicle.capacidad_kg == 1500.0
    assert vehicle.tipo_combustible == "DIESEL"
    assert vehicle.is_available() is True
    assert vehicle.is_active() is True


def test_vehicle_invalid_capacity():
    with pytest.raises(ValueError, match="positiv"):
        Vehicle(
            placa="ABC-123",
            capacidad_kg=-10.0,
            tipo_combustible="DIESEL",
        )


def test_vehicle_invalid_plate():
    with pytest.raises(ValueError, match="obligatoria"):
        Vehicle(
            placa="",
            capacidad_kg=100.0,
            tipo_combustible="DIESEL",
        )


def test_vehicle_invalid_status():
    with pytest.raises(ValueError, match="Estado inválido"):
        Vehicle(
            placa="ABC-123",
            capacidad_kg=100.0,
            tipo_combustible="DIESEL",
            estado="VOLANDO",
        )


def test_vehicle_update_info():
    vehicle = Vehicle(
        placa="ABC-123",
        capacidad_kg=1000.0,
        tipo_combustible="GASOLINA",
        estado="DISPONIBLE",
    )
    vehicle.update_info(capacidad_kg=1200.0, estado="EN_RUTA")
    assert vehicle.capacidad_kg == 1200.0
    assert vehicle.estado == "EN_RUTA"
    assert vehicle.is_available() is False
    assert vehicle.is_active() is True
