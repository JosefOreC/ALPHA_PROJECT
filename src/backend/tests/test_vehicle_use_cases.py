import pytest
from application.dto.vehicle_dto import CreateVehicleDTO, UpdateVehicleDTO
from application.use_cases.get_vehicles import GetVehiclesUseCase
from application.use_cases.register_vehicle import RegisterVehicleUseCase
from application.use_cases.update_vehicle import UpdateVehicleUseCase
from domain.entities.vehicle import Vehicle
from domain.exceptions.vehicle_exceptions import (
    VehicleNotFoundError,
    VehiclePlateAlreadyExistsError,
)
from infrastructure.persistence.in_memory_vehicle_repository import (
    InMemoryVehicleRepository,
)


def test_us001_register_vehicle_success():
    repo = InMemoryVehicleRepository()
    use_case = RegisterVehicleUseCase(repo)

    dto = CreateVehicleDTO(
        placa="ABC-123",
        capacidad_kg=1500.0,
        tipo_combustible="DIESEL",
        capacidad_m3=8.0,
        estado="DISPONIBLE",
    )
    result = use_case.execute(dto)

    assert result.placa == "ABC-123"
    assert result.capacidad_kg == 1500.0
    assert result.disponible is True
    assert result.activo is True
    assert repo.find_by_plate("ABC-123") is not None


def test_us001_reject_duplicate_plate():
    repo = InMemoryVehicleRepository()
    use_case = RegisterVehicleUseCase(repo)

    dto1 = CreateVehicleDTO(
        placa="ABC-123",
        capacidad_kg=1500.0,
        tipo_combustible="DIESEL",
    )
    use_case.execute(dto1)

    dto2 = CreateVehicleDTO(
        placa="ABC-123",
        capacidad_kg=2000.0,
        tipo_combustible="GNV",
    )
    with pytest.raises(VehiclePlateAlreadyExistsError) as exc_info:
        use_case.execute(dto2)

    assert "La placa ingresada ya se encuentra registrada en el sistema" in str(exc_info.value)


def test_us002_list_vehicles():
    repo = InMemoryVehicleRepository(
        initial_vehicles=[
            Vehicle(placa="V-001", capacidad_kg=1000.0, tipo_combustible="DIESEL", estado="DISPONIBLE"),
            Vehicle(placa="V-002", capacidad_kg=1500.0, tipo_combustible="GNV", estado="EN_RUTA"),
            Vehicle(placa="V-003", capacidad_kg=800.0, tipo_combustible="ELECTRICO", estado="DISPONIBLE"),
        ]
    )
    use_case = GetVehiclesUseCase(repo)

    # Todos los vehículos
    result_all = use_case.execute()
    assert result_all.total == 3
    assert len(result_all.vehiculos) == 3

    # Solo disponibles
    result_available = use_case.execute(only_available=True)
    assert result_available.total == 2
    assert all(v.disponible for v in result_available.vehiculos)


def test_us002_fleet_without_active_vehicles():
    repo = InMemoryVehicleRepository(
        initial_vehicles=[
            Vehicle(placa="V-999", capacidad_kg=1000.0, tipo_combustible="DIESEL", estado="INACTIVO"),
        ]
    )
    use_case = GetVehiclesUseCase(repo)
    result = use_case.execute()
    assert result.mensaje == "No hay vehículos activos registrados"


def test_update_vehicle_success():
    repo = InMemoryVehicleRepository(
        initial_vehicles=[
            Vehicle(placa="V-001", capacidad_kg=1000.0, tipo_combustible="DIESEL", estado="DISPONIBLE"),
        ]
    )
    vehicle = repo.find_by_plate("V-001")
    assert vehicle is not None

    use_case = UpdateVehicleUseCase(repo)
    dto = UpdateVehicleDTO(
        capacidad_kg=1800.0,
        estado="MANTENIMIENTO",
        tipo_combustible="GNV",
    )
    updated = use_case.execute(vehicle.vehiculo_id, dto)

    assert updated.capacidad_kg == 1800.0
    assert updated.estado == "MANTENIMIENTO"
    assert updated.disponible is False
    assert updated.activo is True


def test_update_vehicle_duplicate_plate_conflict():
    repo = InMemoryVehicleRepository(
        initial_vehicles=[
            Vehicle(placa="V-001", capacidad_kg=1000.0, tipo_combustible="DIESEL", estado="DISPONIBLE"),
            Vehicle(placa="V-002", capacidad_kg=1200.0, tipo_combustible="GNV", estado="DISPONIBLE"),
        ]
    )
    v2 = repo.find_by_plate("V-002")
    assert v2 is not None

    use_case = UpdateVehicleUseCase(repo)
    # Intentar cambiar la placa de V-002 a V-001 existente
    dto = UpdateVehicleDTO(placa="V-001")
    with pytest.raises(VehiclePlateAlreadyExistsError):
        use_case.execute(v2.vehiculo_id, dto)
