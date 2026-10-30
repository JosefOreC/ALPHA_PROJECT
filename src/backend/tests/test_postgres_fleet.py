from contextlib import contextmanager
from datetime import datetime, timezone
from unittest.mock import patch
from uuid import uuid4

import pytest
import psycopg

from domain.entities.driver import Driver
from domain.entities.vehicle import Vehicle
from domain.exceptions.driver_exceptions import (
    DriverAlreadyExistsError,
    DriverLicenseAlreadyExistsError,
)
from domain.exceptions.vehicle_exceptions import VehiclePlateAlreadyExistsError
from domain.value_objects import VehicleCombustibles, VehicleStates
from infrastructure.persistence.postgres_fleet import PostgresDrivers, PostgresVehicles

class FakeCursor:
    def __init__(self, row=None):
        self.row = row

    def fetchone(self):
        return self.row

    def fetchall(self):
        return [self.row] if self.row else []


class FakeConnection:
    def __init__(self, row=None, error=None):
        self.row = row
        self.error = error
        self.calls = []

    def execute(self, sql, parameters=()):
        self.calls.append((sql, parameters))

        if self.error:
            raise self.error

        return FakeCursor(self.row)


@pytest.fixture
def driver_data():
    return {
        "nombre_completo": "Alex Cueva",
        "dni": "12345678",
        "licencia": "A12345678",
        "vehiculo_id": str(uuid4()),
        "estado": "ACTIVO",
        "conductor_id": str(uuid4()),
        "usuario_id": str(uuid4()),
        "creado_en": datetime.now(timezone.utc),
    }


def test_find_by_dni(driver_data):
    connection = FakeConnection(driver_data)

    with patch(
        "infrastructure.persistence.postgres_fleet.rows",
        return_value=[driver_data],
    ):
        result = PostgresDrivers().find_by_dni("12345678")

    assert result.dni == "12345678"


def test_find_by_license(driver_data):
    with patch(
        "infrastructure.persistence.postgres_fleet.rows",
        return_value=[driver_data],
    ):
        result = PostgresDrivers().find_by_licencia("A12345678")

    assert result.licencia == "A12345678"


def test_find_by_invalid_id_does_not_query():
    with patch(
        "infrastructure.persistence.postgres_fleet.rows"
    ) as mocked_rows:
        result = PostgresDrivers().find_by_id("id-invalido")

    assert result is None
    mocked_rows.assert_not_called()


def test_save_driver_with_active_driver_user(driver_data):
    fake_connection = FakeConnection({"usuario_id": driver_data["usuario_id"], "rol": "driver"})

    @contextmanager
    def fake_database_connection():
        yield fake_connection

    driver = Driver(
        nombre_completo=driver_data["nombre_completo"],
        dni=driver_data["dni"],
        licencia=driver_data["licencia"],
        vehiculo_id=driver_data["vehiculo_id"],
        usuario_id=driver_data["usuario_id"],
    )

    with patch(
        "infrastructure.persistence.postgres_fleet.connection",
        fake_database_connection,
    ):
        result = PostgresDrivers().save(driver)

    assert result is driver
    assert len(fake_connection.calls) == 2
    assert "SELECT usuario_id,rol FROM usuarios" in fake_connection.calls[0][0]
    assert "INSERT INTO conductores" in fake_connection.calls[1][0]


def test_save_driver_rejects_user_without_driver_role(driver_data):
    fake_connection = FakeConnection({"usuario_id": driver_data["usuario_id"], "rol": "admin"})

    @contextmanager
    def fake_database_connection():
        yield fake_connection

    driver = Driver(
        nombre_completo=driver_data["nombre_completo"],
        dni=driver_data["dni"],
        licencia=driver_data["licencia"],
        vehiculo_id=driver_data["vehiculo_id"],
        usuario_id=driver_data["usuario_id"],
    )

    with patch(
        "infrastructure.persistence.postgres_fleet.connection",
        fake_database_connection,
    ):
        with pytest.raises(ValueError):
            PostgresDrivers().save(driver)

    assert len(fake_connection.calls) == 1
    assert "INSERT INTO conductores" not in fake_connection.calls[0][0]


def test_save_driver_rejects_invalid_vehicle_id(driver_data):
    driver = Driver(
        nombre_completo=driver_data["nombre_completo"],
        dni=driver_data["dni"],
        licencia=driver_data["licencia"],
        vehiculo_id="vehiculo-invalido",
        usuario_id=driver_data["usuario_id"],
    )

    with patch(
        "infrastructure.persistence.postgres_fleet.connection"
    ) as mocked_connection:
        with pytest.raises(ValueError):
            PostgresDrivers().save(driver)

    mocked_connection.assert_not_called()


def test_save_driver_translates_unique_violation(driver_data):
    from types import SimpleNamespace
    class DniUniqueViolation(psycopg.errors.UniqueViolation):
        @property
        def diag(self):
            return SimpleNamespace(
                constraint_name="conductores_dni_key"
            )
    class DuplicateOnInsertConnection(FakeConnection):
        def execute(self, sql, parameters=()):
            self.calls.append((sql, parameters))

            if sql.startswith("INSERT INTO conductores"):
                raise DniUniqueViolation("duplicate DNI")

            return FakeCursor(self.row)
    fake_connection = DuplicateOnInsertConnection(
        row={
            "usuario_id": driver_data["usuario_id"],
            "rol": "driver",
        }
    )
    @contextmanager
    def fake_database_connection():
        yield fake_connection

    driver = Driver(
        nombre_completo=driver_data["nombre_completo"],
        dni=driver_data["dni"],
        licencia=driver_data["licencia"],
        vehiculo_id=driver_data["vehiculo_id"],
        usuario_id=driver_data["usuario_id"],
    )
    with patch(
        "infrastructure.persistence.postgres_fleet.connection",
        fake_database_connection,
    ):
        with pytest.raises(DriverAlreadyExistsError):
            PostgresDrivers().save(driver)

    assert len(fake_connection.calls) == 2
    assert "INSERT INTO conductores" in fake_connection.calls[1][0]

def test_update_driver_executes_update_sql(driver_data):
    fake_connection = FakeConnection()

    @contextmanager
    def fake_database_connection():
        yield fake_connection

    driver = Driver(
        nombre_completo=driver_data["nombre_completo"],
        dni=driver_data["dni"],
        licencia=driver_data["licencia"],
        vehiculo_id=driver_data["vehiculo_id"],
        usuario_id=driver_data["usuario_id"],
    )

    with patch(
        "infrastructure.persistence.postgres_fleet.connection",
        fake_database_connection,
    ):
        result = PostgresDrivers().update(driver)

    assert result is driver
    assert len(fake_connection.calls) == 1
    assert "UPDATE conductores SET" in fake_connection.calls[0][0]

def test_update_driver_rejects_invalid_vehicle_id(driver_data):
    driver = Driver(
        nombre_completo=driver_data["nombre_completo"],
        dni=driver_data["dni"],
        licencia=driver_data["licencia"],
        vehiculo_id="vehiculo-invalido",
        usuario_id=driver_data["usuario_id"],
    )

    with patch(
        "infrastructure.persistence.postgres_fleet.connection"
    ) as mocked_connection:
        with pytest.raises(ValueError):
            PostgresDrivers().update(driver)

    mocked_connection.assert_not_called()

def test_save_driver_translates_duplicate_license(driver_data):
    from types import SimpleNamespace

    class LicenseUniqueViolation(psycopg.errors.UniqueViolation):
        @property
        def diag(self):
            return SimpleNamespace(
                constraint_name="conductores_licencia_key"
            )

    class DuplicateLicenseConnection(FakeConnection):
        def execute(self, sql, parameters=()):
            self.calls.append((sql, parameters))

            if sql.startswith("INSERT INTO conductores"):
                raise LicenseUniqueViolation("duplicate license")

            return FakeCursor(self.row)

    fake_connection = DuplicateLicenseConnection(
        row={
            "usuario_id": driver_data["usuario_id"],
            "rol": "driver",
        }
    )

    @contextmanager
    def fake_database_connection():
        yield fake_connection

    driver = Driver(
        nombre_completo=driver_data["nombre_completo"],
        dni=driver_data["dni"],
        licencia=driver_data["licencia"],
        vehiculo_id=driver_data["vehiculo_id"],
        usuario_id=driver_data["usuario_id"],
    )

    with patch(
        "infrastructure.persistence.postgres_fleet.connection",
        fake_database_connection,
    ):
        with pytest.raises(DriverLicenseAlreadyExistsError):
            PostgresDrivers().save(driver)

    assert len(fake_connection.calls) == 2
    assert "INSERT INTO conductores" in fake_connection.calls[1][0]

def vehicle_data(**overrides):
    data = {
        "placa": "ABC-123",
        "capacidad_kg": 3500,
        "capacidad_m3": 15,
        "tipo_combustible": "DIESEL",
        "estado": "DISPONIBLE",
        "vehiculo_id": str(uuid4()),
        "creado_en": datetime.now(timezone.utc),
    }
    data.update(overrides)
    return data


def test_find_all_vehicles():
    data = vehicle_data()

    with patch(
        "infrastructure.persistence.postgres_fleet.rows",
        return_value=[data],
    ) as mock_rows:
        result = PostgresVehicles().find_all()

    assert len(result) == 1
    assert isinstance(result[0], Vehicle)
    assert result[0].placa == "ABC-123"
    mock_rows.assert_called_once_with(
        "SELECT * FROM vehiculos ORDER BY placa",
        (),
    )


def test_find_all_vehicles_by_status():
    data = vehicle_data()

    with patch(
        "infrastructure.persistence.postgres_fleet.rows",
        return_value=[data],
    ) as mock_rows:
        result = PostgresVehicles().find_all(VehicleStates.DISPONIBLE)

    assert len(result) == 1
    mock_rows.assert_called_once_with(
        "SELECT * FROM vehiculos WHERE estado=%s ORDER BY placa",
        ("DISPONIBLE",),
    )


def test_find_by_id_vehicle():
    data = vehicle_data()

    with patch(
        "infrastructure.persistence.postgres_fleet.rows",
        return_value=[data],
    ):
        result = PostgresVehicles().find_by_id(data["vehiculo_id"])

    assert result is not None
    assert result.placa == "ABC-123"


def test_find_by_id_vehicle_invalid():
    with patch(
        "infrastructure.persistence.postgres_fleet.rows"
    ) as mock_rows:
        result = PostgresVehicles().find_by_id("invalid-id")

    assert result is None
    mock_rows.assert_not_called()


def test_find_by_id_vehicle_not_found():
    with patch(
        "infrastructure.persistence.postgres_fleet.rows",
        return_value=[],
    ):
        result = PostgresVehicles().find_by_id(str(uuid4()))

    assert result is None


def test_find_by_plate_vehicle():
    data = vehicle_data()

    with patch(
        "infrastructure.persistence.postgres_fleet.rows",
        return_value=[data],
    ) as mock_rows:
        result = PostgresVehicles().find_by_plate("abc-123")

    assert result is not None
    assert result.placa == "ABC-123"
    mock_rows.assert_called_once_with(
        "SELECT * FROM vehiculos WHERE placa=%s",
        ("ABC-123",),
    )


def test_find_by_plate_vehicle_not_found():
    with patch(
        "infrastructure.persistence.postgres_fleet.rows",
        return_value=[],
    ):
        result = PostgresVehicles().find_by_plate("ABC-123")

    assert result is None

def test_vehicle_capacity_m3_none():
    data = vehicle_data(capacidad_m3=None)

    with patch(
        "infrastructure.persistence.postgres_fleet.rows",
        return_value=[data],
    ):
        result = PostgresVehicles().find_by_id(data["vehiculo_id"])

    assert result.capacidad_m3 is None


def test_save_vehicle():
    fake_connection = FakeConnection()

    @contextmanager
    def fake_database_connection():
        yield fake_connection

    item = Vehicle(
        placa="ABC-123",
        capacidad_kg=3500,
        capacidad_m3=15,
        tipo_combustible=VehicleCombustibles.DIESEL,
    )

    with patch(
        "infrastructure.persistence.postgres_fleet.connection",
        fake_database_connection,
    ):
        result = PostgresVehicles().save(item)

    assert result is item
    assert len(fake_connection.calls) == 1
    assert "INSERT INTO vehiculos" in fake_connection.calls[0][0]


def test_update_vehicle():
    fake_connection = FakeConnection()

    @contextmanager
    def fake_database_connection():
        yield fake_connection

    item = Vehicle(
        placa="ABC-123",
        capacidad_kg=3500,
        tipo_combustible=VehicleCombustibles.DIESEL,
    )

    with patch(
        "infrastructure.persistence.postgres_fleet.connection",
        fake_database_connection,
    ):
        result = PostgresVehicles().update(item)

    assert result is item
    assert len(fake_connection.calls) == 1
    assert "UPDATE vehiculos SET" in fake_connection.calls[0][0]


def test_save_vehicle_translates_unique_violation():
    class DuplicateVehicleConnection(FakeConnection):
        def execute(self, sql, parameters=()):
            self.calls.append((sql, parameters))

            if sql.startswith("INSERT INTO vehiculos"):
                raise psycopg.errors.UniqueViolation("duplicate plate")

            return FakeCursor(self.row)

    fake_connection = DuplicateVehicleConnection()

    @contextmanager
    def fake_database_connection():
        yield fake_connection

    item = Vehicle(
        placa="ABC-123",
        capacidad_kg=3500,
        tipo_combustible=VehicleCombustibles.DIESEL,
    )

    with patch(
        "infrastructure.persistence.postgres_fleet.connection",
        fake_database_connection,
    ):
        with pytest.raises(VehiclePlateAlreadyExistsError):
            PostgresVehicles().save(item)

    assert len(fake_connection.calls) == 1
    assert "INSERT INTO vehiculos" in fake_connection.calls[0][0]


def test_update_vehicle_translates_unique_violation():
    class DuplicateVehicleConnection(FakeConnection):
        def execute(self, sql, parameters=()):
            self.calls.append((sql, parameters))

            if sql.startswith("UPDATE vehiculos"):
                raise psycopg.errors.UniqueViolation("duplicate plate")

            return FakeCursor(self.row)

    fake_connection = DuplicateVehicleConnection()

    @contextmanager
    def fake_database_connection():
        yield fake_connection

    item = Vehicle(
        placa="ABC-123",
        capacidad_kg=3500,
        tipo_combustible=VehicleCombustibles.DIESEL,
    )

    with patch(
        "infrastructure.persistence.postgres_fleet.connection",
        fake_database_connection,
    ):
        with pytest.raises(VehiclePlateAlreadyExistsError):
            PostgresVehicles().update(item)

    assert len(fake_connection.calls) == 1
    assert "UPDATE vehiculos SET" in fake_connection.calls[0][0]