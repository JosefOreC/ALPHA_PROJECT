from functools import lru_cache
from application.use_cases.register_vehicle import RegisterVehicleUseCase
from application.use_cases.get_vehicles import GetVehiclesUseCase
from application.use_cases.update_vehicle import UpdateVehicleUseCase
from application.use_cases.get_vehicle_by_id import GetVehicleByIdUseCase
from domain.entities.vehicle import Vehicle
from domain.ports.vehicle_repository import VehicleRepositoryPort
from infrastructure.persistence.in_memory_vehicle_repository import InMemoryVehicleRepository


# Repositorio singleton en memoria para desarrollo y testing
_in_memory_repo = InMemoryVehicleRepository(
    initial_vehicles=[
        Vehicle(
            placa="ABC-101",
            capacidad_kg=1500.0,
            capacidad_m3=8.5,
            tipo_combustible="DIESEL",
            estado="DISPONIBLE",
        ),
        Vehicle(
            placa="XYZ-202",
            capacidad_kg=2200.0,
            capacidad_m3=12.0,
            tipo_combustible="GNV",
            estado="DISPONIBLE",
        ),
        Vehicle(
            placa="ECO-303",
            capacidad_kg=800.0,
            capacidad_m3=4.2,
            tipo_combustible="ELECTRICO",
            estado="EN_RUTA",
        ),
        Vehicle(
            placa="MNT-404",
            capacidad_kg=3000.0,
            capacidad_m3=16.0,
            tipo_combustible="DIESEL",
            estado="MANTENIMIENTO",
        ),
    ]
)


def get_vehicle_repository() -> VehicleRepositoryPort:
    return _in_memory_repo


def get_register_vehicle_use_case() -> RegisterVehicleUseCase:
    return RegisterVehicleUseCase(get_vehicle_repository())


def get_vehicles_use_case() -> GetVehiclesUseCase:
    return GetVehiclesUseCase(get_vehicle_repository())


def get_update_vehicle_use_case() -> UpdateVehicleUseCase:
    return UpdateVehicleUseCase(get_vehicle_repository())


def get_vehicle_by_id_use_case() -> GetVehicleByIdUseCase:
    return GetVehicleByIdUseCase(get_vehicle_repository())
