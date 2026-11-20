DUPLICATE_DRIVER_MESSAGES = {
    "dni": "El DNI ingresado ya corresponde a un conductor registrado en el sistema",
    "licencia": "La licencia ingresada ya corresponde a otro conductor registrado en el sistema",
    "vehiculo": "El vehículo seleccionado ya está asignado a otro conductor",
    "usuario": "La cuenta de acceso seleccionada ya está vinculada a otro conductor",
    "datos": "Ya existe un conductor con el mismo DNI, licencia, vehículo o cuenta de acceso",
}


class DriverAlreadyExistsError(Exception):
    """Se lanza cuando un dato único del conductor (DNI, licencia, vehículo o cuenta) ya está en uso."""

    def __init__(self, field: str = "dni"):
        self.field = field if field in DUPLICATE_DRIVER_MESSAGES else "datos"
        super().__init__(DUPLICATE_DRIVER_MESSAGES[self.field])


class DriverNotFoundError(Exception):
    """Se lanza cuando no se encuentra un conductor."""

    def __init__(self, conductor_id: str):
        super().__init__(
            f"No se encontró un conductor con ID: {conductor_id}"
        )
