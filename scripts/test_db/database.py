"""Creación y carga transaccional. No modifica bases ajenas al marcador de pruebas."""
import hashlib
import json

from .config import Settings, SetupError
from .dataset import ROOT, TABLES

OWNER = 'ecologistica-test-db'
SCHEMA_VERSION = 1
METADATA = 'test_database_metadata'
# Tablas aditivas de la API autenticada; no contienen datos del generador.
API_TABLES = {'sesiones', 'intentos_sesion'}


def seed_signature(settings: Settings):
    policy = (ROOT / 'src/shared/rbac.json').read_bytes()
    return {**settings.seed_config, 'seed_version': 1, 'rbac_sha256': hashlib.sha256(policy).hexdigest()}


def connection_parameters(settings: Settings):
    from psycopg.conninfo import conninfo_to_dict
    try:
        parameters = conninfo_to_dict(settings.database_url)
    except Exception:
        raise SetupError('DATABASE_URL no es una conexión PostgreSQL válida.') from None
    if parameters.get('dbname') != settings.database_name:
        raise SetupError('No se permite redefinir la base mediante parámetros de DATABASE_URL.')
    parameters['connect_timeout'] = '5'
    return parameters


def ensure_database(settings: Settings):
    import psycopg
    from psycopg import sql
    parameters = connection_parameters(settings)
    if not settings.create_if_missing:
        return  # Permite usar una base creada por el administrador sin acceso a mantenimiento.
    maintenance = {**parameters, 'dbname': settings.admin_database}
    # CREATE DATABASE requiere una conexión fuera de transacción.
    with psycopg.connect(**maintenance, autocommit=True) as connection:
        connection.execute("SET lock_timeout = '10s'")
        connection.execute('SELECT pg_advisory_lock(hashtext(%s))', (OWNER+':'+settings.database_name,))
        exists = connection.execute('SELECT 1 FROM pg_database WHERE datname = %s', (settings.database_name,)).fetchone()
        if not exists:
            connection.execute(sql.SQL("CREATE DATABASE {} ENCODING 'UTF8' TEMPLATE template0").format(sql.Identifier(settings.database_name)))


def prepare_database(settings: Settings, dataset: dict, *, reset=False) -> dict[str, int]:
    import psycopg
    from psycopg import sql
    from psycopg.types.json import Jsonb
    ensure_database(settings)
    expected = set(TABLES) | {METADATA}
    with psycopg.connect(**connection_parameters(settings)) as connection:
        connection.execute("SET LOCAL lock_timeout = '10s'")
        connection.execute('SET LOCAL search_path TO public, pg_catalog')
        connection.execute('SELECT pg_advisory_xact_lock(hashtext(%s))', (OWNER,))
        if connection.execute('SELECT current_database()').fetchone()[0] != settings.database_name:
            raise SetupError('La conexión no apunta a la base de pruebas configurada.')
        tables = {row[0] for row in connection.execute("SELECT tablename FROM pg_tables WHERE schemaname = 'public'").fetchall()}
        tables.discard('spatial_ref_sys')  # Tabla gestionada por PostGIS, nunca se reinicia.
        signature = seed_signature(settings)
        if METADATA in tables:
            metadata = connection.execute('SELECT owner, schema_version, seed_config FROM public.test_database_metadata WHERE id = 1').fetchone()
            if not metadata or metadata[0] != OWNER or metadata[1] != SCHEMA_VERSION:
                raise SetupError('El marcador de la base no pertenece a esta versión del generador.')
            if tables - API_TABLES != expected:
                raise SetupError('Hay tablas ajenas o faltantes. Usa otra base de pruebas; no se modifica este esquema.')
            if metadata[2] != signature and not reset:
                raise SetupError('Cambió la configuración de datos o RBAC. Usa --reset o configura otra base de pruebas.')
        elif tables:
            raise SetupError('La base contiene tablas sin marcador del generador. Configura otra base vacía.')
        else:
            schema = (ROOT / 'src/backend/infrastructure/persistence/schema.sql').read_text(encoding='utf-8')
            connection.execute(schema)

        if reset:
            # Lista explícita y sin CASCADE; solo después de validar propiedad y esquema.
            names = sql.SQL(', ').join(sql.Identifier('public', table) for table in (*TABLES, METADATA, *sorted(tables & API_TABLES)))
            connection.execute(sql.SQL('TRUNCATE TABLE {}').format(names))

        with connection.cursor() as cursor:
            for table in TABLES:
                rows = dataset[table]
                if not rows:
                    continue
                columns = list(rows[0])
                expressions = [sql.SQL('ST_SetSRID(ST_GeomFromGeoJSON(%s),4326)') if column == 'geometria' else sql.Placeholder() for column in columns]
                query = sql.SQL('INSERT INTO {} ({}) VALUES ({}) ON CONFLICT DO NOTHING').format(
                    sql.Identifier('public', table), sql.SQL(', ').join(map(sql.Identifier, columns)), sql.SQL(', ').join(expressions))
                values = []
                for row in rows:
                    values.append(tuple(json.dumps(row[column]) if column == 'geometria' else Jsonb(row[column]) if isinstance(row[column], dict) else row[column] for column in columns))
                cursor.executemany(query, values)
        connection.execute('INSERT INTO public.test_database_metadata (id, owner, schema_version, seed_config) VALUES (1,%s,%s,%s) ON CONFLICT (id) DO NOTHING',
                           (OWNER, SCHEMA_VERSION, Jsonb(signature)))
        counts = {table: connection.execute(sql.SQL('SELECT count(*) FROM {}').format(sql.Identifier('public', table))).fetchone()[0] for table in TABLES}
    return counts


def database_error_message(error) -> str:
    state = getattr(error, 'sqlstate', None)
    if state in {'28P01','28000'}:
        return 'No se pudo autenticar en PostgreSQL. Revisa usuario y contraseña en .env.'
    if state == '3D000':
        return 'La base no existe. Créala previamente o configura DB_CREATE_IF_MISSING=true.'
    if state == '42501':
        return 'El usuario necesita permisos para crear la base, tablas y la extensión PostGIS.'
    if state in {'0A000','58P01'}:
        return 'No se pudo instalar PostGIS en la base. Verifica la extensión en tu servidor PostgreSQL.'
    if state == '55P03':
        return 'La base está ocupada por otra operación. Vuelve a ejecutar el comando.'
    return 'PostgreSQL no pudo completar la preparación. Revisa conexión, disponibilidad de PostGIS y permisos. No se confirmó la carga.'
