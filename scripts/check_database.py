"""Verifica conexión y consultas operativas sin imprimir credenciales ni datos personales."""
import sys
from pathlib import Path
from datetime import datetime
from zoneinfo import ZoneInfo
from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'src/backend'))
load_dotenv(ROOT / '.env', override=True)
from infrastructure.persistence.database import connection
from infrastructure.persistence.postgres_portal import PostgresPortal
from infrastructure.persistence.postgres_fleet import PostgresVehicles, PostgresDrivers
from infrastructure.persistence.postgres_dashboard import PostgresDashboard


def main():
    with connection() as conn:
        table_count = conn.execute("SELECT count(*) AS n FROM pg_tables WHERE schemaname='public'").fetchone()['n']
        print(f'Conexión PostgreSQL: OK ({table_count} tablas)')
    portal = PostgresPortal()
    print('Usuarios:',portal.users()['total'])
    print('Flota:',len(PostgresVehicles().find_all()))
    drivers = PostgresDrivers().find_all()
    print('Conductores:',len(drivers))
    with connection() as conn:
        configured = conn.execute('SELECT 1 FROM parametros_algoritmo LIMIT 1').fetchone()
    print('Parámetros:', 'OK' if configured and portal.parameters() else 'Pendientes de crear el primer administrador')
    print('Integraciones:',len(portal.integrations()))
    print('Mapa:',len(portal.map()['orders']),'pedidos con coordenadas')
    print('Reporte:',len(portal.report('month')['series']),'periodos')
    print('Planificación:',portal.scope()['pendingOrders'],'pedidos por asignar')
    print('Auditoría:',len(portal.records('auditoria')),'registros')
    print('Incidencias:',len(portal.records('incidencias')),'registros')
    if drivers:
        print('Ruta del conductor:', 'OK' if portal.driver_route(drivers[0].conductor_id) else 'Sin ruta hoy')
    today = datetime.now(ZoneInfo('America/Lima')).date()
    print('Dashboard:',PostgresDashboard().get_order_counts(today,None).total,'pedidos')
    print('Indicadores complementarios:', 'OK' if portal.insights(today) else 'Vacíos')


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        message = str(error).lower()
        category = next((tag for tag in ('10013','permission denied','password authentication failed','does not exist','connection refused','timeout') if tag in message),type(error).__name__)
        print(f'Verificación incompleta ({category}). Revisa conexión, esquema y migraciones.')
        sys.exit(1)
