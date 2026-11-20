"""Verifica PostgreSQL y E2E sin Docker en una base y un rol temporales locales.

La conexión del archivo indicado se usa únicamente en memoria para aprovisionar.
Los archivos temporales contienen credenciales sintéticas que se revocan al salir.
No cambia .env ni inicia/detiene servicios del sistema.
"""
import argparse
from datetime import datetime
import json
import os
from pathlib import Path
import secrets
import socket
import subprocess
import sys
import tempfile
import time
from urllib.parse import quote, urlsplit, urlunsplit
from urllib.request import urlopen
from uuid import uuid4
from zoneinfo import ZoneInfo

from dotenv import dotenv_values
import psycopg
from psycopg import sql
from psycopg.conninfo import conninfo_to_dict

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'src/backend'))
sys.path.insert(0, str(ROOT / 'scripts'))
from test_db.config import Settings
from test_db.database import prepare_database
from test_db.dataset import build_dataset


def run(args):
    values = dotenv_values(args.env_file, interpolate=False)
    source = values.get('DATABASE_URL', '')
    parsed = urlsplit(source)
    if parsed.scheme not in ('postgres', 'postgresql') or parsed.hostname not in ('localhost', '127.0.0.1', '::1'):
        raise ValueError('Selecciona exclusivamente una conexión PostgreSQL local.')
    with socket.socket() as probe:
        probe.bind(('127.0.0.1', args.port))
    parent = conninfo_to_dict(source)
    parent.update(dbname='postgres', connect_timeout='5')
    tag = uuid4().hex[:12]
    database, role = 'alpha_verify_' + tag, 'alpha_runner_' + tag
    password, account_password = secrets.token_urlsafe(32), secrets.token_urlsafe(32)
    host = '[' + parsed.hostname + ']' if ':' in parsed.hostname else parsed.hostname
    address = f'{quote(role)}:{quote(password)}@{host}:{parsed.port or 5432}'
    dsn = urlunsplit(('postgresql', address, '/' + database, parsed.query, ''))
    output = (ROOT / 'reports/native' / tag)
    output.mkdir(parents=True, exist_ok=True)
    created_role = created_database = False
    server = None
    log = None
    receipt = {'run': tag, 'docker_used': False, 'database': database, 'phase': args.phase, 'commands': []}
    try:
        with psycopg.connect(**parent, autocommit=True) as conn:
            conn.execute(sql.SQL('CREATE ROLE {} LOGIN PASSWORD {}').format(sql.Identifier(role), sql.Literal(password)))
            created_role = True
            conn.execute(sql.SQL('CREATE DATABASE {} OWNER {} ENCODING \'UTF8\' TEMPLATE template0').format(sql.Identifier(database), sql.Identifier(role)))
            created_database = True
        provision = {**parent, 'dbname': database}
        with psycopg.connect(**provision) as conn:
            conn.execute('CREATE EXTENSION postgis')
            receipt['postgresql'] = conn.execute('SHOW server_version').fetchone()[0]
            receipt['postgis'] = conn.execute('SELECT postgis_lib_version()').fetchone()[0]
        print('Base aislada creada; PostgreSQL y PostGIS nativos.', flush=True)
        day = datetime.now(ZoneInfo('America/Lima')).date()
        settings = Settings(dsn, database, 'postgres', False, day, 1, 60, account_password)
        prepare_database(settings, build_dataset(settings))
        with psycopg.connect(dsn) as conn:
            for migration in sorted((ROOT / 'src/backend/infrastructure/persistence/migrations').glob('*.sql')):
                conn.execute(migration.read_text(encoding='utf-8'))
        (ROOT / '.test-deps').mkdir(exist_ok=True)
        with tempfile.TemporaryDirectory(prefix='alpha-native-', dir=ROOT / '.test-deps') as temp:
            config = Path(temp) / 'validation.env'
            config.write_text('\n'.join([
                'DB_ENV=test', 'DATABASE_URL=' + dsn, 'DB_CREATE_IF_MISSING=false',
                'SEED_DATE=' + day.isoformat(), 'SEED_DAYS=1', 'SEED_ORDERS_PER_DAY=60',
                'SEED_PASSWORD=' + account_password, 'SESSION_COOKIE_SECURE=false',
            ]) + '\n', encoding='utf-8')
            env = {**os.environ, 'ECOLOGISTICA_ENV_FILE': str(config), 'ECOLOGISTICA_TEST_ENV_FILE': str(config),
                   'ECOLOGISTICA_VERIFY_DATABASE': '1', 'DATABASE_URL': dsn, 'SESSION_COOKIE_SECURE': 'false',
                   'E2E_PASSWORD': account_password, 'E2E_BASE_URL': f'http://127.0.0.1:{args.port}',
                   'FRONTEND_DIST': str(ROOT / 'src/frontend/dist'),
                   'PLAYWRIGHT_BROWSERS_PATH': str(ROOT / '.test-deps/playwright-browsers')}
            if args.phase in ('integration', 'all'):
                command = [sys.executable, '-m', 'pytest', 'src/backend/tests', '-q', '-p', 'no:cacheprovider',
                           '--junitxml=' + str(output / 'backend.xml')]
                result = subprocess.run(command, cwd=ROOT, env=env)
                receipt['commands'].append({'check': 'backend', 'exit_code': result.returncode})
                if result.returncode:
                    return result.returncode
            if args.phase in ('e2e', 'all'):
                if not (ROOT / 'src/frontend/dist/index.html').is_file():
                    raise ValueError('Compila primero el frontend con npm run build.')
                log = (output / 'api.log').open('w', encoding='utf-8')
                command = [sys.executable, '-m', 'uvicorn', 'interfaces.api.main:app', '--app-dir', 'src/backend',
                           '--host', '127.0.0.1', '--port', str(args.port)]
                server = subprocess.Popen(command, cwd=ROOT, env=env, stdout=log, stderr=subprocess.STDOUT,
                                          creationflags=subprocess.CREATE_NO_WINDOW if os.name == 'nt' else 0)
                for _ in range(50):
                    if server.poll() is not None:
                        raise RuntimeError('La API de pruebas no pudo iniciar; revisa el log de esta ejecución.')
                    try:
                        with urlopen(env['E2E_BASE_URL'] + '/health', timeout=1) as response:
                            if response.status == 200:
                                break
                    except OSError:
                        time.sleep(.2)
                else:
                    raise RuntimeError('La API de pruebas no respondió dentro del plazo.')
                command = ['node', 'node_modules/@playwright/test/cli.js', 'test', '--config', 'playwright.e2e.config.ts']
                result = subprocess.run(command, cwd=ROOT / 'src/frontend', env=env)
                receipt['commands'].append({'check': 'e2e_chromium_firefox_webkit', 'exit_code': result.returncode})
                return result.returncode
        return 0
    finally:
        if server:
            server.terminate()
            try:
                server.wait(timeout=10)
            except subprocess.TimeoutExpired:
                server.kill()
                server.wait(timeout=5)
        if log:
            log.close()
        if not database.startswith('alpha_verify_') or not role.startswith('alpha_runner_'):
            raise RuntimeError('El destino de limpieza no corresponde a esta ejecución.')
        with psycopg.connect(**parent, autocommit=True) as conn:
            if created_database:
                conn.execute(sql.SQL('DROP DATABASE {} WITH (FORCE)').format(sql.Identifier(database)))
            if created_role:
                conn.execute(sql.SQL('DROP ROLE {}').format(sql.Identifier(role)))
        receipt['isolated_database_removed'] = created_database
        receipt['temporary_role_removed'] = created_role
        (output / 'receipt.json').write_text(json.dumps(receipt, indent=2) + '\n', encoding='utf-8')
        print('Limpieza de recursos temporales terminada. Recibo: ' + str(output / 'receipt.json'), flush=True)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--env-file', type=Path, default=ROOT / '.env.test')
    parser.add_argument('--phase', choices=['integration', 'e2e', 'all'], default='all')
    parser.add_argument('--port', type=int, default=8019)
    try:
        raise SystemExit(run(parser.parse_args()))
    except (psycopg.Error, ValueError, RuntimeError) as error:
        # Las excepciones SQL pueden contener credenciales en el comando: no imprimirlas.
        print('Validación nativa interrumpida: ' + type(error).__name__, file=sys.stderr)
        raise SystemExit(1)
