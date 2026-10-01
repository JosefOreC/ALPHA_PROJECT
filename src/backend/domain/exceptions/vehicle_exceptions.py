class VehicleDomainError(Exception):
    """Excepción base para errores de dominio en vehículos."""
    pass


class VehiclePlateAlreadyExistsError(VehicleDomainError):
    """Lanzada cuando se intenta registrar o actualizar un vehículo con una placa ya existente."""
    def __init__(self, message: str = "La placa ingresada ya se encuentra registrada en el sistema"):
        self.message = message
        super().__init__(self.message)


class VehicleNotFoundError(VehicleDomainError):
    """Lanzada cuando un vehículo no es encontrado."""
    def __init__(self, message: str = "Vehículo no encontrado"):
        self.message = message
        super().__init__(self.message)


class InvalidVehicleDataError(VehicleDomainError):
    """Lanzada cuando los datos proporcionados para el vehículo violan reglas de negocio."""
    def __init__(self, message: str):
        self.message = message
        super().__init__(self.message)
