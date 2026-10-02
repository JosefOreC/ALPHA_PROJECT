from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, field_validator


class CreateVehicleDTO(BaseModel):
    placa: str = Field(..., description="Placa del vehículo (ej. ABC-123)", min_length=3, max_length=10)
    capacidad_kg: float = Field(..., description="Capacidad de carga en kilogramos", gt=0)
    tipo_combustible: str = Field(..., description="Tipo de combustible (DIESEL, GASOLINA, GNV, GLP, ELECTRICO, HIBRIDO)")
    capacidad_m3: Optional[float] = Field(None, description="Capacidad volumétrica en metros cúbicos", gt=0)
    estado: Optional[str] = Field("DISPONIBLE", description="Estado inicial del vehículo")

    @field_validator("placa")
    @classmethod
    def validate_placa(cls, v: str) -> str:
        cleaned = v.strip().upper()
        if not cleaned:
            raise ValueError("La placa no puede estar vacía")
        return cleaned

    @field_validator("tipo_combustible")
    @classmethod
    def validate_combustible(cls, v: str) -> str:
        return v.strip().upper()

    @field_validator("estado")
    @classmethod
    def validate_estado(cls, v: Optional[str]) -> str:
        return (v or "DISPONIBLE").strip().upper()


class UpdateVehicleDTO(BaseModel):
    placa: Optional[str] = Field(None, description="Placa del vehículo", min_length=3, max_length=10)
    capacidad_kg: Optional[float] = Field(None, description="Capacidad en kg", gt=0)
    capacidad_m3: Optional[float] = Field(None, description="Capacidad en m3", gt=0)
    tipo_combustible: Optional[str] = Field(None, description="Tipo de combustible")
    estado: Optional[str] = Field(None, description="Estado del vehículo")

    @field_validator("placa")
    @classmethod
    def validate_placa(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            cleaned = v.strip().upper()
            if not cleaned:
                raise ValueError("La placa no puede estar vacía")
            return cleaned
        return None

    @field_validator("tipo_combustible")
    @classmethod
    def validate_combustible(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            return v.strip().upper()
        return None

    @field_validator("estado")
    @classmethod
    def validate_estado(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            return v.strip().upper()
        return None


class VehicleResponseDTO(BaseModel):
    vehiculo_id: str
    placa: str
    capacidad_kg: float
    capacidad_m3: Optional[float] = None
    tipo_combustible: str
    estado: str
    disponible: bool
    activo: bool
    creado_en: datetime

    @classmethod
    def from_domain(cls, vehicle) -> "VehicleResponseDTO":
        return cls(
            vehiculo_id=vehicle.vehiculo_id,
            placa=vehicle.placa,
            capacidad_kg=vehicle.capacidad_kg,
            capacidad_m3=vehicle.capacidad_m3,
            tipo_combustible=vehicle.tipo_combustible,
            estado=vehicle.estado,
            disponible=vehicle.is_available(),
            activo=vehicle.is_active(),
            creado_en=vehicle.creado_en,
        )


class VehicleListResponseDTO(BaseModel):
    total: int
    vehiculos: List[VehicleResponseDTO]
    mensaje: Optional[str] = None
