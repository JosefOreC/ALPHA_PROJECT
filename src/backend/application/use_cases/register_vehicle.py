from application.dto.vehicle_dto import CreateVehicleDTO, VehicleResponseDTO
from domain.entities.vehicle import Vehicle
from domain.exceptions.vehicle_exceptions import VehiclePlateAlreadyExistsError
from domain.ports.vehicle_repository import VehicleRepositoryPort


class RegisterVehicleUseCase:
    """Caso de uso US-001: Registrar vehículo en la flota."""

    def __init__(self, vehicle_repository: VehicleRepositoryPort):
        self.vehicle_repository = vehicle_repository

    def execute(self, dto: CreateVehicleDTO) -> VehicleResponseDTO:
        # Validación de negocio: rechazo por placa duplicada
        existing_vehicle = self.vehicle_repository.find_by_plate(dto.placa)
        if existing_vehicle is not None:
            raise VehiclePlateAlreadyExistsError("La placa ingresada ya se encuentra registrada en el sistema")

        # Creación de entidad de dominio (aplica invariantes y reglas de negocio del dominio)
        vehicle = Vehicle(
            placa=dto.placa,
            capacidad_kg=dto.capacidad_kg,
            tipo_combustible=dto.tipo_combustible,
            capacidad_m3=dto.capacidad_m3,
            estado=dto.estado or "DISPONIBLE",
        )

        saved_vehicle = self.vehicle_repository.save(vehicle)
        return VehicleResponseDTO.from_domain(saved_vehicle)
