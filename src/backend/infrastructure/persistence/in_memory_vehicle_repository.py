from typing import Dict, List, Optional
from domain.entities.vehicle import Vehicle
from domain.ports.vehicle_repository import VehicleRepositoryPort


class InMemoryVehicleRepository(VehicleRepositoryPort):
    """Adaptador de persistencia en memoria para la entidad Vehicle."""

    def __init__(self, initial_vehicles: Optional[List[Vehicle]] = None):
        self._vehicles: Dict[str, Vehicle] = {}
        if initial_vehicles:
            for v in initial_vehicles:
                self.save(v)

    def save(self, vehicle: Vehicle) -> Vehicle:
        self._vehicles[vehicle.vehiculo_id] = vehicle
        return vehicle

    def find_by_id(self, vehicle_id: str) -> Optional[Vehicle]:
        return self._vehicles.get(vehicle_id)

    def find_by_plate(self, plate: str) -> Optional[Vehicle]:
        normalized = Vehicle.normalize_plate(plate)
        for v in self._vehicles.values():
            if v.placa == normalized:
                return v
        return None

    def find_all(self, status: Optional[str] = None) -> List[Vehicle]:
        vehicles = list(self._vehicles.values())
        if status:
            return [v for v in vehicles if v.estado == status]
        return vehicles

    def update(self, vehicle: Vehicle) -> Vehicle:
        self._vehicles[vehicle.vehiculo_id] = vehicle
        return vehicle

    def clear(self) -> None:
        """Método auxiliar para pruebas unitarias e integración."""
        self._vehicles.clear()
