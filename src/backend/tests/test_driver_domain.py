from domain.entities.driver import Driver


def test_driver_creation():
    driver = Driver(
        nombre_completo="Alex Cueva",
        dni="12345678",
        licencia="A12345678",
        vehiculo_id="vehiculo-001",
    )

    assert driver.nombre_completo == "Alex Cueva"
    assert driver.dni == "12345678"
    assert driver.licencia == "A12345678"
    assert driver.vehiculo_id == "vehiculo-001"
    assert driver.estado == "ACTIVO"
    assert driver.is_active() is True


def test_driver_deactivate():
    driver = Driver(
        nombre_completo="Alex Cueva",
        dni="12345678",
        licencia="A12345678",
        vehiculo_id="vehiculo-001",
    )

    driver.deactivate()

    assert driver.estado == "INACTIVO"
    assert driver.is_active() is False


def test_driver_activate():
    driver = Driver(
        nombre_completo="Alex Cueva",
        dni="12345678",
        licencia="A12345678",
        vehiculo_id="vehiculo-001",
        estado="INACTIVO",
    )

    driver.activate()

    assert driver.estado == "ACTIVO"
    assert driver.is_active() is True


def test_driver_update_info():
    driver = Driver(
        nombre_completo="Alex Cueva",
        dni="12345678",
        licencia="A12345678",
        vehiculo_id="vehiculo-001",
    )

    driver.update_info(
        nombre_completo="Alex Roberto Cueva",
        licencia="B98765432",
        vehiculo_id="vehiculo-002",
    )

    assert driver.nombre_completo == "Alex Roberto Cueva"
    assert driver.licencia == "B98765432"
    assert driver.vehiculo_id == "vehiculo-002"
    assert driver.dni == "12345678"


def test_invalid_dni():
    try:
        Driver(
            nombre_completo="Alex Cueva",
            dni="1234",
            licencia="A12345678",
            vehiculo_id="vehiculo-001",
        )
        assert False
    except ValueError as exc:
        assert str(exc) == "El DNI debe contener exactamente 8 dígitos"
