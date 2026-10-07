from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional
import uuid

from domain.value_objects import VehicleCombustibles, VehicleStates


@dataclass
class Vehicle:
    placa: str
    capacidad_kg: float
    tipo_combustible: VehicleCombustibles
    capacidad_m3: Optional[float] = None
    estado: VehicleStates = VehicleStates.DISPONIBLE
    vehiculo_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    creado_en: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

    def __post_init__(self):
        self.placa = self.normalize_plate(self.placa)
        self.tipo_combustible = VehicleCombustibles.parse(self.tipo_combustible)
        self.estado = VehicleStates.parse(self.estado)
        self.validate()

    @staticmethod
    def normalize_plate(plate: str) -> str:
        if not plate:
            raise ValueError("La placa es obligatoria")
        return plate.strip().upper()

    def validate(self) -> None:
        if not self.placa:
            raise ValueError("La placa del vehículo no puede estar vacía")

        clean_plate = self.placa.replace("-", "")
        if not (3 <= len(clean_plate) <= 10) or not clean_plate.isalnum():
            raise ValueError(f"Formato de placa inválido: {self.placa}")

        if self.capacidad_kg <= 0:
            raise ValueError("La capacidad en kg debe ser un valor positivo mayor a 0")

        if self.capacidad_m3 is not None and self.capacidad_m3 <= 0:
            raise ValueError("La capacidad en m3 debe ser un valor positivo mayor a 0")

        if not isinstance(self.estado, VehicleStates):
            raise ValueError(
                f"Estado inválido: {self.estado}. Estados permitidos: {', '.join(sorted(VehicleStates.list_states()))}"
            )

        if not isinstance(self.tipo_combustible, VehicleCombustibles):
            raise ValueError(
                f"Tipo de combustible inválido: {self.tipo_combustible}. Permitidos: {', '.join(sorted(VehicleCombustibles.list_combustibles()))}"
            )

    def is_available(self) -> bool:
        return self.estado == VehicleStates.DISPONIBLE

    def is_active(self) -> bool:
        return self.estado != VehicleStates.INACTIVO

    def update_info(
        self,
        capacidad_kg: Optional[float] = None,
        capacidad_m3: Optional[float] = None,
        tipo_combustible: Optional[VehicleCombustibles | str] = None,
        estado: Optional[VehicleStates | str] = None,
        placa: Optional[str] = None,
    ) -> None:
        if placa is not None:
            self.placa = self.normalize_plate(placa)
        if capacidad_kg is not None:
            self.capacidad_kg = capacidad_kg
        if capacidad_m3 is not None:
            self.capacidad_m3 = capacidad_m3
        if tipo_combustible is not None:
            self.tipo_combustible = VehicleCombustibles.parse(tipo_combustible)
        if estado is not None:
            self.estado = VehicleStates.parse(estado)
        self.validate()
