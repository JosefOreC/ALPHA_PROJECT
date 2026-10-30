# Revisión del Sprint — Sprint 2

**Proyecto:** EcoLogística Lima — DistriRápido S.A.C.

**Versión del documento:** V_1_4_0

**Actualización documental:** 29/10/2026. No es fecha de reunión ni de aceptación.

**Estado:** aceptación técnica y formal pendientes. Esta edición inspecciona documentos y código; no ejecuta la aplicación ni suites funcionales.

## Historias de Usuario y criterios de aceptación

Fuente de criterios: [Transformando a ágil, secciones 5–6](../../02%20Planificaci%C3%B3n/01%20Transformando%20a%20%C3%A1gil%20V_1_0_0.md). CA1/CA2 identifican localmente el primer/segundo escenario Gherkin de cada ID. Los escenarios marcados «propuesto» amplían la comprobación y necesitan confirmación; no sustituyen requisitos aprobados.

Se conserva el incremento de flota, pedidos, conductor, mapa, dashboard, reportes y administración descrito por las fuentes. US-009 explicita el filtro por distrito antes agrupado bajo US-008; EN-01 explicita la dependencia del motor bajo US-005. Administración se sigue mediante T-09/EN-02, sin inventar otra historia. US-006–011 adelantan trabajo de PMV-3; US-010/011 y EN-02/05 también aparecen en Sprint 3. Es continuidad por conciliar con Jira, no doble aceptación ni doble cómputo de puntos.

## Demostración y tipos de ruta

- **Gold:** flujo principal completo que aporta el valor de la historia, con las integraciones necesarias.
- **Feliz:** variante válida del flujo principal.
- **Infeliz:** entrada inválida, fallo o rechazo esperado.
- **Borde:** vacío, límite temporal/numérico o concurrencia.

La tabla es el guion reproducible de la demostración pendiente. Un enlace a código o test demuestra su existencia, no que se haya ejecutado ni pasado. Las capturas acreditan únicamente el estado visual registrado.

| Historia | Criterio | Tipo de ruta | Escenario y precondiciones | Resultado esperado | Resultado observado | Evidencia | Decisión de aceptación |
|---|---|---|---|---|---|---|---|
| US-001 — Registrar vehículo | CA1 registro válido | Gold | Administrador autenticado; placa nueva, capacidad positiva y combustible admitido; registrar y volver a consultar. | Vehículo activo persistido, placa y capacidad coinciden y se confirma el alta. | Pendiente de ejecución/evidencia | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/test_vehicle_api.py) | Pendiente |
| US-001 — Registrar vehículo | CA1 registro válido | Feliz | Operador autorizado registra otra placa válida con combustible distinto del primer caso. | Registro asociado a la flota y visible en listado; comprobar permisos según D-10. | Pendiente de ejecución/evidencia | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/test_vehicle_api.py) | Pendiente |
| US-001 — Registrar vehículo | CA2 placa duplicada | Infeliz | La placa ya existe; enviar un segundo registro con esa misma placa. | Rechazo con «La placa ingresada ya se encuentra registrada en el sistema»; no duplicar. | Pendiente de ejecución/evidencia | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/test_vehicle_api.py) | Pendiente |
| US-001 — Registrar vehículo | CA1; borde propuesto | Borde | Enviar capacidad cero y después la menor capacidad positiva admitida por el contrato. | Cero rechazado y mínimo válido admitido; confirmar el mínimo con el equipo antes de aceptar. | Pendiente de ejecución/evidencia | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/test_vehicle_api.py) | Pendiente |
| US-002 — Consultar vehículos disponibles | CA1 listado actualizado | Gold | Operador autenticado; hay vehículos activos e inactivos; consultar disponibilidad del día. | Listado actualizado con estado y disponibilidad; consultar no modifica registros. | Pendiente de ejecución/evidencia | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/test_vehicle_use_cases.py) | Pendiente |
| US-002 — Consultar vehículos disponibles | CA1 listado actualizado | Feliz | Cambiar un vehículo a disponible desde la gestión autorizada y volver a consultar. | La consulta refleja el nuevo estado sin datos de otra sesión. | Pendiente de ejecución/evidencia | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/test_vehicle_use_cases.py) | Pendiente |
| US-002 — Consultar vehículos disponibles | CA1; fallo propuesto | Infeliz | Base de datos inaccesible al consultar la flota. | Error explícito; no presentar una flota inventada como resultado. | Pendiente de ejecución/evidencia | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/test_vehicle_use_cases.py) | Pendiente |
| US-002 — Consultar vehículos disponibles | CA2 sin activos | Borde | Todos los vehículos están inactivos o no existen vehículos. | Lista vacía y «No hay vehículos activos registrados». | Pendiente de ejecución/evidencia | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/test_vehicle_use_cases.py) | Pendiente |
| US-003 — Registrar pedido | CA1 alta disponible para ruteo | Gold | Operador autenticado; dirección en Ate, ventana válida y peso positivo; registrar pedido. | ID único y pedido disponible para ruteo, conservando dirección, peso y ventana. | Pendiente de ejecución/evidencia | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/test_manage_orders.py); [captura histórica de registro](../evidencias-crud-pedidos/registro.png), solo evidencia visual | Pendiente |
| US-003 — Registrar pedido | CA1 alta disponible para ruteo | Feliz | Registrar un segundo pedido válido en Santa Anita con otra ventana horaria. | ID diferente; ambos pedidos disponibles, sin sobrescritura. | Pendiente de ejecución/evidencia | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/test_manage_orders.py) | Pendiente |
| US-003 — Registrar pedido | CA2 fuera de cobertura | Infeliz | Usar una dirección fuera del área operativa configurada. | Rechazo con «La dirección indicada está fuera del área de cobertura operativa». | Pendiente de ejecución/evidencia | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/test_manage_orders.py) | Pendiente |
| US-003 — Registrar pedido | CA1; borde propuesto | Borde | Enviar ventana con fin igual al inicio y repetir con fin posterior mínimo admitido. | Confirmar regla de igualdad y precisión; rechazar ventana no válida sin crear un pedido incompleto. | Pendiente de ejecución/evidencia | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/test_manage_orders.py) | Pendiente |
| US-004 — Confirmar entrega | CA1 confirmación exitosa | Gold | Conductor autenticado y vinculado al pedido EN_CAMINO de su ruta; confirmar entrega. | Estado ENTREGADO y primera hora de confirmación registrada. | Pendiente de ejecución/evidencia | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/test_confirm_delivery.py) | Pendiente |
| US-004 — Confirmar entrega | CA1 confirmación exitosa | Feliz | Confirmar otra parada propia EN_CAMINO y volver a consultar la lista de la ruta. | Avance actualizado y hora de cada entrega conservada. | Pendiente de ejecución/evidencia | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/test_confirm_delivery.py) | Pendiente |
| US-004 — Confirmar entrega | CA2 pedido ya entregado; D-04 | Infeliz | Confirmar de nuevo un pedido ENTREGADO. | El Gherkin exige rechazo y «Este pedido ya fue registrado como entregado»; el contrato idempotente descrito en D-04 requiere conciliación, sin cambiar aquí el criterio. | Pendiente de ejecución/evidencia | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/test_confirm_delivery.py) | Pendiente |
| US-004 — Confirmar entrega | CA1/CA2; borde propuesto | Borde | Dos confirmaciones concurrentes del mismo pedido propio EN_CAMINO. | Una sola transición y primera hora estable; respuesta al duplicado por acordar en D-04. | Pendiente de ejecución/evidencia | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/test_confirm_delivery.py) | Pendiente |
| US-005 — Generar rutas del día | CA1 rutas optimizadas | Gold | Operador, pedidos pendientes y vehículos disponibles; generar para el día con ventanas y capacidades. | Rutas factibles optimizadas, no solo propuesta estimada; hasta 150 pedidos y 15 vehículos en máximo 45 s. | Pendiente de ejecución/evidencia | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/test_planning.py) | Pendiente |
| US-005 — Generar rutas del día | CA1 rutas optimizadas | Feliz | Dos vehículos disponibles con pedidos factibles repartidos en dos distritos. | Asignación respeta capacidad y ventanas sin duplicar pedidos. | Pendiente de ejecución/evidencia | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/test_planning.py) | Pendiente |
| US-005 — Generar rutas del día | CA2 sin vehículos | Infeliz | Pedidos pendientes pero cero vehículos disponibles. | No ejecutar algoritmo; «No hay vehículos disponibles para generar rutas en este momento». | Pendiente de ejecución/evidencia | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/test_planning.py) | Pendiente |
| US-005 — Generar rutas del día | CA1 límite 150/15 | Borde | Dataset reproducible de exactamente 150 pedidos y 15 vehículos; medir varias corridas. | Solución válida dentro de 45 s; EN-01 exige además P95 y método de benchmark registrado. | Pendiente de ejecución/evidencia | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/test_planning.py) | Pendiente |
| US-006 — Visualizar rutas activas | CA1 mapa del día | Gold | Operador; API con rutas del día y posiciones identificadas; cargar mapa. | Todas las rutas activas, estados de pedidos y posición de cada vehículo; distinguir sintético de operativo. | Pendiente de ejecución/evidencia | [Referencia de código; caso por verificar, no ejecución](../../../src/frontend/src/interfaces/map/RouteMap.tsx); [captura histórica del mapa](../evidencias-mapa-visual/estilo-mapa.png), solo evidencia visual | Pendiente |
| US-006 — Visualizar rutas activas | CA1; filtro implementado | Feliz | Aplicar filtro de pedido y luego limpiarlo con rutas cargadas. | Lista, contadores y mapa sincronizados; al limpiar se restituye el conjunto. | Pendiente de ejecución/evidencia | [Referencia de código; caso por verificar, no ejecución](../../../src/frontend/src/interfaces/map/RouteMap.tsx) | Pendiente |
| US-006 — Visualizar rutas activas | CA2 sin cartografía | Infeliz | Fuente cartográfica no disponible con API de pedidos accesible. | Aviso de indisponibilidad y alternativa en lista. | Pendiente de ejecución/evidencia | [Referencia de código; caso por verificar, no ejecución](../../../src/frontend/src/interfaces/map/RouteMap.tsx) | Pendiente |
| US-006 — Visualizar rutas activas | CA1; borde propuesto | Borde | Día sin rutas, con un pedido pendiente sin asignación. | No inventar rutas; mantener consultable el pendiente y su estado. | Pendiente de ejecución/evidencia | [Referencia de código; caso por verificar, no ejecución](../../../src/frontend/src/interfaces/map/RouteMap.tsx) | Pendiente |
| US-007 — Detalle de vehículo | CA1 detalle y ETA | Gold | Operador selecciona un vehículo con ruta y fuente de ETA identificada. | Panel muestra ruta, pedidos pendientes y ETA a siguiente parada; origen y antigüedad declarados. | Pendiente de ejecución/evidencia | [Referencia de código; caso por verificar, no ejecución](../../../src/frontend/src/interfaces/map/RouteMap.tsx) | Pendiente |
| US-007 — Detalle de vehículo | CA1 detalle y ETA | Feliz | Cambiar selección entre dos camiones con rutas distintas. | Detalle corresponde al seleccionado, sin datos residuales del anterior. | Pendiente de ejecución/evidencia | [Referencia de código; caso por verificar, no ejecución](../../../src/frontend/src/interfaces/map/RouteMap.tsx) | Pendiente |
| US-007 — Detalle de vehículo | CA1; fallo propuesto | Infeliz | Vehículo con ruta pero fuente de ETA inaccesible. | Indicar ETA no disponible; no presentar una estimación sintética como telemetría real. | Pendiente de ejecución/evidencia | [Referencia de código; caso por verificar, no ejecución](../../../src/frontend/src/interfaces/map/RouteMap.tsx) | Pendiente |
| US-007 — Detalle de vehículo | CA2 sin ruta | Borde | Seleccionar un vehículo sin ruta asignada para hoy. | «Este vehículo no tiene rutas asignadas para hoy». | Pendiente de ejecución/evidencia | [Referencia de código; caso por verificar, no ejecución](../../../src/frontend/src/interfaces/map/RouteMap.tsx) | Pendiente |
| US-008 — Dashboard operativo | CA1 datos del día | Gold | Administrador u Operador según Gherkin, con operación del día; abrir dashboard. | Entregados/pendientes, cumplimiento de ventanas, km y CO₂ del mismo periodo; conciliar roles con D-10. | Pendiente de ejecución/evidencia | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/interfaces/test_dashboard_api.py) | Pendiente |
| US-008 — Dashboard operativo | CA1 datos del día | Feliz | Confirmar entrega y refrescar indicadores del mismo día. | Conteos actualizados y consistentes con pedidos; no sumar entregas de otro día. | Pendiente de ejecución/evidencia | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/interfaces/test_dashboard_api.py) | Pendiente |
| US-008 — Dashboard operativo | CA1; fallo propuesto | Infeliz | API de indicadores devuelve error de conexión. | Error visible; no reemplazar métricas por ejemplos o ceros que simulen éxito. | Pendiente de ejecución/evidencia | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/interfaces/test_dashboard_api.py) | Pendiente |
| US-008 — Dashboard operativo | CA2 sin rutas | Borde | No existen datos operativos del día. | Valores cero y «No se han generado rutas para la jornada actual». | Pendiente de ejecución/evidencia | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/interfaces/test_dashboard_api.py) | Pendiente |
| US-009 — Filtrar dashboard por distrito | CA1 filtro con datos | Gold | Operador; pedidos en Ate y Santa Anita; seleccionar Ate. | Todos los indicadores corresponden exclusivamente a Ate; revisar permisos D-10. | Pendiente de ejecución/evidencia | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/interfaces/test_dashboard_api.py) | Pendiente |
| US-009 — Filtrar dashboard por distrito | CA1 filtro con datos | Feliz | Cambiar de Ate a Santa Anita. | Se recalculan todos los indicadores para Santa Anita, sin mantener totales de Ate. | Pendiente de ejecución/evidencia | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/interfaces/test_dashboard_api.py) | Pendiente |
| US-009 — Filtrar dashboard por distrito | CA1; fallo propuesto | Infeliz | Enviar distrito inexistente por solicitud directa. | Error explícito del filtro; no mostrar totales globales como datos del distrito. | Pendiente de ejecución/evidencia | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/interfaces/test_dashboard_api.py) | Pendiente |
| US-009 — Filtrar dashboard por distrito | CA2 zona sin operación | Borde | Seleccionar distrito válido sin pedidos del día. | Panel en cero para esa zona, sin error. | Pendiente de ejecución/evidencia | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/interfaces/test_dashboard_api.py) | Pendiente |
| US-010 — Reporte de sostenibilidad | CA1 reporte y rendimiento | Gold | Administrador según Gherkin; rango con operación y factores de emisión identificados; generar reporte. | CO₂, combustible, km y entregas del periodo; P95 ≤ 1,5 s medido; conciliar rol de Logística en D-10. | Pendiente de ejecución/evidencia | [Referencia de código; caso por verificar, no ejecución](../../../src/backend/interfaces/api/portal/router.py) | Pendiente |
| US-010 — Reporte de sostenibilidad | CA1 reporte y rendimiento | Feliz | Elegir semana y luego mes con datos conocidos. | Agregados coinciden con los registros del intervalo seleccionado y sus unidades. | Pendiente de ejecución/evidencia | [Referencia de código; caso por verificar, no ejecución](../../../src/backend/interfaces/api/portal/router.py) | Pendiente |
| US-010 — Reporte de sostenibilidad | CA2 periodo sin registros | Infeliz | Seleccionar rango sin datos operativos. | No generar archivo vacío; «No se encontraron registros operativos para el período seleccionado». | Pendiente de ejecución/evidencia | [Referencia de código; caso por verificar, no ejecución](../../../src/backend/interfaces/api/portal/router.py) | Pendiente |
| US-010 — Reporte de sostenibilidad | CA1; borde propuesto | Borde | Pedidos justo al inicio y fin del rango, en zona America/Lima. | Inclusión de límites documentada y coherente entre API, vista y exportación. | Pendiente de ejecución/evidencia | [Referencia de código; caso por verificar, no ejecución](../../../src/backend/interfaces/api/portal/router.py) | Pendiente |
| US-011 — Exportar CSV | CA1 descarga CSV | Gold | Administrador según Gherkin; reporte generado con datos; descargar CSV. | CSV estructurado con encabezados en español y datos del periodo; permisos por conciliar en D-10. | Pendiente de ejecución/evidencia | [Referencia de código; caso por verificar, no ejecución](../../../src/backend/interfaces/api/portal/router.py) | Pendiente |
| US-011 — Exportar CSV | CA1 descarga CSV | Feliz | Descargar reporte filtrado por otro periodo con tildes en los datos. | Se conservan codificación, encabezados y totales del reporte visible. | Pendiente de ejecución/evidencia | [Referencia de código; caso por verificar, no ejecución](../../../src/backend/interfaces/api/portal/router.py) | Pendiente |
| US-011 — Exportar CSV | CA2 formato no soportado | Infeliz | Solicitar exportación en un formato no admitido. | «Formato de exportación no disponible» y sugerencia de formatos válidos. | Pendiente de ejecución/evidencia | [Referencia de código; caso por verificar, no ejecución](../../../src/backend/interfaces/api/portal/router.py) | Pendiente |
| US-011 — Exportar CSV | CA1; borde propuesto | Borde | Registro con coma, comillas y salto de línea en un campo exportable. | Escapado CSV válido, sin desplazar columnas ni perder registros. | Pendiente de ejecución/evidencia | [Referencia de código; caso por verificar, no ejecución](../../../src/backend/interfaces/api/portal/router.py) | Pendiente |
| EN-00 — Esquema PostgreSQL | CA1 esquema desplegado | Gold | Base exclusiva de desarrollo con PostGIS; modelo revisado; ejecutar inicialización y migración. | Tablas Usuario, Conductor, Vehículo, Pedido, Ruta, Tramo, Zona_Restringida, Reporte e Incidencia relacionadas. | Pendiente de ejecución/evidencia | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/test_postgres_views.py) | Pendiente |
| EN-00 — Esquema PostgreSQL | CA1; repetición propuesta | Feliz | Reaplicar migración soportada sobre esquema compatible. | No perder datos ni duplicar objetos; registrar comandos y versión de migración. | Pendiente de ejecución/evidencia | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/test_postgres_views.py) | Pendiente |
| EN-00 — Esquema PostgreSQL | CA2 migración incompatible | Infeliz | Ambiente aislado con migración previa incompatible. | Reversión automática y log detallado del conflicto, según criterio original. | Pendiente de ejecución/evidencia | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/test_postgres_views.py) | Pendiente |
| EN-00 — Esquema PostgreSQL | CA1/CA2; borde propuesto | Borde | Interrumpir una migración dentro de la transacción en una base desechable. | No dejar esquema parcialmente aplicado; verificar recuperación antes de validar despliegue. | Pendiente de ejecución/evidencia | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/test_postgres_views.py) | Pendiente |
| EN-01 — Motor VRPTW / Green VRP | CA1 rendimiento | Gold | Dataset factible de 150 pedidos y 15 vehículos; motor real, múltiples corridas. | P95 ≤ 45 s y solución válida. | Pendiente de ejecución/evidencia | [Referencia de código; caso por verificar, no ejecución](../../../src/backend/application/use_cases/generate_routes.py) (archivo vacío; motor pendiente) | Pendiente |
| EN-01 — Motor VRPTW / Green VRP | CA2 menor emisión | Feliz | Dos soluciones factibles con ventanas cumplidas y emisiones distintas. | Priorizar la de menor CO₂ estimado como objetivo secundario. | Pendiente de ejecución/evidencia | [Referencia de código; caso por verificar, no ejecución](../../../src/backend/application/use_cases/generate_routes.py) (archivo vacío; motor pendiente) | Pendiente |
| EN-01 — Motor VRPTW / Green VRP | CA1; caso propuesto | Infeliz | Un pedido excede toda capacidad disponible. | Reportar infactibilidad sin declarar una solución válida; política por confirmar. | Pendiente de ejecución/evidencia | [Referencia de código; caso por verificar, no ejecución](../../../src/backend/application/use_cases/generate_routes.py) (archivo vacío; motor pendiente) | Pendiente |
| EN-01 — Motor VRPTW / Green VRP | CA2; borde propuesto | Borde | Soluciones con igual factibilidad y emisiones iguales. | Desempate reproducible acordado; no afirmar ahorro inexistente. | Pendiente de ejecución/evidencia | [Referencia de código; caso por verificar, no ejecución](../../../src/backend/application/use_cases/generate_routes.py) (archivo vacío; motor pendiente) | Pendiente |
| EN-02 — Seguridad e identidad | CA2 minimización de datos | Gold | Registrar conductor o destinatario mediante sesión autorizada; inspeccionar campos persistidos. | Solo datos necesarios para la operación; documentar justificación y revisión de privacidad. | Pendiente de ejecución/evidencia | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/test_sessions.py) | Pendiente |
| EN-02 — Seguridad e identidad | Soporte de CA1/CA2: sesión | Feliz | Cuenta activa inicia sesión, realiza mutación con CSRF válido y cierra sesión. | Identidad verificada; sesión revocada tras salir. Esto por sí solo no acredita EN-02. | Pendiente de ejecución/evidencia | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/test_sessions.py) | Pendiente |
| EN-02 — Seguridad e identidad | CA1 inyección SQL | Infeliz | En entorno aislado autorizado, enviar intento de inyección al endpoint de autenticación. | Bloqueo, log de auditoría y notificación al equipo de seguridad según criterio; consultas parametrizadas no prueban todo el flujo. | Pendiente de ejecución/evidencia | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/test_sessions.py) | Pendiente |
| EN-02 — Seguridad e identidad | Soporte: expiración/límite | Borde | Sesión al límite de 8 h; también probar intento 10 y 11 dentro de 15 min. | Expiración y limitación coherentes con código; documentar reloj y conteos sin exponer credenciales. | Pendiente de ejecución/evidencia | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/test_sessions.py) | Pendiente |
| EN-05 — Conductor y accesibilidad | CA1 primer uso | Gold | Conductor sin capacitación previa en móvil; ejecutar confirmación completa. | Completa sin errores; evidencia de criterios WCAG 2.1 AA aplicables, no solo ancho de pantalla. | Pendiente de ejecución/evidencia | [Tests UI relacionados; caso por verificar, no ejecutados](../../../src/frontend/tests/ui/driver.spec.ts) | Pendiente |
| EN-05 — Conductor y accesibilidad | CA1; modalidad propuesta | Feliz | Recorrer confirmación mediante teclado y lector de pantalla. | Foco, etiquetas, errores y confirmación accesibles según evaluación documentada. | Pendiente de ejecución/evidencia | [Tests UI relacionados; caso por verificar, no ejecutados](../../../src/frontend/tests/ui/driver.spec.ts) | Pendiente |
| EN-05 — Conductor y accesibilidad | CA2 conexión intermitente | Infeliz | Cortar conexión 4G durante confirmación y restablecerla. | Reintento automático y estado de sincronización visible. | Pendiente de ejecución/evidencia | [Tests UI relacionados; caso por verificar, no ejecutados](../../../src/frontend/tests/ui/driver.spec.ts) | Pendiente |
| EN-05 — Conductor y accesibilidad | CA2; borde propuesto | Borde | Servidor confirma pero se pierde respuesta y el cliente reintenta. | No duplicar entrega ni cambiar primera hora; resolver conflicto D-04 antes de aceptación. | Pendiente de ejecución/evidencia | [Tests UI relacionados; caso por verificar, no ejecutados](../../../src/frontend/tests/ui/driver.spec.ts) | Pendiente |

## Evidencia histórica y límites

- Revisión anterior y registro atribuido a su autor (ver el anexo de este documento): se conserva íntegra, incluidas cifras, referencias y decisiones. Ningún resultado se ratifica por esta edición.

Los resultados agregados de 09/10 y 29/10 atribuidos en las fuentes no incluyen aquí una ejecución por escenario sobre el árbol actual; no se trasladan a la columna «Resultado observado». Para pedidos y mapa hay capturas locales en las [guías técnicas](../Gu%C3%ADas%20t%C3%A9cnicas/README.md); no acreditan rendimiento, seguridad, GPS ni aceptación.

## Evidencia técnica sobre `main` (29/10/2026, commit `30969da`)

Frontend: 273 pruebas Vitest, 9 de Node y 40 de navegador aprobadas; lint, tipos y compilación sin errores. Backend: 225 pruebas aprobadas, 5 omitidas (integración con PostgreSQL real, no ejecutada) y 36 subpruebas. Estas cifras son agregadas: no sustituyen la ejecución por escenario de la matriz anterior ni la aceptación formal.

## Pendientes y comprobación técnica

- Ejecutar cada escenario sobre un commit/árbol identificado y registrar entorno, precondiciones, comandos, resultado y artefacto. Confirmar los escenarios propuestos.
- Resolver D-04 (rechazo de repetición frente a idempotencia) y D-10 (roles del Gherkin frente a matriz RBAC) en [decisiones](../../../development/decisiones.md); no adaptar criterios silenciosamente al código.
- La DoD global exige cobertura ≥80 %, análisis estático, revisión por un par, staging independiente, documentación API y criterios comprobados. Todo queda pendiente de evidencia por historia, sin inferir cumplimiento de la existencia de tests.
- Validar migraciones/recuperación y seguridad; motor VRPTW, despacho, fuentes GPS/ETA y factores ambientales siguen pendientes según [impedimentos](02%20Registro%20de%20Impedimentos%20V_1_5_0.md).

## Registro de la reunión y aceptación formal

| Campo | Registro |
|---|---|
| Fecha y hora | Fecha por confirmar |
| Asistentes / stakeholders | Por confirmar con evidencia |
| Decisión por historia | Pendiente; registrar aceptada, parcial o retorno al backlog con criterio y evidencia |
| Acuerdos y responsables | Pendientes de acta o registro atribuido |
| Velocidad | No calculada; no contar historias sin aceptación |

## Anexo — Edición anterior V_1_2_0 (conservada como antecedente)

Texto de la edición anterior; se conserva su contenido y sus cifras con la fecha de esa edición. Solo se ajustaron enlaces y niveles de encabezado. El estado vigente es el de las secciones anteriores de este documento.

> **HISTÓRICO — no vigente.** Contenido previo conservado; solo se ajustan navegación y enlaces. Las cifras, fechas, responsables y cierres son registros atribuidos al autor indicado; no se reejecutaron ni se ratificaron en esta revisión documental. Vigente: [03 Revisión del Sprint V_1_3_0](03%20Revisi%C3%B3n%20del%20Sprint%20V_1_4_0.md).

### Revisión del Sprint — Sprint 2

**Nombre del Proyecto:** EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Líder del Proyecto:** Ore Campos, Josef Pablo

**Sprint:** Sprint 2 — interfaces por rol con el sistema de diseño, mapa visual, autorización por roles, inicio de sesión, persistencia y preparación de datos de prueba.

**Fecha de elaboración:** 09/10/2026; actualizado el 29/10/2026

**Versión del documento:** V_1_2_0

**Estado:** documento preparado para la reunión de revisión. **La aceptación del sprint está pendiente:** las fechas efectivas de inicio y cierre, los asistentes, la decisión por historia y los acuerdos se registran en la reunión.

> **Actualización V_1_2_0 (29/10/2026).** La versión V_1_1_0 describía la autenticación, la persistencia en PostgreSQL y la API única como pendientes, y las ramas de Josef como «sin integrar». El 09/10, después de redactarla, esas ramas entraron a `main` (commits `c314f64`, `a07136a`, `68d2b60`, `c981e8a` y `97b401b`, sin Pull Request). Esta versión corrige esas afirmaciones contrastándolas con `main` (commit `30969da`). Lo que sigue pendiente se mantiene.

> **Documento único de revisión del Sprint 2.** Reúne la revisión de la serie de interfaz por rol (Tovar Sánchez, Carlos Alberto) y la del mapa visual, la autorización por roles, el inicio de sesión y la base de pruebas (Ore Campos, Josef Pablo). La revisión suelta de Josef (`05 Revisión del Sprint V_2_0_0.md`, 09/10/2026) se retiró de la carpeta el 29/10/2026 porque este documento incorpora su contenido; sigue disponible en el historial de Git.

**Referencias del repositorio evaluado:**

- `main`, commit `30969da` (29/10/2026): incluye la serie de interfaz, el mapa, la autenticación y la persistencia.
- Serie de interfaz por rol: commits de la rama `feature/carlos/spr2/m_pedidos/confirmacion` hasta `1bf3ee8` (Pull Requests #12 a #21, **abiertos**; su código ya está en `main`).
- Mapa visual, autorización, inicio de sesión y base de pruebas: commits `c314f64`, `a07136a`, `c981e8a` y `97b401b` de Josef, integrados a `main` el 09/10 sin Pull Request.
- Arquitectura del backend: commits `960e63c` y `51b2223` en `main`.

#### Historias de Usuario completadas en este Sprint

En este Sprint 2 se completaron tareas técnicas de interfaz, presentación del mapa, control de permisos, inicio de sesión, persistencia y generación de datos de prueba. **Ninguna historia se da por cerrada:** una pantalla o un generador de datos no acredita por sí solo el criterio de aceptación, y el flujo íntegro pedido → generación de ruta → despacho → entrega del objetivo de PMV-2 todavía requiere el optimizador, el despacho y la validación de despliegue.

| Historia / tarea | Trabajo realizado | Estado para la revisión (29/10/2026) |
|---|---|---|
| **US-003** Pedidos y rutas | Pantalla del Planificador con resumen, buscador, pestañas con conteo, lista agrupada por estado, detalle, registro, edición y cancelación (se conserva la regla: solo se modifican pedidos pendientes y sin conductor). | Implementado sobre la API y PostgreSQL; asignación a ruta y aceptación pendientes. *(V_1_1_0: «implementado en demo».)* |
| **US-001 / US-002** Flota | Pantalla con resumen, lista por estado, etiquetas de bajas emisiones y diálogo de registro y edición con validación visible. | Implementado sobre la API y PostgreSQL; aceptación pendiente. *(V_1_1_0: «datos en memoria».)* |
| **US-005** Generar rutas | Configuración de prioridad, ventanas y bajas emisiones; avance por pasos; resultado con rutas, km, CO₂ y cumplimiento de ventanas; mensaje «No hay vehículos disponibles para generar rutas en este momento» y límite de cálculo tomado de los parámetros del algoritmo. | Interfaz, caso de uso y propuesta estimada con datos de la base listos; **motor de optimización VRPTW pendiente**. Una propuesta calculada no se guarda como ruta aprobada ni avisa a los conductores. |
| **US-004 / EN-05** Conductor | «Mi ruta» (paradas, avance, aviso de reoptimización) y «Pedido actual» con hoja de confirmación; objetivos táctiles de 48 px comprobados en navegador. | Implementado sobre la API (`/conductor/ruta`, confirmación e incidencias con permisos por recurso); accesibilidad sin certificar. *(V_1_1_0: «Incidencias y ruta real pendientes».)* |
| **US-006 / RF-004** Visualizar rutas activas | Mapa Leaflet y OpenStreetMap con capas, pines por estado, selección sincronizada con la lista y alternativa con lista si no cargan los datos o las teselas. Amplía el mapa de Lima con navegación restringida (margen de 10 km), capas configurables y filtros por estado del pedido, pedido específico y búsqueda por cliente, número o placa. | Lectura persistente y filtros implementados; actualización en tiempo real y aceptación pendientes. |
| **US-007 / RF-004** Detalle vehicular en el mapa | Camiones independientes, selección y cuadros de detalle de pedidos, rutas y vehículos, con cierre mediante el mouse. | Interacción implementada; las posiciones de la base de pruebas son simuladas; GPS y ETA reales pendientes. |
| **US-008** Dashboard | Pedidos y CO₂ lado a lado, mapa de solo lectura, lista de pedidos en riesgo y filtro por distrito; se conservan la actualización cada 60 s y la prueba de arquitectura hexagonal. | Implementado sobre la API; factores de emisión y línea base sin validar con datos operativos. *(V_1_1_0: «CO₂ evitado y pedidos en riesgo son de ejemplo».)* |
| **US-010 / US-011** Sostenibilidad | Reporte por semana, mes o trimestre con gráfico, tablas por distrito y vehículo y exportación de un CSV con los datos del periodo mostrado. | Implementado sobre `/reports/sustainability`; rendimiento (P95 1,5 s), factores y fuente operativa pendientes. *(V_1_1_0: «cálculo y fuente real pendientes».)* |
| **Administración** | Pestañas de usuarios y roles, parámetros del algoritmo (peso CO₂/tiempo, tiempo máximo, carga máxima, holgura de ventana, reoptimización automática y factores de emisión), integraciones y auditoría. Los parámetros se guardan por el puerto `AlgorithmSettings` con validación previa. | Alta de usuarios (sin registro público), parámetros y auditoría conectados a la API; sin valores inventados para GNV ni eléctrico; las integraciones externas siguen pendientes. |
| **EN-02 / T-01 / T-09** Inicio de sesión y autorización | Cuenta activa en PostgreSQL con hash de contraseña, cookie de sesión, expiración, revocación, CSRF y límite de intentos; matriz compartida ROL-01 a ROL-05 entre frontend y backend, acceso por URL y comprobación de recursos propios del conductor. | Login y autorización integrados en `main`; faltan cabeceras de seguridad, auditoría anonimizada, bloqueo de inyección SQL, Ley N.° 29733 y la revisión de seguridad. *(V_1_1_0: «autenticación productiva pendiente».)* |
| **EN-00 / T-02** Persistencia y datos de prueba | Adaptadores PostgreSQL, esquema vacío, migración de sesiones, alta inicial del administrador y generador con `.env.test` (siete días: 1.050 pedidos, 70 rutas, 15 vehículos y 15 conductores). | API conectada al esquema local; validación de migraciones en despliegue y recuperación pendientes. *(V_1_1_0: «la API aún no usa los adaptadores SQL».)* |

El trabajo de mapa adelanta la preparación visual de PMV-3 dentro del incremento actual. No se declara completada US-005 ni el flujo íntegro de PMV-2: el optimizador y el despacho todavía requieren desarrollo.

#### Demostración del trabajo completado

La demostración del Sprint 2 muestra los artefactos y comportamientos realmente disponibles. Reproducirla exige PostgreSQL local con PostGIS, `.env` con `DATABASE_URL`, `scripts/migrate.py`, la base de pruebas (`scripts/create_test_db.py --env-file .env.test`) y el primer administrador (`scripts/create_admin.py`); los detalles están en la guía de inicio de sesión y persistencia.

**Recorrido por rol (con sesión iniciada):**

1. **Acceso:** ingresar con una cuenta activa, cerrar sesión y comprobar la revocación. No hay selector de perfiles ni registro público; el administrador crea las demás cuentas.
2. **Pedidos y rutas (Planificador):** buscar por placa o distrito, filtrar por estado, elegir un pedido y ver su ruta en el mapa; registrar, editar y cancelar un pedido pendiente.
3. **Flota:** registrar un vehículo con un valor inválido para ver la validación, corregirlo y ver los conteos por estado.
4. **Generar rutas:** configurar la prioridad, generar la propuesta estimada y comprobar el caso «sin vehículos disponibles». Explicar que el motor de optimización aún no existe y que la propuesta no se publica.
5. **Conductor (móvil, 390 px):** recorrer «Mi ruta», abrir la parada actual, confirmar la entrega y ver que el avance se actualiza.
6. **Mapa:** combinar capas, filtrar por **Pendientes** o **En camino**, seleccionar un pedido o buscar por cliente, número o placa, y limpiar los filtros.
7. **Dashboard y sostenibilidad (Responsable de Logística):** elegir un pedido en riesgo y verlo en el mapa; cambiar de periodo y exportar el CSV.
8. **Administración:** crear una cuenta, cambiar un parámetro, ver un error de validación, guardar y comprobar que «Generar rutas» usa el nuevo tiempo máximo.
9. **Permisos:** probar administrador, planificador, conductor, logística y auditor; el servidor rechaza accesos insuficientes y recursos ajenos aunque se entre por URL.
10. **Datos:** indicar que los pedidos, las rutas y las posiciones de la base de pruebas son sintéticos y que no acreditan una operación real ni GPS.

| Evidencia registrada | Resultado | Alcance de la comprobación |
|---|---|---|
| **`main`, commit `30969da` (29/10/2026) — frontend** | 273 pruebas de Vitest, 9 de Node y 40 de navegador aprobadas; lint, tipos y compilación sin errores. | Interfaz por rol, login, permisos, mapa y filtros, CSV (incluida una descarga real), objetivos táctiles de 48 px y ausencia de desbordamiento a 390 px. No acredita certificación de accesibilidad ni rendimiento. |
| **`main`, commit `30969da` (29/10/2026) — backend** | 225 pruebas aprobadas, 5 omitidas y 36 subpruebas. | Dominio, casos de uso, API, sesiones, permisos y vistas. Las 5 omitidas son las de integración con un PostgreSQL real, que no se ejecutó. Requiere instalar `requirements-postgres.txt`. |
| Frontend sobre `1bf3ee8` (09/10/2026, serie de interfaz) | 247 pruebas de Vitest, 9 de Node y 22 de navegador aprobadas. | Medición anterior sobre la rama de Carlos, sin el trabajo de Josef; se conserva como antecedente. |
| Backend sobre `1bf3ee8` (09/10/2026) | 169 pruebas y 36 subpruebas aprobadas, con almacenamiento en memoria. | Medición anterior; se conserva como antecedente. |
| Frontend y backend de Josef (reportado por él el 09/10/2026) | 273 pruebas de Vitest y 9 de Node, 37 casos de navegador tras el login, y 226 pruebas con 36 subpruebas (4 omitidas) en el backend; dos comprobaciones reales de la base de pruebas. | Documentadas por Josef en su revisión del 09/10/2026 (retirada; ver la nota inicial); incluyen PostgreSQL real, que no se repitió el 29/10. |

Estos resultados no equivalen a la aprobación de los interesados.

#### Entorno y datos verificados (reportado por Josef el 09/10/2026)

Se preparó PostgreSQL local con PostGIS. El generador se ejecutó para la base de pruebas `ecologistica_seed_test` mediante `.env.test`; después se configuró la API en `.env` para consultar esa misma base y se aplicó la migración `001_sessions.sql`. El conjunto de siete días contiene **1.050 pedidos, 70 rutas, 15 vehículos y 15 conductores**, con 20 cuentas del generador (21 usuarios con el administrador local).

Las comprobaciones del mapa del día leyeron **150 pedidos** desde la API: el filtro **En camino** mostró 24 pedidos y 4 rutas, un pedido asignado dejó visibles un pedido, una ruta y un camión, y limpiar los filtros restauró los 150 pedidos. Estos resultados demuestran persistencia y consulta con datos de pruebas, no entregas de una operación real: geometrías, posiciones, factores ambientales y restricciones son sintéticos. Los comandos de arranque (`scripts/migrate.py`, `check_database.py`, `create_admin.py`, `run_backend.py`) están en la guía de inicio de sesión y persistencia de `development/`.

#### Pendientes

- Revisar y cerrar o fusionar los Pull Requests abiertos (#7, #11 y #12 a #21): su código ya está en `main` y falta la revisión de un par técnico.
- Revisar la seguridad del inicio de sesión integrado sin Pull Request (expiración, revocación, CSRF, límite de intentos y permisos) y validarla en el despliegue; activar la protección de `main`.
- Validar las migraciones, el reinicio, la recuperación y la concurrencia de PostgreSQL con una base nueva; ejecutar las pruebas de integración con PostgreSQL real.
- Implementar el motor de optimización VRPTW / Green VRP, la aprobación, la asignación y el despacho de rutas, y medir el rendimiento (RNF-001).
- Incorporar fuentes operativas de GPS, ETA y actualización del mapa, y validar factores de emisión y línea base con datos operativos. Las geometrías, posiciones y métricas actuales son sintéticas.
- Integrar tráfico, notificaciones y reoptimización; las integraciones externas siguen pendientes. Definir el alcance del rol Auditor Externo en la interfaz.
- Completar EN-02: cabeceras de seguridad, auditoría anonimizada, bloqueo de inyección SQL y Ley N.° 29733.
- Validar concurrencia, rendimiento, seguridad y accesibilidad con evidencia propia; medir cobertura (RNF-001, RNF-005 y RNF-007).
- Conciliar Jira con el backlog y registrar la aceptación por historia y la decisión de cierre del sprint.

Los responsables y las fechas de resolución se confirman en la revisión. El incremento aporta una base verificable para continuar el desarrollo; PMV-2, PMV-3, EN-00 y EN-02 conservan los pendientes descritos.

## Control de versiones del documento

| Versión | Fecha | Autoría / cambio |
|---|---|---|
| V_1_0_0 | 09/10/2026 | Tovar Sánchez, Carlos Alberto. Revisión del Sprint 2 con el estado real de cada historia, la pauta de demostración y el registro de la reunión pendiente de completar. |
| V_1_1_0 | 09/10/2026 | Tovar Sánchez, Carlos Alberto. Se unifica con la revisión de la rama `feature/josef/spr2/auth` (mapa visual, autorización por roles y base de pruebas): se integran su demostración, su evidencia de pruebas y sus pendientes sin duplicarlos. |
| V_1_2_0 | 29/10/2026 | Tovar Sánchez, Carlos Alberto. Corrige afirmaciones que `main` ya contradecía (autenticación, persistencia en PostgreSQL, API única y datos desde la API están integradas; las ramas de Josef están en `main` sin Pull Request), reemplaza la evidencia de pruebas por la del 29/10 sobre `30969da` y actualiza el estado de cada historia, la demostración y los pendientes. Absorbe la revisión de Josef (`05 Revisión del Sprint V_2_0_0.md`), que se retira de la carpeta. |
| V_1_3_0 | 29/10/2026 | Rojas Camayo, Valentino Jhan Pierre (PR #25). Actualización documental; pendiente de revisión del equipo. Matriz por criterio y cuatro rutas; resultados pendientes y separación entre verificación técnica y aceptación formal. |
| V_1_4_0 | 30/10/2026 | Tovar Sánchez, Carlos Alberto. Documento único vigente: se integra la edición anterior como anexo, se retira la carpeta Histórico y se agrega la evidencia técnica del 29/10 sobre `main`. |


[← Volver al índice correspondiente](README.md)
