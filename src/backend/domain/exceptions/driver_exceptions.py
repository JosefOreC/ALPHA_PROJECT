class DriverAlreadyExistsError(Exception):
    """Se lanza cuando el DNI ya está registrado."""

    def __init__(self):
        super().__init__(
            "El DNI ingresado ya corresponde a un conductor registrado en el sistema"
        )


class DriverNotFoundError(Exception):
    """Se lanza cuando no se encuentra un conductor."""

    def __init__(self, conductor_id: str):
        super().__init__(
            f"No se encontró un conductor con ID: {conductor_id}"
        )

class DriverLicenseAlreadyExistsError(Exception):
    """Se lanza cuando la licencia ya está registrada."""

    def __init__(self):
        super().__init__(
            "La licencia ingresada ya corresponde a un conductor registrado en el sistema"
        )
