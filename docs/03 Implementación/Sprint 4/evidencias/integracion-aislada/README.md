# Verificación final con PostgreSQL/PostGIS real

El 13/11/2026 se ejecutaron las siete pruebas optativas pendientes en una base desechable con 1050 pedidos ficticios, 15 vehículos y 15 conductores. **Resultado: 4 pruebas de datos + 3 pruebas funcionales aprobadas, cero omitidas en esta ejecución.** Son adicionales a las 447 pruebas backend aprobadas del corte anterior; no se presenta una ejecución única de 454 pruebas.

## Resultados y aislamiento

- Salida completa (`integracion-postgis.txt`, registro local) y recibo de ejecución (`integracion-postgis.json`, registro local): ambos grupos terminan con código 0; se registran versiones, imagen exacta y cierre correcto del contenedor.
- La imagen procede del [proyecto oficial PostGIS Docker](https://github.com/postgis/docker-postgis). El contenedor se publica solamente en 127.0.0.1, utiliza almacenamiento temporal, sin montajes del host ni volúmenes persistentes. No carga el .env del usuario. Su eliminación automática está activada y el proceso lo detiene al terminar.
- Se comprueban carga idempotente, geometrías, rollback de escrituras, restauración fallida atómica, rechazo de tablas ajenas, paginación, alcance de conductor, autenticación, altas, parámetros, pedidos, vistas operativas, planificación, previsualización, aprobación y recarga de rutas con PostGIS real.
- El enrutador vial de terceros es un doble determinista; no se afirma probar disponibilidad ni precisión de un servicio vial externo. No se usaron datos reales del usuario.

## Corrección del cliente de pruebas

El primer intento (`intento-http.txt`, registro local) aprobó los cuatro casos de datos y falló los tres funcionales por 401; su recibo (`intento-http.json`, registro local) conserva el resultado sin ocultarlo. El cliente usaba HTTP y no reenviaba la cookie Secure emitida correctamente por el servidor. Se cambió únicamente la fixture de `src/backend/tests/test_postgres_views.py` a `TestClient(create_app(), base_url='https://testserver')`. No se desactiva Secure, CSRF ni la autenticación y no cambia código productivo. El segundo intento aprobó los siete casos.

La advertencia de deprecación Starlette/httpx no impide las pruebas; no se modifica esa dependencia dentro de este cierre. Las mediciones Lighthouse y la cobertura anteriores siguen correspondiendo al mismo código productivo, con esta corrección posterior exclusivamente de pruebas.

## Reproducción y comprobación

Con Docker activo y las dependencias backend instaladas, desde la raíz del repositorio:

```powershell
$evidence = 'docs/03 Implementación/Sprint 4/evidencias/integracion-aislada'
python "$evidence/verify_postgis.py" $evidence
python "$evidence/validar.py"
```

El runner crea su propia base y credenciales efímeras. Repetirlo sustituye el recibo; conservar previamente los artefactos si se necesita mantener otra ejecución. El manifiesto (`procedencia.json`, registro local) contiene las huellas de esta ejecución; validar.py (`validar.py`, registro local) comprueba archivos, código de la fixture, resultados y aritmética Lighthouse/SWDM del corte vigente, sin conectarse a una base.

[← Volver al Sprint 4](../../README.md)
