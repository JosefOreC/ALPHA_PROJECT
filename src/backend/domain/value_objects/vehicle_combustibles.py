from enum import Enum

class VehicleCombustibles(Enum):

    DIESEL = "DIESEL"
    GASOLINA = "GASOLINA"
    GNV = "GNV"
    GLP = "GLP"
    ELECTRICO = "ELECTRICO"
    HIBRIDO = "HIBRIDO"

    def __str__(self):
        return self.value

    def __repr__(self):
        return self.value
    
    def list_combustibles(self):
        return [combustible.value for combustible in self]