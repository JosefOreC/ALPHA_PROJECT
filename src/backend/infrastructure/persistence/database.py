"""Conexiones cortas; importar la aplicación no abre conexiones ni altera tablas."""
import os
from contextlib import contextmanager
from psycopg import Error as DatabaseError

class DatabaseUnavailable(RuntimeError):
    pass


@contextmanager
def connection():
    import psycopg
    from psycopg.rows import dict_row
    dsn = os.getenv("DATABASE_URL")
    if not dsn:
        raise DatabaseUnavailable("Configura DATABASE_URL para conectar PostgreSQL.")
    with psycopg.connect(dsn, row_factory=dict_row, connect_timeout=5) as conn:
        yield conn


def rows(sql, params=()):
    with connection() as conn:
        return conn.execute(sql, params).fetchall()
