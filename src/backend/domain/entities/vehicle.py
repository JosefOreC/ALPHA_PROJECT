from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional
import uuid
import re

from src.backend.domain.value_objects import VehicleCombustibles, VehicleStates

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
        self.validate()

    @staticmethod
    def normalize_plate(plate: str) -> str:
        if not plate:
            raise ValueError("La placa es obligatoria")
        # Normalizar a mayúsculas y quitar espacios en blanco
        return plate.strip().upper()

    def validate(self) -> None:
        if not self.placa:
            raise ValueError("La placa del vehículo no puede estar vacía")
        
        # Validación de formato de placa: ej. ABC-123 o alfanumérico estándar de 3 a 10 caracteres
        clean_plate = self.placa.replace("-", "")
        if not (3 <= len(clean_plate) <= 10) or not clean_plate.isalnum():
            raise ValueError(f"Formato de placa inválido: {self.placa}")

        if self.capacidad_kg <= 0:
            raise ValueError("La capacidad en kg debe ser un valor positivo mayor a 0")

        if self.capacidad_m3 is not None and self.capacidad_m3 <= 0:
            raise ValueError("La capacidad en m3 debe ser un valor positivo mayor a 0")

        if type(self.estado) != VehicleStates:
            raise ValueError(
                f"Estado inválido: {str(self.estado)}. Estados permitidos: {', '.join(sorted(VehicleStates.list_states()))}"
            )  
        
        if type(self.tipo_combustible) != VehicleCombustibles:
            raise ValueError(
                f"Tipo de combustible inválido: {str(self.tipo_combustible)}. Permitidos: {', '.join(sorted(VehicleCombustibles.list_combustibles()))}"
            )

    def is_available(self) -> bool:
        return self.estado == VehicleStates.DISPONIBLE

    def is_active(self) -> bool:
        return self.estado != VehicleStates.INACTIVO

    def update_info(
        self,
        capacidad_kg: Optional[float] = None,
        capacidad_m3: Optional[float] = None,
        tipo_combustible: Optional[str] = None,
        estado: Optional[str] = None,
        placa: Optional[str] = None,
    ) -> None:
        if placa is not None:
            self.placa = self.normalize_plate(placa)
        if capacidad_kg is not None:
            self.capacidad_kg = capacidad_kg
        if capacidad_m3 is not None:
            self.capacidad_m3 = capacidad_m3
        if tipo_combustible is not None and type(tipo_combustible) == VehicleCombustibles:
            self.tipo_combustible = tipo_combustible
        if estado is not None:
            self.estado = estado
        self.validate()
