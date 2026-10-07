from domain.entities.driver import Driver
from domain.exceptions.driver_exceptions import (
    DriverAlreadyExistsError,
    DriverNotFoundError,
)
from domain.ports.driver_repository import DriverRepository
from domain.value_objects import DriverStates

class UpdateDriver:

    def __init__(self, driver_repository: DriverRepository):
        self.driver_repository = driver_repository

    def execute(
        self,
        conductor_id: str,
        nombre_completo: str | None = None,
        dni: str | None = None,
        licencia: str | None = None,
        vehiculo_id: str | None = None,
        estado: DriverStates | str | None = None,
    ) -> Driver:

        driver = self.driver_repository.find_by_id(conductor_id)

        if driver is None:
            raise DriverNotFoundError(conductor_id)

        if dni is not None:
            dni = dni.strip()

            existing_driver = self.driver_repository.find_by_dni(dni)

            if (
                existing_driver is not None
                and existing_driver.conductor_id != conductor_id
            ):
                raise DriverAlreadyExistsError()
        
        parsed_estado = DriverStates.parse(estado) if estado is not None else None

        driver.update_info(
            nombre_completo=nombre_completo,
            dni=dni,
            licencia=licencia,
            vehiculo_id=vehiculo_id,
            estado=parsed_estado,
        )

        return self.driver_repository.update(driver)
