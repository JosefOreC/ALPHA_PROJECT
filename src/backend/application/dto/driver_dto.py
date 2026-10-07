from pydantic import BaseModel, Field, field_validator

from domain.entities.driver import Driver
from domain.value_objects import DriverStates


class CreateDriverRequest(BaseModel):
    nombre_completo: str = Field(min_length=2, max_length=200)
    dni: str = Field(min_length=8, max_length=8)
    licencia: str = Field(min_length=1, max_length=50)
    vehiculo_id: str = Field(min_length=1)
    estado: DriverStates = DriverStates.ACTIVO

    @field_validator("dni")
    @classmethod
    def validate_dni(cls, value: str) -> str:
        value = value.strip()

        if not value.isdigit() or len(value) != 8:
            raise ValueError("El DNI debe contener exactamente 8 dígitos")

        return value

    @field_validator("estado", mode="before")
    @classmethod
    def validate_estado(cls, value: object) -> DriverStates:
        return DriverStates.parse(value)


class UpdateDriverRequest(BaseModel):
    nombre_completo: str | None = Field(
        default=None,
        min_length=2,
        max_length=200,
    )
    dni: str | None = Field(
        default=None,
        min_length=8,
        max_length=8,
    )
    licencia: str | None = Field(
        default=None,
        min_length=1,
        max_length=50,
    )
    vehiculo_id: str | None = Field(
        default=None,
        min_length=1,
    )
    estado: DriverStates | None = None

    @field_validator("dni")
    @classmethod
    def validate_dni(cls, value: str | None) -> str | None:
        if value is None:
            return None

        value = value.strip()

        if not value.isdigit() or len(value) != 8:
            raise ValueError("El DNI debe contener exactamente 8 dígitos")

        return value

    @field_validator("estado", mode="before")
    @classmethod
    def validate_estado(cls, value: object) -> DriverStates | None:
        if value is None:
            return None
        return DriverStates.parse(value)


class DriverResponse(BaseModel):
    conductor_id: str
    nombre_completo: str
    dni: str
    licencia: str
    vehiculo_id: str
    estado: str
    creado_en: str

    @classmethod
    def from_domain(cls, driver: Driver) -> "DriverResponse":
        return cls(
            conductor_id=driver.conductor_id,
            nombre_completo=driver.nombre_completo,
            dni=driver.dni,
            licencia=driver.licencia,
            vehiculo_id=driver.vehiculo_id,
            estado=driver.estado.value,
            creado_en=driver.creado_en.isoformat(),
        )


class DriverListResponse(BaseModel):
    items: list[DriverResponse]
    total: int
