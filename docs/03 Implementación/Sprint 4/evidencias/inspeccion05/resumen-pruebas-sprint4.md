# Resumen de pruebas y evidencias del Sprint 4 (Inspección 5)

**Fecha de ejecución** · 20/11/2026, hora de Lima. [Servicio de Render del curso](https://ecologistica-lima-qolz.onrender.com).

El equipo probó el flujo completo de dos pedidos en Render y revisó las tres historias en Jira. Este registro reúne los resultados de la prueba manual, las mediciones y las acciones que quedan por cerrar.

## 1. Registro, asignación y entrega de pedidos

El equipo usó las cuentas de Planificación y Conductor previstas para la prueba.

| Paso | Resultado | Captura |
|---|---|---|
| Registrar dos pedidos de prueba (`Cliente Prueba S4-01`, San Juan de Lurigancho, y `Cliente Prueba S4-02`, El Agustino) | Correcto. La app mostró «Pedido guardado correctamente.» | — |
| Almacén | Ya existía el «Almacén de demostración de Lima Este»; no hizo falta agregar otro | — |
| Planificación → Generar rutas (prioridad «Menos CO₂») | Una ruta con los **dos pedidos asignados al mismo conductor y vehículo**: 12,6 km, 1,92 kg de CO₂ estimado (−36,8 % frente a la ruta sin optimizar), 100 % dentro de ventana, calculada en 2,14 s | [Ver captura](pruebas-app/01-propuesta-dos-pedidos-mismo-conductor.png) |
| Aprobar y guardar rutas | Correcto. Estado «Rutas guardadas» | — |
| Conductor → Mi ruta | Muestra 0/2 entregas y las dos paradas en orden | [Ver captura](pruebas-app/02-conductor-mi-ruta-0-de-2.png) |
| Conductor → abrir la parada 1 | **«Confirmar entrega» aparece deshabilitado** mientras el pedido está Pendiente | [Ver captura](pruebas-app/03-conductor-confirmar-deshabilitado-pendiente.png) |
| Planificación → Pedidos → «Marcar en camino» | Correcto. Mensaje «El conductor ya puede confirmar su entrega.» | [Ver captura](pruebas-app/04-planificacion-pedido-marcado-en-camino.png) |
| Conductor → «Confirmar entrega» y confirmar en el diálogo | Correcto. La app mostró «Entrega confirmada · 09:15 · hora de Lima» y el pedido pasó a Entregado | [Confirmación habilitada](pruebas-app/05-conductor-pedido-en-camino-confirmar-habilitado.png) · [Entrega confirmada](pruebas-app/06-conductor-entrega-confirmada.png) |
| Conductor → volver a Mi ruta | El avance muestra **1/2** y la parada 1 figura «entregado» | [Ver captura](pruebas-app/08-conductor-mi-ruta-1-de-2.png) |
| Planificación → Pedidos | El pedido figura **Entregado**, con la hora de confirmación registrada, y el contador de entregados subió de 2 a 3 | [Ver captura](pruebas-app/07-planificacion-estado-entregado.png) |

### Observaciones y pasos que no salieron como se esperaba

1. **Conductor y vehículo adicionales: creados después de la prueba principal.** En «Registrar conductor» no había cuentas con rol Conductor ni vehículos libres, así que el Administrador creó la cuenta «Conductor Prueba S4» (rol Conductor), Planificación registró el vehículo `TST-401` (gasolina, 500 kg) y luego el conductor con ese vehículo, usando un DNI ficticio. Se comprobó que la cuenta nueva inicia sesión como Conductor. Su contraseña inicial se entregó por canal privado y no se guarda en el repositorio. Con el conductor original ya se había cumplido el requisito de asignar al menos dos pedidos al mismo conductor.
2. **El paso «Marcar en camino» es necesario antes de confirmar.** La consigna no lo menciona. Sin ese paso el botón «Confirmar entrega» queda deshabilitado y la app muestra «Este pedido no requiere confirmación en su estado actual.». Es el comportamiento previsto del sistema, no un fallo. **Flujo correcto para la prueba:** Planificación genera y aprueba la ruta → Planificación marca el pedido «En camino» → el conductor confirma en «Mi ruta» → Planificación verifica el estado «Entregado».
3. **Hojas de estilo de Google Fonts bloqueadas.** La consola del navegador registra, en cada carga, que la política de seguridad de contenido bloquea `fonts.googleapis.com`; la interfaz usaba la tipografía de respaldo. **Corregido en la rama `fix/sprint4/fuentes-locales` (commit `b485bfc`):** Geist y Geist Mono se empaquetan con `@fontsource` y se sirven desde el propio sitio, sin relajar la política ni consultar a terceros. Se verificó en una copia limpia que `index.html` ya no referencia Google Fonts, que la compilación genera los archivos `woff2` y que la prueba de reglas de diseño pasa. El cambio se integró mediante el PR #53 y forma parte de la versión desplegada el 20/11.
4. **Respuesta 401 en `/api/session` antes de iniciar sesión.** Es esperable: la app consulta la sesión sin credenciales al abrir.
5. **Mensaje de error engañoso al repetir una licencia.** Al registrar el conductor con una licencia que ya usaba otro (la restricción de unicidad existe en la base de datos), la app respondió HTTP 409 con «El DNI ingresado ya corresponde a un conductor registrado en el sistema», aunque el DNI era nuevo. La causa está en `PostgresDrivers._write`, que traduce cualquier violación de unicidad a ese mensaje. Se resolvió en la prueba usando otra licencia. **Corregido en la rama `fix/sprint4/duplicados-conductor` (commit `988bb7e`):** el mensaje ahora distingue DNI, licencia, vehículo y cuenta de acceso según la restricción violada, con pruebas nuevas; la suite del backend pasó completa (535 pruebas, 9 omitidas). Los nombres de restricción se dedujeron de `schema.sql` (nombres por defecto de PostgreSQL) y no se comprobaron contra una base real. El cambio se integró mediante el PR #54 y forma parte de la versión desplegada el 20/11.
6. **Contador desactualizado en la pantalla del pedido.** Justo después de confirmar, la pantalla del pedido seguía mostrando 0/2 aunque la entrega ya figuraba confirmada; el contador se actualizó a 1/2 al volver a «Mi ruta». El código de `DriverOrderView` vuelve a pedir la ruta después de confirmar, por lo que el desfase probablemente corresponde a la espera de esa consulta en Render. No se pudo reproducir como defecto permanente y no se cambió código.
7. **Datos de prueba que quedan en Render:** `Cliente Prueba S4-02` (entregado), `Cliente Prueba S4-01` (pendiente, dentro de la ruta guardada), y la cuenta, el conductor y el vehículo `TST-401` de «Conductor Prueba S4». No se comprobó si la app permite eliminarlos; el detalle del pedido entregado indica que ya no se puede modificar.

## 2. Rendimiento de Render

El equipo midió el listado autenticado de pedidos desde Lima con el medidor del repositorio. La prueba mantuvo activa la verificación del certificado y registró el tiempo total de respuesta observado por el cliente. [CSV de la medición](latencia-render.csv) · [Medidor](../../../../../scripts/measure_render_latency.py).

| Consulta | Muestras | Mínimo | Máximo | Muestras bajo 500 ms |
|---|---|---|---|---|
| `/health` (primera consulta) | 1 | 824 ms | 824 ms | 0 de 1 |
| `/health` (seguimiento) | 5 | 561 ms | 671 ms | 0 de 5 |
| `/api/pedidos?limit=12&offset=0` | 5 | 790 ms | 953 ms | 0 de 5 |

El resultado fue válido (HTTP 200 en las 11 muestras y cierre de sesión confirmado), pero **ninguna muestra cumplió el límite de 500 ms**; el script terminó con código 1. Los valores incluyen la latencia de red entre el equipo de prueba y el servidor. En un sondeo previo, la primera consulta de salud tardó alrededor de 22 segundos. El registro es compatible con un arranque en frío y la causa requiere confirmación en Render.

Con el diagnóstico activo, las cinco consultas autenticadas quedaron por debajo de 500 ms. La mediana fue **378,9 ms** y el tiempo en la API estuvo entre **49,0–143,5 ms**. Se conservan las mediciones previas para mostrar la variación. [CSV del diagnóstico](latencia-render-diagnostico.csv).

## 3. Despliegue (Deploy production)

Después de la prueba manual, el equipo guardó la clave en GitHub Secrets y habilitó el flujo. Una ejecución exitosa de Tests en `main` disparó el despliegue. Render activó la versión validada y devolvió HTTP 200 en las cinco comprobaciones de salud de GitHub Actions. [Primer despliegue automático](https://github.com/JosefOreC/ALPHA_PROJECT/actions/runs/44776606164) · [CSV inicial](disponibilidad-despliegue-automatico.csv).

Tras fusionar el PR #52 se desplegó la mejora de Pedidos y las cinco consultas de salud volvieron a devolver HTTP 200. El primer sondeo autenticado posterior registró una mediana de 383,6 ms y cuatro de cinco respuestas dentro del umbral. El segundo registró una mediana de 312,9 ms y tres de cinco respuestas dentro del umbral. [CSV de la segunda serie](latencia-render-cierre.csv). [CSV autenticado de la versión optimizada](latencia-render-optimizada-2.csv). [Despliegue de la versión optimizada](https://github.com/JosefOreC/ALPHA_PROJECT/actions/runs/44779614627) · [CSV de la versión optimizada](disponibilidad-version-optimizada.csv).

## 4. Cierre en Jira

Revisión hecha el 20/11/2026 desde la vista Lista del [proyecto ELODRSPDSC](https://continental-team-wkyyxm85.atlassian.net/jira/software/projects/ELODRSPDSC/summary), con las épicas desplegadas. No hay un sprint activo, por lo que no existe un tablero con esas historias; la Lista muestra las mismas actividades con su estado.

| Clave | Historia | Épica | Estado en Jira |
|---|---|---|---|
| [ELODRSPDSC-17](https://continental-team-wkyyxm85.atlassian.net/browse/ELODRSPDSC-17) | US-003 · Registrar pedido de entrega | EP-02 | Listo |
| [ELODRSPDSC-18](https://continental-team-wkyyxm85.atlassian.net/browse/ELODRSPDSC-18) | US-004 · Confirmar entrega de un pedido | EP-02 | Listo |
| [ELODRSPDSC-22](https://continental-team-wkyyxm85.atlassian.net/browse/ELODRSPDSC-22) | US-005 · Generar rutas optimizadas del día | EP-03 | Listo |

Los tres estados coinciden con el acta de aceptación, que registra las tres historias como aceptadas. [Captura de los tres estados en Jira](jira-lista-estados-17-18-22.png).

Observaciones:

- La Lista anida las historias dentro de su épica; con las épicas plegadas solo se ven las actividades sin épica y puede parecer que faltan tickets.
- Cada historia tiene un comentario con los enlaces a sus commits y pruebas, agregado por el equipo. Los enlaces también figuran en la [matriz de trazabilidad](../../08%20Cierre%20tecnico%20y%20trazabilidad%20V_1_0_0.md#conciliación-de-historias).

## 5. Serie repetida de `/health` y revisión de enlaces externos

### Serie repetida de `/health`

El 20/11/2026 se hicieron 60 consultas a `GET /health` del servicio de Render, una cada 3 s, sin credenciales, desde un equipo en Lima. Archivo: [salud-render-serie-60.csv](salud-render-serie-60.csv).

| Medida | Resultado |
|---|---|
| Respuestas HTTP 200 | 60 de 60 |
| Tiempo total | mínimo 222 ms, mediana 270 ms, percentil 95 de 464 ms, máximo 1 365 ms |
| Consultas por debajo de 500 ms | 58 de 60 |
| Consultas por encima de 1 000 ms | 1 (la segunda, 1 365 ms; la primera tardó 617 ms) |

No se reprodujo el pico de unos 6 s de las pruebas locales ni la demora de unos 22 s de un arranque en frío: el servicio estaba activo. Los valores incluyen la red entre el equipo de prueba y Render, se midieron desde un solo equipo y en una sola franja horaria, y no separan el tiempo de atención de la API. Por eso la serie no explica la causa del pico anterior; solo muestra que no apareció en 60 consultas seguidas.

### Enlaces externos

Se comprobaron las 296 direcciones externas de los documentos con consultas de solo lectura. 272 respondieron correctamente. Las 24 restantes no son enlaces rotos:

- 19 enlaces a commits de GitHub respondieron 503 por el límite de consultas anónimas; con `git` se comprobó que los 19 commits existen.
- 3 enlaces a artefactos de Actions respondieron 404 sin sesión; la API de GitHub confirma que existen y no han expirado.
- 1 página de ajustes de secretos del repositorio responde 404 sin permisos de administrador.
- 1 página de ISO rechaza consultas automáticas (403).

No se confirmó ningún enlace roto. `scripts/check_docs.py` sigue sin consultar enlaces externos; esta revisión se hizo con un script puntual que no forma parte del repositorio.

## 6. Cierre de la verificación

La última serie cumplió el objetivo en cinco de cinco consultas autenticadas. Las series previas registraron demoras intermitentes y permanecen disponibles junto al diagnóstico.

[← Volver al índice del Sprint 4](../../README.md)
