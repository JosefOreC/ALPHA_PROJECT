form enum import Enum

class VehicleStates(Enum):
    DISPONIBLE = "DISPONIBLE"
    EN_RUTA = "EN_RUTA"
    MANTENIMIENTO = "MANTENIMIENTO"
    INACTIVO = "INACTIVO"

    def __str__(self):
        return self.value

    def list_states(self):
        return [state.value for state in self]