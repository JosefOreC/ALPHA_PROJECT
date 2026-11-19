# Revisión del sprint

**Nombre del Proyecto:** EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Líder del Proyecto:** Ore Campos, Josef Pablo.

## Historias de Usuario completadas en este Sprint

La [revisión técnica del Sprint 4](Hist%C3%B3rico/01%20Revisi%C3%B3n%20del%20Sprint%20V_1_2_0.md) registra el incremento y sus verificaciones. La siguiente tabla usa los identificadores funcionales del proyecto para vincular los incrementos con evidencia. La correspondencia con los tickets de Jira y la aprobación del responsable de producto se confirmarán en la Sprint Review.

| Referencia | Incremento | Criterio verificado | Evidencia de implementación |
|---|---|---|---|
| RF-002 | Gestión de pedidos | Consulta paginada, filtros y autorización en el servidor. | [Corte 6e36e35](https://github.com/JosefOreC/ALPHA_PROJECT/commit/6e36e355e0d39c83c5700a83eb0987b6fd849a10) y [auditoría](06%20Auditor%C3%ADa%20consolidada%20de%20m%C3%A9tricas%20V_1_0_0.md). |
| Mejora transversal · Green IT | Sostenibilidad del software | Comparación de transferencia y estimaciones de CO₂e del flujo web, con metodología reproducible. | [Corte 6e36e35](https://github.com/JosefOreC/ALPHA_PROJECT/commit/6e36e355e0d39c83c5700a83eb0987b6fd849a10) y [resultados ambientales](../reduccion%20del%20impacto%20ambiental/README.md). |

La conciliación parte del [backlog versionado](../../02%20Planificaci%C3%B3n/01%20Transformando%20a%20%C3%A1gil%20V_1_0_0.md), los [artefactos Jira](../../02%20Planificaci%C3%B3n/02%20Artefactos%20Jira%20V_1_1_0.md) y la [revisión del Sprint 3](../Sprint%2003/01%20Revisi%C3%B3n%20del%20Sprint%20V_1_7_0.md). Los siguientes hallazgos respaldan criterios comprobados en el incremento. El proyecto Jira usa la clave `ELODRSPDSC`. Para conciliar el cierre, filtrar su tablero por Sprint 4 y estado Done, y registrar el ID y enlace real de cada tarjeta junto con el commit o PR. Los identificadores US de la tabla corresponden al backlog versionado.

| Historia del backlog | Criterio comprobado | Cambio y evidencia |
|---|---|---|
| US-003 · Registrar pedido de entrega | Un operador registra un pedido válido y lo consulta por su identificador. Un peso inválido devuelve HTTP 422. | [Optimización de la gestión de pedidos](https://github.com/JosefOreC/ALPHA_PROJECT/commit/9f953d6acc79d569d3896ab1e2a161d8321b3720) y [ejecución Playwright](evidencias/inspeccion05/ejecucion-local.json). |
| US-004 · Confirmar entrega de un pedido | El conductor consulta una parada asignada y la confirmación se conserva al volver a leer el pedido. | [Vistas del conductor](https://github.com/JosefOreC/ALPHA_PROJECT/commit/7811be1d261f5d2344cbc3c41fff2fd7ef093d6f) y [ejecución Playwright](evidencias/inspeccion05/ejecucion-local.json). |
| US-005 · Generar rutas optimizadas del día | La aplicación dispone de una vista para la generación de rutas. La prueba Playwright de conductor cubre la consulta de una ruta sembrada. La aprobación y el despacho requieren evidencia propia. | [Implementación de la vista de rutas](https://github.com/JosefOreC/ALPHA_PROJECT/commit/37a4cb91e193ad636eebbbf408ea0c9f201a8ffe) y [regresión del motor](../../../src/backend/tests/test_planning.py). |

## Demostración del trabajo completado

El banco local verificó Acceso y Pedidos con build de producción y datos ficticios. Las [evidencias de pruebas y mediciones](evidencias/raster-native/README.md) respaldan esa validación técnica. Para la demostración con stakeholders se propone usar la versión desplegada y ejecutar acceso, registro de pedido, consulta de ruta, confirmación y consulta de sostenibilidad. La fecha, participantes, entorno y retroalimentación se registrarán con el acta de la sesión cuando esté disponible.

Para la sesión, el operador registra y localiza un pedido de prueba. El equipo muestra la generación de una ruta y el conductor abre una ruta asignada y confirma una parada. Cerrar con la vista de sostenibilidad y recoger feedback sobre los pasos, por ejemplo, dónde espera cada perfil encontrar su siguiente acción. Guardar capturas o video con la versión demostrada e identificar qué observación da lugar a una acción de seguimiento.

## Pendientes

| Pendiente | Situación observada | Tratamiento |
|---|---|---|
| Estabilidad del TBT en Acceso | Una ejecución posterior registró 167 ms frente al límite de 85 ms. | Diagnosticar con trazas, repetir el mismo perfil y documentar antes/después. |
| Aceptación de historias | Falta confirmar los tickets y el acta. | Validar criterios con el líder y registrar la aceptación por historia. |
| Validación del entorno de entrega | La evidencia de navegador histórica corresponde al banco local. | Ejecutar [Playwright y monitoreo](03%20Analisis%20PlayWrigth%20V_1_0_0.md) sobre la versión candidata y documentar la URL y el intervalo observado. |

## Control de versiones

| Versión | Fecha | Cambio |
|---|---|---|
| V_1_0_0 | 19/11/2026 | Primera edición para la Inspección 5. |

[← Volver al README principal](../../../README.md)
