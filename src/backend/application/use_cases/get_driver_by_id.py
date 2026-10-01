from domain.entities.driver import Driver
from domain.exceptions.driver_exceptions import DriverNotFoundError
from domain.ports.driver_repository import DriverRepository


class GetDriverById:

    def __init__(self, driver_repository: DriverRepository):
        self.driver_repository = driver_repository

    def execute(self, conductor_id: str) -> Driver:
        driver = self.driver_repository.find_by_id(conductor_id)

        if driver is None:
            raise DriverNotFoundError(conductor_id)

        return driver
