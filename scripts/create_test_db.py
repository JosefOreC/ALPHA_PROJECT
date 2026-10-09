"""Uso: python scripts/create_test_db.py [--env-file .env] [--dry-run | --reset]."""
import argparse
import sys
from pathlib import Path

from test_db.config import SetupError, load_settings
from test_db.dataset import ROOT, build_dataset
from test_db.database import database_error_message, prepare_database


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description='Crea PostgreSQL + PostGIS y carga todos los datos ficticios desde .env.')
    parser.add_argument('--env-file', type=Path, default=ROOT / '.env', help='Archivo de configuración; por defecto .env de la raíz.')
    parser.add_argument('--dry-run', action='store_true', help='Valida configuración y muestra cantidades sin conectar a PostgreSQL.')
    parser.add_argument('--reset', action='store_true', help='Reinicia todas las tablas de una base marcada por este generador y vuelve a cargarla.')
    args = parser.parse_args(argv)
    try:
        settings = load_settings(args.env_file)
        if not args.dry_run:
            try:
                import psycopg
            except ImportError:
                raise SetupError('Instala dependencias: python -m pip install -r src/backend/requirements-postgres.txt.') from None
        dataset = build_dataset(settings)
        if args.dry_run:
            print(f'Vista previa: base {settings.database_name}; sin conexión ni escritura.')
            counts = {table: len(rows) for table, rows in dataset.items()}
        else:
            try:
                counts = prepare_database(settings, dataset, reset=args.reset)
            except psycopg.Error as error:
                raise SetupError(database_error_message(error)) from None
            print(f'Base de pruebas preparada: {settings.database_name}.')
        for table, count in counts.items():
            print(f'  {table}: {count}')
        print('Cuentas ficticias: admin, operador, operador2, logistica, auditor y conductor01…conductor15 @example.invalid.')
        print('Contraseña de las cuentas: SEED_PASSWORD de .env (guardada como hash; el login del producto sigue pendiente).')
        return 0
    except (SetupError, OSError) as error:
        # Nunca imprimir DSN, contraseñas ni trazas que contengan valores de conexión.
        message = str(error) if isinstance(error, SetupError) else 'No se pudo leer un archivo requerido de configuración o esquema.'
        print(f'Error: {message}', file=sys.stderr)
        return 1


if __name__ == '__main__':
    raise SystemExit(main())
