from application.use_cases.activate_driver import ActivateDriver
from application.use_cases.deactivate_driver import DeactivateDriver
from application.use_cases.get_driver_by_id import GetDriverById
from application.use_cases.get_drivers import GetDrivers
from application.use_cases.register_driver import RegisterDriver
from application.use_cases.update_driver import UpdateDriver
from infrastructure.persistence.in_memory_driver_repository import (
    InMemoryDriverRepository,
)


driver_repository = InMemoryDriverRepository()


def get_register_driver() -> RegisterDriver:
    return RegisterDriver(driver_repository)


def get_get_drivers() -> GetDrivers:
    return GetDrivers(driver_repository)


def get_get_driver_by_id() -> GetDriverById:
    return GetDriverById(driver_repository)


def get_update_driver() -> UpdateDriver:
    return UpdateDriver(driver_repository)


def get_activate_driver() -> ActivateDriver:
    return ActivateDriver(driver_repository)


def get_deactivate_driver() -> DeactivateDriver:
    return DeactivateDriver(driver_repository)
