# Revisión del Sprint — Sprint 3

**Proyecto:** EcoLogística Lima — DistriRápido S.A.C.

**Versión del documento:** V_1_1_0

**Actualización documental:** 29/10/2026. No es fecha de reunión ni de aceptación.

**Estado:** aceptación técnica y formal pendientes. Esta edición inspecciona documentos y código; no ejecuta la aplicación ni suites funcionales.

## Historias de Usuario y criterios de aceptación

Fuente de criterios: [Transformando a ágil, secciones 5–6](../../02%20Planificaci%C3%B3n/01%20Transformando%20a%20%C3%A1gil%20V_1_0_0.md). CA1/CA2 identifican localmente el primer/segundo escenario Gherkin de cada ID. Los escenarios marcados «propuesto» amplían la comprobación y necesitan confirmación; no sustituyen requisitos aprobados.

La fuente declara US-010, US-011, EN-02 y EN-05 (20 puntos); Jira no se ha consultado en esta edición. El título histórico «Mapa, indicadores» no coincide exactamente con esas cuatro actividades y parte del código ya se describe en Sprint 2: conciliar asignación y fechas antes de contar velocidad.

## Demostración y tipos de ruta

- **Gold:** flujo principal completo que aporta el valor de la historia, con las integraciones necesarias.
- **Feliz:** variante válida del flujo principal.
- **Infeliz:** entrada inválida, fallo o rechazo esperado.
- **Borde:** vacío, límite temporal/numérico o concurrencia.

La tabla es el guion reproducible de la demostración pendiente. Un enlace a código o test demuestra su existencia, no que se haya ejecutado ni pasado. Las capturas acreditan únicamente el estado visual registrado.

| Historia | Criterio | Tipo de ruta | Escenario y precondiciones | Resultado esperado | Resultado observado | Evidencia | Decisión de aceptación |
|---|---|---|---|---|---|---|---|
| US-010 — Reporte de sostenibilidad | CA1 reporte y rendimiento | Gold | Administrador según Gherkin; rango con operación y factores de emisión identificados; generar reporte. | CO₂, combustible, km y entregas del periodo; P95 ≤ 1,5 s medido; conciliar rol de Logística en D-10. | Pendiente de ejecución/evidencia | [Referencia de código; caso por verificar, no ejecución](../../../src/backend/interfaces/api/portal/router.py) | Pendiente |
| US-010 — Reporte de sostenibilidad | CA1 reporte y rendimiento | Feliz | Elegir semana y luego mes con datos conocidos. | Agregados coinciden con los registros del intervalo seleccionado y sus unidades. | Pendiente de ejecución/evidencia | [Referencia de código; caso por verificar, no ejecución](../../../src/backend/interfaces/api/portal/router.py) | Pendiente |
| US-010 — Reporte de sostenibilidad | CA2 periodo sin registros | Infeliz | Seleccionar rango sin datos operativos. | No generar archivo vacío; «No se encontraron registros operativos para el período seleccionado». | Pendiente de ejecución/evidencia | [Referencia de código; caso por verificar, no ejecución](../../../src/backend/interfaces/api/portal/router.py) | Pendiente |
| US-010 — Reporte de sostenibilidad | CA1; borde propuesto | Borde | Pedidos justo al inicio y fin del rango, en zona America/Lima. | Inclusión de límites documentada y coherente entre API, vista y exportación. | Pendiente de ejecución/evidencia | [Referencia de código; caso por verificar, no ejecución](../../../src/backend/interfaces/api/portal/router.py) | Pendiente |
| US-011 — Exportar CSV | CA1 descarga CSV | Gold | Administrador según Gherkin; reporte generado con datos; descargar CSV. | CSV estructurado con encabezados en español y datos del periodo; permisos por conciliar en D-10. | Pendiente de ejecución/evidencia | [Referencia de código; caso por verificar, no ejecución](../../../src/backend/interfaces/api/portal/router.py) | Pendiente |
| US-011 — Exportar CSV | CA1 descarga CSV | Feliz | Descargar reporte filtrado por otro periodo con tildes en los datos. | Se conservan codificación, encabezados y totales del reporte visible. | Pendiente de ejecución/evidencia | [Referencia de código; caso por verificar, no ejecución](../../../src/backend/interfaces/api/portal/router.py) | Pendiente |
| US-011 — Exportar CSV | CA2 formato no soportado | Infeliz | Solicitar exportación en un formato no admitido. | «Formato de exportación no disponible» y sugerencia de formatos válidos. | Pendiente de ejecución/evidencia | [Referencia de código; caso por verificar, no ejecución](../../../src/backend/interfaces/api/portal/router.py) | Pendiente |
| US-011 — Exportar CSV | CA1; borde propuesto | Borde | Registro con coma, comillas y salto de línea en un campo exportable. | Escapado CSV válido, sin desplazar columnas ni perder registros. | Pendiente de ejecución/evidencia | [Referencia de código; caso por verificar, no ejecución](../../../src/backend/interfaces/api/portal/router.py) | Pendiente |
| EN-02 — Seguridad e identidad | CA2 minimización de datos | Gold | Registrar conductor o destinatario mediante sesión autorizada; inspeccionar campos persistidos. | Solo datos necesarios para la operación; documentar justificación y revisión de privacidad. | Pendiente de ejecución/evidencia | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/test_sessions.py) | Pendiente |
| EN-02 — Seguridad e identidad | Soporte de CA1/CA2: sesión | Feliz | Cuenta activa inicia sesión, realiza mutación con CSRF válido y cierra sesión. | Identidad verificada; sesión revocada tras salir. Esto por sí solo no acredita EN-02. | Pendiente de ejecución/evidencia | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/test_sessions.py) | Pendiente |
| EN-02 — Seguridad e identidad | CA1 inyección SQL | Infeliz | En entorno aislado autorizado, enviar intento de inyección al endpoint de autenticación. | Bloqueo, log de auditoría y notificación al equipo de seguridad según criterio; consultas parametrizadas no prueban todo el flujo. | Pendiente de ejecución/evidencia | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/test_sessions.py) | Pendiente |
| EN-02 — Seguridad e identidad | Soporte: expiración/límite | Borde | Sesión al límite de 8 h; también probar intento 10 y 11 dentro de 15 min. | Expiración y limitación coherentes con código; documentar reloj y conteos sin exponer credenciales. | Pendiente de ejecución/evidencia | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/test_sessions.py) | Pendiente |
| EN-05 — Conductor y accesibilidad | CA1 primer uso | Gold | Conductor sin capacitación previa en móvil; ejecutar confirmación completa. | Completa sin errores; evidencia de criterios WCAG 2.1 AA aplicables, no solo ancho de pantalla. | Pendiente de ejecución/evidencia | [Tests UI relacionados; caso por verificar, no ejecutados](../../../src/frontend/tests/ui/driver.spec.ts) | Pendiente |
| EN-05 — Conductor y accesibilidad | CA1; modalidad propuesta | Feliz | Recorrer confirmación mediante teclado y lector de pantalla. | Foco, etiquetas, errores y confirmación accesibles según evaluación documentada. | Pendiente de ejecución/evidencia | [Tests UI relacionados; caso por verificar, no ejecutados](../../../src/frontend/tests/ui/driver.spec.ts) | Pendiente |
| EN-05 — Conductor y accesibilidad | CA2 conexión intermitente | Infeliz | Cortar conexión 4G durante confirmación y restablecerla. | Reintento automático y estado de sincronización visible. | Pendiente de ejecución/evidencia | [Tests UI relacionados; caso por verificar, no ejecutados](../../../src/frontend/tests/ui/driver.spec.ts) | Pendiente |
| EN-05 — Conductor y accesibilidad | CA2; borde propuesto | Borde | Servidor confirma pero se pierde respuesta y el cliente reintenta. | No duplicar entrega ni cambiar primera hora; resolver conflicto D-04 antes de aceptación. | Pendiente de ejecución/evidencia | [Tests UI relacionados; caso por verificar, no ejecutados](../../../src/frontend/tests/ui/driver.spec.ts) | Pendiente |

## Evidencia histórica y límites

- [Revisión anterior y registro atribuido a su autor](Hist%C3%B3rico/01%20Revisi%C3%B3n%20del%20Sprint%20V_1_0_0.md): se conserva íntegra, incluidas cifras, referencias y decisiones. Ningún resultado se ratifica por esta edición.

Los resultados agregados de 09/10 y 29/10 atribuidos en las fuentes no incluyen aquí una ejecución por escenario sobre el árbol actual; no se trasladan a la columna «Resultado observado». Para pedidos y mapa hay capturas locales en las [guías técnicas](../Gu%C3%ADas%20t%C3%A9cnicas/README.md); no acreditan rendimiento, seguridad, GPS ni aceptación.

## Pendientes y comprobación técnica

- Ejecutar cada escenario sobre un commit/árbol identificado y registrar entorno, precondiciones, comandos, resultado y artefacto. Confirmar los escenarios propuestos.
- Resolver D-04 (rechazo de repetición frente a idempotencia) y D-10 (roles del Gherkin frente a matriz RBAC) en [decisiones](../../../development/decisiones.md); no adaptar criterios silenciosamente al código.
- La DoD global exige cobertura ≥80 %, análisis estático, revisión por un par, staging independiente, documentación API y criterios comprobados. Todo queda pendiente de evidencia por historia, sin inferir cumplimiento de la existencia de tests.
- Validar migraciones/recuperación y seguridad; motor VRPTW, despacho, fuentes GPS/ETA y factores ambientales siguen pendientes según [impedimentos](07%20Registro%20de%20Impedimentos%20V_1_1_0.md).

Los documentos anunciados 03 Calidad de código, 04 OWASP y 05 WCAG no existen en esta carpeta. No se crean informes de resultados sin evaluación. La mención «SonarQube (documentos 03 y 04)» de la fuente mezcla análisis estático y evaluación OWASP; confirmar el alcance con la consigna.

## Definition of Done por actividad

| Criterio | US-010 | US-011 | EN-05 | EN-02 |
|---|---|---|---|---|
| Cobertura ≥80 % del código nuevo | Pendiente de medición | Pendiente de medición | Pendiente de medición | Pendiente de medición |
| Análisis estático sin vulnerabilidades críticas | Pendiente de evidencia | Pendiente de evidencia | Pendiente de evidencia | Pendiente de evidencia |
| Revisión por un par mediante PR | Pendiente de confirmación | Pendiente de confirmación | Pendiente de confirmación | Pendiente de confirmación |
| Staging verificado por quien no implementó | Pendiente | Pendiente | Pendiente | Pendiente |
| Documentación de API actualizada | Pendiente de verificación | Pendiente de verificación | Pendiente de verificación | Pendiente de verificación |
| Criterios Gherkin comprobados | Pendiente según matriz | Pendiente según matriz | Pendiente según matriz | Pendiente según matriz |
| Aceptación formal | Pendiente | Pendiente | Pendiente | Pendiente |

## Registro de la reunión y aceptación formal

| Campo | Registro |
|---|---|
| Fecha y hora | Fecha por confirmar |
| Asistentes / stakeholders | Por confirmar con evidencia |
| Decisión por historia | Pendiente; registrar aceptada, parcial o retorno al backlog con criterio y evidencia |
| Acuerdos y responsables | Pendientes de acta o registro atribuido |
| Velocidad | No calculada; no contar historias sin aceptación |


## Control de versiones del documento

| Versión | Fecha | Autoría / cambio |
|---|---|---|
| V_1_0_0 y antecedentes | Fechas en la fuente | Autoría y registro completos en [fuente histórica](Hist%C3%B3rico/01%20Revisi%C3%B3n%20del%20Sprint%20V_1_0_0.md). |
| V_1_1_0 | 29/10/2026 | Actualización documental; pendiente de revisión del equipo. Matriz por criterio y cuatro rutas; resultados pendientes y separación entre verificación técnica y aceptación formal. |


[← Volver al índice correspondiente](README.md)
