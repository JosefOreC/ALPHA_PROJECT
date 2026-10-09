"""Prepara una base nueva con esquema y catálogos; no carga datos de ejemplo."""
import json
import os
import sys
from pathlib import Path
from urllib.parse import urlsplit, unquote
import psycopg
from psycopg import sql
from psycopg.conninfo import make_conninfo
from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[1]
load_dotenv(ROOT / '.env', override=True)


def main():
    dsn = os.getenv('DATABASE_URL','')
    parsed = urlsplit(dsn)
    name = unquote(parsed.path.lstrip('/'))
    admin = os.getenv('DATABASE_ADMIN_DB','postgres')
    if parsed.scheme not in ('postgres','postgresql') or not name or '/' in name or name in ('postgres','template0','template1') or name==admin:
        raise ValueError('Selecciona una base de aplicación válida en DATABASE_URL.')
    with psycopg.connect(make_conninfo(dsn,dbname=admin),autocommit=True,connect_timeout=5) as maintenance:
        available = maintenance.execute("SELECT 1 FROM pg_available_extensions WHERE name='postgis'").fetchone()
        if not available:
            raise ValueError('Instala la extensión PostGIS para esta versión de PostgreSQL antes de preparar el esquema.')
        if not maintenance.execute('SELECT 1 FROM pg_database WHERE datname=%s',(name,)).fetchone():
            maintenance.execute(sql.SQL('CREATE DATABASE {}').format(sql.Identifier(name)))
            print('Base de aplicación creada.')
    with psycopg.connect(dsn,connect_timeout=5) as conn:
        existing = conn.execute("SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename<>'spatial_ref_sys' LIMIT 1").fetchone()
        if existing:
            print('La base ya contiene tablas. No se modificó su esquema; ejecuta scripts/migrate.py.')
            return
        conn.execute((ROOT / 'src/backend/infrastructure/persistence/schema.sql').read_text(encoding='utf-8'))
        policy = json.loads((ROOT / 'src/shared/rbac.json').read_text(encoding='utf-8'))
        for role, item in policy['roles'].items():
            conn.execute('INSERT INTO roles(rol,codigo,nombre,descripcion) VALUES (%s,%s,%s,%s)',(item['backend'],item['code'],item['label'],item['description']))
        for permission, grants in policy['permissions'].items():
            conn.execute('INSERT INTO permisos(permiso) VALUES (%s)',(permission,))
            for role, scope in grants.items():
                conn.execute('INSERT INTO rol_permisos(rol,permiso,alcance) VALUES (%s,%s,%s)',(policy['roles'][role]['backend'],permission,scope))
        for identifier, name, description in [
            ('db','PostgreSQL + PostGIS','Persistencia de la operación'),
            ('map','Cartografía','Visualización de rutas y posiciones'),
            ('traffic','Tráfico','Información de tráfico para la planificación'),
            ('smtp','Correo','Notificaciones de la organización'),
        ]:
            conn.execute("INSERT INTO integraciones(integracion_id,nombre,estado,descripcion) VALUES (%s,%s,'PENDIENTE',%s)",(identifier,name,description))
    print('Esquema y catálogos preparados. No se crearon usuarios, pedidos, vehículos ni rutas de ejemplo.')


if __name__ == '__main__':
    try:
        main()
    except ValueError as error:
        print(str(error))
        sys.exit(1)
    except Exception as error:
        print(f'No se pudo preparar la base ({type(error).__name__}). Revisa DATABASE_URL y los permisos de PostgreSQL.')
        sys.exit(1)
