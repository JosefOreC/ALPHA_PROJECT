from abc import ABC, abstractmethod

from domain.entities.driver import Driver


class DriverRepository(ABC):

    def find_page(self, *, limit=20, offset=0, driver_id=None):
        items = [item for item in self.find_all() if driver_id is None or item.conductor_id == driver_id]
        return items[offset:offset+limit], len(items)

    @abstractmethod
    def save(self, driver: Driver) -> Driver:
        pass

    @abstractmethod
    def find_by_id(self, conductor_id: str) -> Driver | None:
        pass

    @abstractmethod
    def find_by_dni(self, dni: str) -> Driver | None:
        pass

    @abstractmethod
    def find_all(self) -> list[Driver]:
        pass

    @abstractmethod
    def update(self, driver: Driver) -> Driver:
        pass
