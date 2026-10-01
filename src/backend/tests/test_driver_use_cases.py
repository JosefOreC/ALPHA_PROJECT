import pytest

from application.use_cases.activate_driver import ActivateDriver
from application.use_cases.deactivate_driver import DeactivateDriver
from application.use_cases.get_driver_by_id import GetDriverById
from application.use_cases.get_drivers import GetDrivers
from application.use_cases.register_driver import RegisterDriver
from application.use_cases.update_driver import UpdateDriver
from domain.exceptions.driver_exceptions import (
    DriverAlreadyExistsError,
    DriverNotFoundError,
)
from infrastructure.persistence.in_memory_driver_repository import (
    InMemoryDriverRepository,
)


@pytest.fixture
def repository():
    return InMemoryDriverRepository()


def test_register_driver(repository):
    use_case = RegisterDriver(repository)

    driver = use_case.execute(
        nombre_completo="Alex Cueva",
        dni="12345678",
        licencia="A12345678",
        vehiculo_id="vehiculo-001",
    )

    assert driver.nombre_completo == "Alex Cueva"
    assert driver.dni == "12345678"
    assert driver.estado == "ACTIVO"


def test_register_duplicate_dni(repository):
    use_case = RegisterDriver(repository)

    use_case.execute(
        nombre_completo="Primer Conductor",
        dni="12345678",
        licencia="A12345678",
        vehiculo_id="vehiculo-001",
    )

    with pytest.raises(DriverAlreadyExistsError) as exc_info:
        use_case.execute(
            nombre_completo="Segundo Conductor",
            dni="12345678",
            licencia="B12345678",
            vehiculo_id="vehiculo-002",
        )

    assert str(exc_info.value) == (
        "El DNI ingresado ya corresponde a un conductor registrado en el sistema"
    )


def test_get_driver_by_id(repository):
    register = RegisterDriver(repository)

    driver = register.execute(
        nombre_completo="Alex Cueva",
        dni="12345678",
        licencia="A12345678",
        vehiculo_id="vehiculo-001",
    )

    use_case = GetDriverById(repository)

    result = use_case.execute(driver.conductor_id)

    assert result.conductor_id == driver.conductor_id
    assert result.dni == "12345678"


def test_get_driver_by_id_not_found(repository):
    use_case = GetDriverById(repository)

    with pytest.raises(DriverNotFoundError):
        use_case.execute("id-inexistente")


def test_get_drivers(repository):
    register = RegisterDriver(repository)

    register.execute(
        nombre_completo="Conductor 1",
        dni="12345678",
        licencia="A12345678",
        vehiculo_id="vehiculo-001",
    )

    register.execute(
        nombre_completo="Conductor 2",
        dni="87654321",
        licencia="B12345678",
        vehiculo_id="vehiculo-002",
    )

    use_case = GetDrivers(repository)

    result = use_case.execute()

    assert len(result) == 2


def test_update_driver(repository):
    register = RegisterDriver(repository)

    driver = register.execute(
        nombre_completo="Alex Cueva",
        dni="12345678",
        licencia="A12345678",
        vehiculo_id="vehiculo-001",
    )

    use_case = UpdateDriver(repository)

    result = use_case.execute(
        conductor_id=driver.conductor_id,
        nombre_completo="Alex Roberto Cueva",
        licencia="B98765432",
        vehiculo_id="vehiculo-002",
    )

    assert result.nombre_completo == "Alex Roberto Cueva"
    assert result.licencia == "B98765432"
    assert result.vehiculo_id == "vehiculo-002"
    assert result.dni == "12345678"


def test_update_driver_duplicate_dni(repository):
    register = RegisterDriver(repository)

    first = register.execute(
        nombre_completo="Conductor 1",
        dni="12345678",
        licencia="A12345678",
        vehiculo_id="vehiculo-001",
    )

    register.execute(
        nombre_completo="Conductor 2",
        dni="87654321",
        licencia="B12345678",
        vehiculo_id="vehiculo-002",
    )

    use_case = UpdateDriver(repository)

    with pytest.raises(DriverAlreadyExistsError):
        use_case.execute(
            conductor_id=first.conductor_id,
            dni="87654321",
        )


def test_activate_driver(repository):
    register = RegisterDriver(repository)

    driver = register.execute(
        nombre_completo="Alex Cueva",
        dni="12345678",
        licencia="A12345678",
        vehiculo_id="vehiculo-001",
        estado="INACTIVO",
    )

    use_case = ActivateDriver(repository)

    result = use_case.execute(driver.conductor_id)

    assert result.estado == "ACTIVO"


def test_deactivate_driver(repository):
    register = RegisterDriver(repository)

    driver = register.execute(
        nombre_completo="Alex Cueva",
        dni="12345678",
        licencia="A12345678",
        vehiculo_id="vehiculo-001",
    )

    use_case = DeactivateDriver(repository)

    result = use_case.execute(driver.conductor_id)

    assert result.estado == "INACTIVO"
