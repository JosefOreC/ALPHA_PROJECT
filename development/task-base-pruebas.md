# Tarea: generar base de datos de pruebas desde consola

Fecha: 09/10/2026. Vinculada a EN-00, T-02 y EN-02. Estado: generador y datos implementados, con pruebas reales en PostgreSQL 18 + PostGIS.

- [x] Selección del servidor, credenciales y nombre de base desde `.env`; plantilla sin credenciales reales versionada.
- [x] Un comando crea la base si falta, habilita PostGIS, aplica el esquema y carga todos los módulos.
- [x] Modelo de pruebas basado en documento 11, compatible con el adaptador actual de pedidos y los cinco roles del documento 08.
- [x] Datos ficticios relacionados para flota, conductores, operación, mapa, reportes, configuración y auditoría.
- [x] Carga repetible sin duplicados; vista previa y reinicio explícito transaccional, con validación del marcador de propiedad.
- [x] Pruebas de configuración, relaciones, geometría, constraints y rollback en PostgreSQL real.
- [ ] Conectar adaptadores de los módulos de la API a este esquema y al proveedor de identidad real.
- [ ] Convertir el contrato validado en migraciones productivas y verificar concurrencia y políticas de auditoría operativas.

Comando desde la raíz: `.venv\Scripts\python.exe scripts/create_test_db.py`. La [guía de base de pruebas](../docs/03%20Implementaci%C3%B3n/Base%20de%20datos%20de%20pruebas.md) contiene configuración, cantidades, cuentas, límites y cómo repetir las pruebas. No se declara persistencia completa del producto ni aceptación de EN-00/PMV por disponer del generador.
