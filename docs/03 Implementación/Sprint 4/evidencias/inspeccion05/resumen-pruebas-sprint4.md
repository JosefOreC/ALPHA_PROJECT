# Resumen de pruebas y evidencias del Sprint 4 (Inspección 5)

**Fecha de ejecución:** 20/11/2026 (hora de Lima) · **Entorno:** servicio de Render del curso, `https://ecologistica-lima-qolz.onrender.com` · **Rama:** `inspection5/sprint4`

Este resumen cubre las pruebas ejecutadas el 20/11/2026 y la revisión de Jira hecha por el equipo. El despliegue en Render y la configuración de secretos de GitHub no se pudieron ejecutar desde este equipo; se listan en la sección 5 para coordinarlos.

## 1. Pruebas en la app (pedidos, ruta, conductor)

Se usaron las cuentas del equipo con rol Planificador y Conductor. Las contraseñas no se guardaron en ningún archivo y no aparecen en las capturas.

| Paso | Resultado | Captura |
|---|---|---|
| Registrar dos pedidos de prueba (`Cliente Prueba S4-01`, San Juan de Lurigancho, y `Cliente Prueba S4-02`, El Agustino) | Correcto. La app mostró «Pedido guardado correctamente.» | — |
| Almacén | Ya existía el «Almacén de demostración de Lima Este»; no hizo falta agregar otro | — |
| Planificación → Generar rutas (prioridad «Menos CO₂») | Una ruta con los **dos pedidos asignados al mismo conductor y vehículo**: 12,6 km, 1,92 kg de CO₂ estimado (−36,8 % frente a la ruta sin optimizar), 100 % dentro de ventana, calculada en 2,14 s | `pruebas-app/01-propuesta-dos-pedidos-mismo-conductor.png` |
| Aprobar y guardar rutas | Correcto. Estado «Rutas guardadas» | — |
| Conductor → Mi ruta | Muestra 0/2 entregas y las dos paradas en orden | `pruebas-app/02-conductor-mi-ruta-0-de-2.png` |
| Conductor → abrir la parada 1 | **«Confirmar entrega» aparece deshabilitado** mientras el pedido está Pendiente | `pruebas-app/03-conductor-confirmar-deshabilitado-pendiente.png` |
| Planificación → Pedidos → «Marcar en camino» | Correcto. Mensaje «El conductor ya puede confirmar su entrega.» | `pruebas-app/04-planificacion-pedido-marcado-en-camino.png` |
| Conductor → «Confirmar entrega» y confirmar en el diálogo | Correcto. La app mostró «Entrega confirmada · 09:15 · hora de Lima» y el pedido pasó a Entregado | `pruebas-app/05-conductor-pedido-en-camino-confirmar-habilitado.png`, `pruebas-app/06-conductor-entrega-confirmada.png` |
| Conductor → volver a Mi ruta | El avance muestra **1/2** y la parada 1 figura «entregado» | `pruebas-app/08-conductor-mi-ruta-1-de-2.png` |
| Planificación → Pedidos | El pedido figura **Entregado**, con la hora de confirmación registrada, y el contador de entregados subió de 2 a 3 | `pruebas-app/07-planificacion-estado-entregado.png` |

### Observaciones y pasos que no salieron como se esperaba

1. **Conductor y vehículo adicionales: creados después de la prueba principal.** En «Registrar conductor» no había cuentas con rol Conductor ni vehículos libres, así que el Administrador creó la cuenta «Conductor Prueba S4» (rol Conductor), Planificación registró el vehículo `TST-401` (gasolina, 500 kg) y luego el conductor con ese vehículo, usando un DNI ficticio. Se comprobó que la cuenta nueva inicia sesión como Conductor. Su contraseña inicial se entregó por canal privado y no se guarda en el repositorio. Con el conductor original ya se había cumplido el requisito de asignar al menos dos pedidos al mismo conductor.
2. **El paso «Marcar en camino» es necesario antes de confirmar.** La consigna no lo menciona. Sin ese paso el botón «Confirmar entrega» queda deshabilitado y la app muestra «Este pedido no requiere confirmación en su estado actual.». Es el comportamiento previsto del sistema, no un fallo. **Flujo correcto para la prueba:** Planificación genera y aprueba la ruta → Planificación marca el pedido «En camino» → el conductor confirma en «Mi ruta» → Planificación verifica el estado «Entregado».
3. **Hojas de estilo de Google Fonts bloqueadas.** La consola del navegador registra, en cada carga, que la política de seguridad de contenido bloquea `fonts.googleapis.com`; la interfaz usaba la tipografía de respaldo. **Corregido en la rama `fix/sprint4/fuentes-locales` (commit `b485bfc`):** Geist y Geist Mono se empaquetan con `@fontsource` y se sirven desde el propio sitio, sin relajar la política ni consultar a terceros. Se verificó en una copia limpia que `index.html` ya no referencia Google Fonts, que la compilación genera los archivos `woff2` y que la prueba de reglas de diseño pasa. Queda pendiente integrar la rama en `main` y desplegar para que el cambio llegue a Render.
4. **Respuesta 401 en `/api/session` antes de iniciar sesión.** Es esperable: la app consulta la sesión sin credenciales al abrir.
5. **Mensaje de error engañoso al repetir una licencia.** Al registrar el conductor con una licencia que ya usaba otro (la restricción de unicidad existe en la base de datos), la app respondió HTTP 409 con «El DNI ingresado ya corresponde a un conductor registrado en el sistema», aunque el DNI era nuevo. La causa está en `PostgresDrivers._write`, que traduce cualquier violación de unicidad a ese mensaje. Se resolvió en la prueba usando otra licencia. **Corregido en la rama `fix/sprint4/duplicados-conductor` (commit `988bb7e`):** el mensaje ahora distingue DNI, licencia, vehículo y cuenta de acceso según la restricción violada, con pruebas nuevas; la suite del backend pasó completa (535 pruebas, 9 omitidas). Los nombres de restricción se dedujeron de `schema.sql` (nombres por defecto de PostgreSQL) y no se comprobaron contra una base real. Queda pendiente integrar la rama en `main` y desplegar.
6. **Contador desactualizado en la pantalla del pedido.** Justo después de confirmar, la pantalla del pedido seguía mostrando 0/2 aunque la entrega ya figuraba confirmada; el contador se actualizó a 1/2 al volver a «Mi ruta». El código de `DriverOrderView` vuelve a pedir la ruta después de confirmar, por lo que el desfase probablemente corresponde a la espera de esa consulta en Render. No se pudo reproducir como defecto permanente y no se cambió código.
7. **Datos de prueba que quedan en Render:** `Cliente Prueba S4-02` (entregado), `Cliente Prueba S4-01` (pendiente, dentro de la ruta guardada), y la cuenta, el conductor y el vehículo `TST-401` de «Conductor Prueba S4». No se comprobó si la app permite eliminarlos; el detalle del pedido entregado indica que ya no se puede modificar.

## 2. Rendimiento de Render

Archivo: `latencia-render.csv`, generado con `python scripts/measure_render_latency.py` y una cuenta de Planificación. Se ejecutó desde un equipo en Lima. En Windows fue necesario indicar el paquete de certificados `certifi` mediante `SSL_CERT_FILE`, porque el almacén local de Python no validaba el certificado; la verificación TLS no se desactivó.

| Consulta | Muestras | Mínimo | Máximo | Muestras bajo 500 ms |
|---|---|---|---|---|
| `/health` (primera consulta) | 1 | 824 ms | 824 ms | 0 de 1 |
| `/health` (seguimiento) | 5 | 561 ms | 671 ms | 0 de 5 |
| `/api/pedidos?limit=12&offset=0` | 5 | 790 ms | 953 ms | 0 de 5 |

El resultado fue válido (HTTP 200 en las 11 muestras y cierre de sesión confirmado), pero **ninguna muestra cumplió el límite de 500 ms**; el script terminó con código 1. Los valores incluyen la latencia de red entre el equipo de prueba y el servidor. Antes de la medición, una consulta a `/health` tardó unos 22 s por el arranque en frío del servicio.

## 3. Despliegue (Deploy production)

No se ejecutó. El flujo `.github/workflows/deploy-production.yml` exige el secreto `RENDER_API_KEY`, las variables `RENDER_SERVICE_ID`, `PRODUCTION_URL` y `PRODUCTION_DEPLOY_ENABLED = true`, y se dispara tras un `Tests` exitoso en `main`. Esta sesión no tiene acceso a la clave de Render ni a la configuración de GitHub del repositorio.

## 4. Jira

Revisión hecha el 20/11/2026 desde la vista Lista del proyecto, con las épicas desplegadas. No hay un sprint activo, por lo que no existe un tablero con esas historias; la Lista muestra las mismas actividades con su estado.

| Clave | Historia | Épica | Estado en Jira |
|---|---|---|---|
| ELODRSPDSC-17 | US-003 · Registrar pedido de entrega | EP-02 | Listo |
| ELODRSPDSC-18 | US-004 · Confirmar entrega de un pedido | EP-02 | Listo |
| ELODRSPDSC-22 | US-005 · Generar rutas optimizadas del día | EP-03 | Listo |

Los tres estados coinciden con el acta de aceptación, que registra las tres historias como aceptadas. Captura: `jira-lista-estados-17-18-22.png` (se ocultaron las fotos de perfil).

Observaciones:

- La Lista anida las historias dentro de su épica; con las épicas plegadas solo se ven las actividades sin épica y puede parecer que faltan tickets.
- Durante la revisión se crearon por error tres historias duplicadas (ELODRSPDSC-37, -38 y -39) y se eliminaron; los documentos del Sprint 4 siguen citando las claves 17, 18 y 22.
- No se comprobó en esta revisión que los comentarios de las tres historias contengan los enlaces a commits y pruebas. Esos enlaces están reunidos en la matriz del documento `08 Cierre tecnico y trazabilidad`.

## 5. Pendiente de coordinar

- Agregar en los comentarios de ELODRSPDSC-17, -18 y -22 los enlaces a commits y pruebas, si aún no están.
- Guardar la clave de Render en GitHub Secrets y ejecutar Deploy production, con el enlace de la ejecución y su reporte.
- Decidir si se repite la medición de latencia desde otra red o tras calentar el servicio, dado que no se alcanzó el límite de 500 ms.

[← Volver al índice del Sprint 4](../../README.md)
