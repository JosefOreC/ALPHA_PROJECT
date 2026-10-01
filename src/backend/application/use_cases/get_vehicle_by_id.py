from application.dto.vehicle_dto import VehicleResponseDTO
from domain.exceptions.vehicle_exceptions import VehicleNotFoundError
from domain.ports.vehicle_repository import VehicleRepositoryPort


class GetVehicleByIdUseCase:
    """Caso de uso: Consultar el detalle de un vehículo por su identificador único."""

    def __init__(self, vehicle_repository: VehicleRepositoryPort):
        self.vehicle_repository = vehicle_repository

    def execute(self, vehicle_id: str) -> VehicleResponseDTO:
        vehicle = self.vehicle_repository.find_by_id(vehicle_id)
        if vehicle is None:
            raise VehicleNotFoundError(f"Vehículo con ID '{vehicle_id}' no encontrado")

        return VehicleResponseDTO.from_domain(vehicle)
