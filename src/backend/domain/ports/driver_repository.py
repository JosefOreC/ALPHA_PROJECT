from abc import ABC, abstractmethod

from domain.entities.driver import Driver


class DriverRepository(ABC):

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
    def find_by_licencia(self, licencia: str) -> Driver | None:
        pass

    @abstractmethod
    def find_all(self) -> list[Driver]:
        pass

    @abstractmethod
    def update(self, driver: Driver) -> Driver:
        pass
