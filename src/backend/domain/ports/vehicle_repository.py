from abc import ABC, abstractmethod
from typing import List, Optional
from domain.entities.vehicle import Vehicle
from domain.value_objects import VehicleStates


class VehicleRepositoryPort(ABC):
    """Puerto de salida (Outbound Port) para la persistencia y consulta de vehículos."""

    def find_page(self, *, status=None, query='', limit=20, offset=0):
        items = [item for item in self.find_all(status) if query.casefold() in
                 f'{item.placa} {item.tipo_combustible.value} {item.estado.value}'.casefold()]
        return items[offset:offset+limit], len(items)

    @abstractmethod
    def save(self, vehicle: Vehicle) -> Vehicle:
        """Guarda un vehículo nuevo en la persistencia."""
        raise NotImplementedError

    @abstractmethod
    def find_by_id(self, vehicle_id: str) -> Optional[Vehicle]:
        """Busca un vehículo por su identificador único."""
        raise NotImplementedError

    @abstractmethod
    def find_by_plate(self, plate: str) -> Optional[Vehicle]:
        """Busca un vehículo por su número de placa."""
        raise NotImplementedError

    @abstractmethod
    def find_all(self, status: Optional[VehicleStates] = None) -> List[Vehicle]:
        """Lista vehículos, opcionalmente filtrados por su estado."""
        raise NotImplementedError

    @abstractmethod
    def update(self, vehicle: Vehicle) -> Vehicle:
        """Actualiza un vehículo existente."""
        raise NotImplementedError
