from enum import Enum


class VehicleStates(str, Enum):
    DISPONIBLE = "DISPONIBLE"
    EN_RUTA = "EN_RUTA"
    MANTENIMIENTO = "MANTENIMIENTO"
    INACTIVO = "INACTIVO"

    def __str__(self) -> str:
        return self.value

    @classmethod
    def list_states(cls) -> list[str]:
        return [state.value for state in cls]

    @classmethod
    def parse(cls, value: object) -> "VehicleStates":
        if isinstance(value, cls):
            return value
        raw = value.strip().upper() if isinstance(value, str) else value
        try:
            return cls(raw)
        except (TypeError, ValueError):
            allowed = ", ".join(sorted(cls.list_states()))
            raise ValueError(
                f"Estado inválido: {value}. Estados permitidos: {allowed}"
            ) from None
