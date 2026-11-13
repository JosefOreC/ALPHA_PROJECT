from domain.entities.driver import Driver
from domain.ports.driver_repository import DriverRepository


class GetDrivers:

    def __init__(self, driver_repository: DriverRepository):
        self.driver_repository = driver_repository

    def execute(self) -> list[Driver]:
        return self.driver_repository.find_all()

    def page(self, *, limit=20, offset=0, driver_id=None):
        return self.driver_repository.find_page(limit=limit, offset=offset, driver_id=driver_id)
