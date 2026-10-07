from enum import Enum


class DriverStates(str, Enum):
    ACTIVO = "ACTIVO"
    INACTIVO = "INACTIVO"

    def __str__(self) -> str:
        return self.value

    @classmethod
    def list_states(cls) -> list[str]:
        return [state.value for state in cls]

    @classmethod
    def parse(cls, value: object) -> "DriverStates":
        if isinstance(value, cls):
            return value
        raw = value.strip().upper() if isinstance(value, str) else value
        try:
            return cls(raw)
        except (TypeError, ValueError):
            allowed = ", ".join(sorted(cls.list_states()))
            raise ValueError(f"Estado inválido. Valores permitidos: {allowed}") from None
