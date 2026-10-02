from typing import Optional
from application.dto.vehicle_dto import VehicleListResponseDTO, VehicleResponseDTO
from domain.ports.vehicle_repository import VehicleRepositoryPort


class GetVehiclesUseCase:
    """Caso de uso US-002: Consultar listado de vehículos con su estado y disponibilidad."""

    def __init__(self, vehicle_repository: VehicleRepositoryPort):
        self.vehicle_repository = vehicle_repository

    def execute(
        self,
        status: Optional[str] = None,
        only_available: bool = False,
    ) -> VehicleListResponseDTO:
        target_status = "DISPONIBLE" if only_available else status
        vehicles = self.vehicle_repository.find_all(status=target_status)

        active_vehicles = [v for v in vehicles if v.is_active()]
        
        # Escenario de aceptación: Flota sin vehículos activos
        message = None
        if not active_vehicles and not status:
            message = "No hay vehículos activos registrados"

        dtos = [VehicleResponseDTO.from_domain(v) for v in vehicles]

        return VehicleListResponseDTO(
            total=len(dtos),
            vehiculos=dtos,
            mensaje=message,
        )
