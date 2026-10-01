from domain.entities.driver import Driver
from domain.ports.driver_repository import DriverRepository


class GetDrivers:

    def __init__(self, driver_repository: DriverRepository):
        self.driver_repository = driver_repository

    def execute(self) -> list[Driver]:
        return self.driver_repository.find_all()
