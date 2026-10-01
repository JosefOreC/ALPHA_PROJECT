from domain.entities.driver import Driver
from domain.exceptions.driver_exceptions import DriverAlreadyExistsError
from domain.ports.driver_repository import DriverRepository


class RegisterDriver:

    def __init__(self, driver_repository: DriverRepository):
        self.driver_repository = driver_repository

    def execute(
        self,
        nombre_completo: str,
        dni: str,
        licencia: str,
        vehiculo_id: str,
        estado: str = "ACTIVO",
    ) -> Driver:

        dni = dni.strip()

        existing_driver = self.driver_repository.find_by_dni(dni)

        if existing_driver is not None:
            raise DriverAlreadyExistsError()

        driver = Driver(
            nombre_completo=nombre_completo,
            dni=dni,
            licencia=licencia,
            vehiculo_id=vehiculo_id,
            estado=estado,
        )

        return self.driver_repository.save(driver)
