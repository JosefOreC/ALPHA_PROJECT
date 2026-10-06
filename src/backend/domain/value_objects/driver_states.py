from enum import Enum

class DriverStates(Enum):
    ACTIVO = "ACTIVO"
    INACTIVO = "INACTIVO"

    def __str__(self):
        return self.value

    def list_states(self):
        return [state.value for state in self]