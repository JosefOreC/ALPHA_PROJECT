from dataclasses import dataclass, field
from datetime import date
from pathlib import Path
from urllib.parse import urlsplit, unquote, parse_qsl


class SetupError(ValueError):
    """Error de configuración seguro para mostrar sin imprimir secretos."""


@dataclass(frozen=True)
class Settings:
    database_url: str = field(repr=False)
    database_name: str
    admin_database: str
    create_if_missing: bool
    seed_date: date
    days: int
    orders_per_day: int
    password: str = field(repr=False)

    @property
    def seed_config(self):
        return {'date': self.seed_date.isoformat(), 'days': self.days, 'orders_per_day': self.orders_per_day}


def load_settings(env_file: Path) -> Settings:
    try:
        from dotenv import dotenv_values
    except ImportError:
        raise SetupError('Instala src/backend/requirements-postgres.txt.') from None
    if not env_file.is_file():
        raise SetupError('No existe el archivo .env indicado. Copia .env.example a .env y configura DATABASE_URL.')
    values = dotenv_values(env_file, encoding='utf-8-sig', interpolate=False)
    if values.get('DB_ENV') != 'test':
        raise SetupError('DB_ENV debe ser test para preparar una base de pruebas.')
    url = values.get('DATABASE_URL', '')
    try:
        parsed = urlsplit(url)
        name = unquote(parsed.path.lstrip('/'))
        port = parsed.port
        if parsed.scheme not in {'postgresql', 'postgres'} or not parsed.hostname or not parsed.username or not name:
            raise ValueError()
        if '/' in name or len(name.encode('utf-8')) > 63 or '\x00' in name or name in {'postgres', 'template0', 'template1'}:
            raise ValueError()
        if port is not None and not 1 <= port <= 65535:
            raise ValueError()
        if any(key == 'dbname' for key, _ in parse_qsl(parsed.query)):
            raise SetupError('Selecciona la base en la ruta de DATABASE_URL, sin redefinir dbname en sus parámetros.')
        if unquote(parsed.password or '') == 'CHANGE_ME':
            raise SetupError('Configura la contraseña de PostgreSQL en DATABASE_URL de .env.')
    except (ValueError, TypeError) as error:
        if isinstance(error, SetupError):
            raise
        raise SetupError('DATABASE_URL debe ser una URL PostgreSQL válida con usuario, servidor y base de pruebas.') from None
    admin = values.get('DATABASE_ADMIN_DB', 'postgres')
    if not admin or len(admin.encode('utf-8')) > 63 or '\x00' in admin or admin == name:
        raise SetupError('DATABASE_ADMIN_DB debe identificar otra base de mantenimiento válida.')
    create = values.get('DB_CREATE_IF_MISSING', 'true')
    if create not in {'true', 'false'}:
        raise SetupError('DB_CREATE_IF_MISSING debe ser true o false.')
    try:
        seed_date = date.fromisoformat(values.get('SEED_DATE', ''))
        days = int(values.get('SEED_DAYS', '7'))
        orders = int(values.get('SEED_ORDERS_PER_DAY', '150'))
    except (ValueError, TypeError):
        raise SetupError('SEED_DATE debe ser YYYY-MM-DD; cantidades enteras en SEED_DAYS y SEED_ORDERS_PER_DAY.') from None
    if not 1 <= days <= 31 or not 20 <= orders <= 150:
        raise SetupError('Usa entre 1 y 31 días y entre 20 y 150 pedidos por día.')
    if seed_date < date(2000,1,1):
        raise SetupError('SEED_DATE debe ser una fecha operativa a partir del año 2000.')
    password = values.get('SEED_PASSWORD', '')
    if not password or len(password) < 12:
        raise SetupError('Define SEED_PASSWORD con al menos 12 caracteres para los usuarios ficticios.')
    return Settings(url, name, admin, create == 'true', seed_date, days, orders, password)
