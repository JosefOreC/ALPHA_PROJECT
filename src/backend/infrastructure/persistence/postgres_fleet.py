from uuid import UUID
from domain.entities.vehicle import Vehicle
from domain.entities.driver import Driver
from domain.ports.vehicle_repository import VehicleRepositoryPort
from domain.ports.driver_repository import DriverRepository
from domain.exceptions.vehicle_exceptions import VehiclePlateAlreadyExistsError
from domain.exceptions.driver_exceptions import DriverAlreadyExistsError
from domain.access_control import canonical_role
from infrastructure.persistence.database import connection, rows


def valid_id(value):
    try:
        UUID(value)
        return True
    except (ValueError, TypeError, AttributeError):
        return False


def vehicle(row):
    return Vehicle(placa=row['placa'], capacidad_kg=float(row['capacidad_kg']),
                   capacidad_m3=float(row['capacidad_m3']) if row['capacidad_m3'] else None,
                   tipo_combustible=row['tipo_combustible'], estado=row['estado'],
                   vehiculo_id=str(row['vehiculo_id']), creado_en=row['creado_en'])


class PostgresVehicles(VehicleRepositoryPort):
    def find_all(self, status=None):
        return [vehicle(row) for row in rows('SELECT * FROM vehiculos' + (' WHERE estado=%s' if status else '') + ' ORDER BY placa', (status.value,) if status else ())]

    def find_by_id(self, value):
        result = rows('SELECT * FROM vehiculos WHERE vehiculo_id=%s', (value,)) if valid_id(value) else []
        return vehicle(result[0]) if result else None

    def find_by_plate(self, value):
        result = rows('SELECT * FROM vehiculos WHERE placa=%s', (value.upper(),))
        return vehicle(result[0]) if result else None

    def _write(self, item, update=False):
        import psycopg
        values = (item.placa, item.capacidad_kg, item.capacidad_m3, item.tipo_combustible.value, item.estado.value, item.vehiculo_id)
        try:
            with connection() as conn:
                if update:
                    conn.execute('UPDATE vehiculos SET placa=%s,capacidad_kg=%s,capacidad_m3=%s,tipo_combustible=%s,estado=%s WHERE vehiculo_id=%s', values)
                else:
                    conn.execute('INSERT INTO vehiculos(placa,capacidad_kg,capacidad_m3,tipo_combustible,estado,vehiculo_id,creado_en) VALUES (%s,%s,%s,%s,%s,%s,%s)', values+(item.creado_en,))
        except psycopg.errors.UniqueViolation:
            raise VehiclePlateAlreadyExistsError() from None
        return item

    def save(self, item):
        return self._write(item)

    def update(self, item):
        return self._write(item, True)


def driver(row):
    return Driver(nombre_completo=row['nombre_completo'], dni=row['dni'], licencia=row['licencia'],
                  vehiculo_id=str(row['vehiculo_id']), estado=row['estado'],
                  conductor_id=str(row['conductor_id']), creado_en=row['creado_en'], usuario_id=str(row['usuario_id']))


class PostgresDrivers(DriverRepository):
    def find_all(self):
        return [driver(row) for row in rows('SELECT * FROM conductores ORDER BY nombre_completo')]

    def find_by_id(self, value):
        result = rows('SELECT * FROM conductores WHERE conductor_id=%s', (value,)) if valid_id(value) else []
        return driver(result[0]) if result else None

    def find_by_dni(self, value):
        result = rows('SELECT * FROM conductores WHERE dni=%s', (value,))
        return driver(result[0]) if result else None

    def _write(self, item, update=False):
        import psycopg
        if not valid_id(item.vehiculo_id):
            raise ValueError('Selecciona un vehículo registrado.')
        try:
            with connection() as conn:
                values = (item.nombre_completo, item.dni, item.licencia, item.vehiculo_id, item.estado.value, item.conductor_id)
                if update:
                    conn.execute('UPDATE conductores SET nombre_completo=%s,dni=%s,licencia=%s,vehiculo_id=%s,estado=%s WHERE conductor_id=%s', values)
                else:
                    user = conn.execute("SELECT usuario_id,rol FROM usuarios WHERE usuario_id=%s AND estado='ACTIVO'", (item.usuario_id,)).fetchone() if valid_id(item.usuario_id) else None
                    if not user or canonical_role(user['rol']) != 'driver':
                        raise ValueError('Selecciona una cuenta activa de conductor creada por el administrador.')
                    conn.execute('INSERT INTO conductores(nombre_completo,dni,licencia,vehiculo_id,estado,conductor_id,usuario_id,creado_en) VALUES (%s,%s,%s,%s,%s,%s,%s,%s)', values+(item.usuario_id,item.creado_en))
        except psycopg.errors.UniqueViolation:
            raise DriverAlreadyExistsError() from None
        return item

    def save(self, item):
        return self._write(item)

    def update(self, item):
        return self._write(item, True)
