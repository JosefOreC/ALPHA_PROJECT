from application.dto.vehicle_dto import UpdateVehicleDTO, VehicleResponseDTO
from domain.exceptions.vehicle_exceptions import (
    VehicleNotFoundError,
    VehiclePlateAlreadyExistsError,
)
from domain.ports.vehicle_repository import VehicleRepositoryPort


class UpdateVehicleUseCase:
    """Caso de uso: Editar información y estado de un vehículo existente."""

    def __init__(self, vehicle_repository: VehicleRepositoryPort):
        self.vehicle_repository = vehicle_repository

    def execute(self, vehicle_id: str, dto: UpdateVehicleDTO) -> VehicleResponseDTO:
        vehicle = self.vehicle_repository.find_by_id(vehicle_id)
        if vehicle is None:
            raise VehicleNotFoundError(f"Vehículo con ID '{vehicle_id}' no encontrado")

        # Si se modifica la placa, validar que no esté en uso por otro vehículo
        if dto.placa is not None:
            existing_plate_vehicle = self.vehicle_repository.find_by_plate(dto.placa)
            if existing_plate_vehicle and existing_plate_vehicle.vehiculo_id != vehicle_id:
                raise VehiclePlateAlreadyExistsError("La placa ingresada ya se encuentra registrada en el sistema")

        vehicle.update_info(
            placa=dto.placa,
            capacidad_kg=dto.capacidad_kg,
            capacidad_m3=dto.capacidad_m3,
            tipo_combustible=dto.tipo_combustible,
            estado=dto.estado,
        )

        updated_vehicle = self.vehicle_repository.update(vehicle)
        return VehicleResponseDTO.from_domain(updated_vehicle)
