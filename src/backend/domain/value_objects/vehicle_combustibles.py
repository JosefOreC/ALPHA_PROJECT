from enum import Enum


class VehicleCombustibles(str, Enum):
    DIESEL = "DIESEL"
    GASOLINA = "GASOLINA"
    GNV = "GNV"
    GLP = "GLP"
    ELECTRICO = "ELECTRICO"
    HIBRIDO = "HIBRIDO"

    def __str__(self) -> str:
        return self.value

    def __repr__(self) -> str:
        return self.value

    @classmethod
    def list_combustibles(cls) -> list[str]:
        return [combustible.value for combustible in cls]

    @classmethod
    def parse(cls, value: object) -> "VehicleCombustibles":
        if isinstance(value, cls):
            return value
        raw = value.strip().upper() if isinstance(value, str) else value
        try:
            return cls(raw)
        except (TypeError, ValueError):
            allowed = ", ".join(sorted(cls.list_combustibles()))
            raise ValueError(
                f"Tipo de combustible inválido: {value}. Permitidos: {allowed}"
            ) from None
