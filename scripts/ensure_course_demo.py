"""Prepara un almacén y factores sintéticos para la demostración del curso."""
from os import environ

import psycopg

from test_db.dataset import DEPOT, FUELS, identifier


def main():
    with psycopg.connect(environ['DATABASE_URL'], connect_timeout=5) as connection:
        connection.execute('SELECT pg_advisory_xact_lock(73122)')
        connection.execute(
            """INSERT INTO almacenes(almacen_id, nombre, direccion, latitud, longitud)
            SELECT %s, %s, %s, %s, %s
            WHERE NOT EXISTS (SELECT 1 FROM almacenes)
            ON CONFLICT (almacen_id) DO NOTHING""",
            (identifier('depot', 1), 'Almacén de demostración de Lima Este',
             'Punto ficticio para la demostración del curso', *DEPOT),
        )
        with connection.cursor() as cursor:
            cursor.executemany(
                """INSERT INTO factores_emision(combustible, factor_kg_co2, unidad, fuente, consumo_por_km)
                VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT (combustible) DO NOTHING""",
                [(fuel, factor, f'kg/{unit}', 'Valor sintético de prueba, sin validez normativa.', consumption)
                 for fuel, (factor, unit, consumption) in FUELS.items()],
            )
    print('Datos básicos de demostración disponibles: almacén y factores sintéticos.')


if __name__ == '__main__':
    main()
