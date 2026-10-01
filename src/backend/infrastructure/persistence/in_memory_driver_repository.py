from domain.entities.driver import Driver
from domain.ports.driver_repository import DriverRepository


class InMemoryDriverRepository(DriverRepository):

    def __init__(self):
        self._drivers: dict[str, Driver] = {}

    def save(self, driver: Driver) -> Driver:
        self._drivers[driver.conductor_id] = driver
        return driver

    def find_by_id(self, conductor_id: str) -> Driver | None:
        return self._drivers.get(conductor_id)

    def find_by_dni(self, dni: str) -> Driver | None:
        dni = dni.strip()

        for driver in self._drivers.values():
            if driver.dni == dni:
                return driver

        return None

    def find_all(self) -> list[Driver]:
        return list(self._drivers.values())

    def update(self, driver: Driver) -> Driver:
        self._drivers[driver.conductor_id] = driver
        return driver

    def clear(self):
        self._drivers.clear()
