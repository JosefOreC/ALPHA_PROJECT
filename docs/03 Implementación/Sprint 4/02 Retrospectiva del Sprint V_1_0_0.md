# Retrospectiva del sprint

**Nombre del Proyecto:** EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Líder del Proyecto:** Ore Campos, Josef Pablo.

[README principal](../../../README.md) · [Índice del Sprint 4](README.md)

## ¿Qué aprendimos?

La validación técnica y la experiencia de uso aportan información distinta. Playwright comprobó que el conductor podía consultar y confirmar un pedido. Las cinco filas vigentes superaron la referencia de 68. En los comentarios originales, una persona seleccionó «Conductor» y describió una tarea de operador. Para la siguiente evaluación se registrarán por separado el rol de acceso, el perfil declarado y las tareas realizadas. [Informe SUS](04%20Usabilidad%20V_1_0_0.md).

La serie ambiental también mostró resultados diferentes según la pantalla. Pedidos redujo ligeramente la estimación de CO₂e por carga y Acceso aumentó su transferencia con la imagen. Una corrida posterior superó el límite de TBT de Acceso. Conservar las condiciones de medición y la versión facilita revisar ambas desviaciones. [Retrospectiva técnica](Hist%C3%B3rico/02%20Retrospectiva%20del%20Sprint%20V_1_2_0.md) · [Auditoría de métricas](06%20Auditor%C3%ADa%20consolidada%20de%20m%C3%A9tricas%20V_1_0_0.md).

## ¿Qué estamos haciendo bien?

El equipo cuenta con regresiones para los flujos de acceso, pedidos y entrega. También incorporó pruebas para revisar las vistas del conductor en escritorio, tablet y celular. Las pruebas de mapa verifican que dos conductores puedan seleccionarse a la vez y distinguieron sus tramos por color. [Diseño adaptable](https://github.com/JosefOreC/ALPHA_PROJECT/commit/77a7451) · [Seguimiento de rutas](https://github.com/JosefOreC/ALPHA_PROJECT/commit/4f3964b).

## ¿Qué podemos hacer mejor?

### Personas

Asignar por adelantado quién prepara las cuentas de prueba, quién ejecuta cada escenario y quién toma nota. Los participantes deben poder ubicar su primera tarea después del ingreso con las instrucciones de su perfil.

### Relaciones

Recoger el comentario del usuario junto a la tarea que acaba de realizar. En la revisión, separar los ajustes sugeridos de las decisiones de aceptación, y dejar constancia de quién queda a cargo de cada uno.

### Procesos

Usar una ficha de seguimiento que incluya desviación, acción, responsable, plazo y criterio de cierre, siguiendo el enfoque del material de clase *TP_2 19 Documentos de control y cierre proyecto*. Vincular la revisión y la retrospectiva a la misma versión y conservar la evidencia correspondiente.

### Herramientas

Registrar el commit, el navegador y el entorno junto con cada ejecución. Conservar los reportes como artefactos y mantener las comprobaciones locales y públicas identificadas en el informe. [Análisis Playwright](03%20Analisis%20PlayWrigth%20V_1_0_0.md).

### Acciones a realizar

Las responsabilidades siguientes son propuestas de seguimiento documental para el líder y el equipo; no se atribuye un acuerdo de reunión inexistente. Fechas en America/Lima. Los resultados técnicos se respaldan en el [cierre](08%20Cierre%20tecnico%20y%20trazabilidad%20V_1_0_0.md).

| ID y acción SMART | Responsable de seguimiento | Fecha objetivo | Métrica de cierre | Estado al 20/11/2026 |
|---|---|---|---|---|
| A-01 Conciliar las tres historias con tickets, commits y pruebas | Josef Pablo Ore Campos, líder documental | 20/11/2026 | 3/3 historias con correspondencia visible en el backlog y pruebas identificadas. | Completada. Los tickets 17, 18 y 22 aparecen como «Listo». [Evidencia de Jira](evidencias/inspeccion05/resumen-pruebas-sprint4.md#4-cierre-en-jira). |
| A-02 Grabar los tres recorridos y conservar capturas, entorno y huellas | Equipo de QA | 20/11/2026 | Tres videos reproducibles: pedido, entrega y administración/laboratorio; hashes y recibos. | Completada con los videos y los recibos de ejecución. |
| A-03 Cerrar las vulnerabilidades y mantener los umbrales de cobertura | Equipo backend/frontend; revisión del líder | 20/11/2026 | Sonar: cero incidencias abiertas y gate OK; líneas y ramas de ambos lenguajes ≥ 90 %. | Completada en `64267bd`, con recibos remotos. |
| A-04 Registrar decisión humana para las tres historias | Josef Pablo Ore Campos, Líder del Proyecto | 20/11/2026 | Tres decisiones explícitas, responsable y rol, fecha, versión revisada y acta enlazada. | Completada: 3/3 ACEPTADAS en revisión asíncrona. [Acta](09%20Acta%20de%20revision%20y%20aceptacion%20V_1_0_0.md). |
| A-05 Investigar los valores de Lighthouse que exceden la serie estricta histórica | Equipo frontend y QA; seguimiento del líder | 24/11/2026, propuesta | Tres nuevas cargas comparables con FCP ≤ 1000 ms, LCP ≤ 1400 ms, TBT ≤ 85 ms y CLS ≤ 0,02, o desviación documentada con trazas y decisión. | Desviación documentada con las tres cargas del runner; no se declara corregida por el job verde. |
| A-06 Identificar la demora de Pedidos en Render y repetir la medición | Equipo de pruebas y responsable de Render | Antes de cerrar la Inspección 5 | Cinco respuestas válidas del listado de Pedidos, cada una por debajo de 500 ms. Registrar la versión, la red y el horario. | Serie previa: 5/5 respuestas HTTP 200 y 0/5 bajo el umbral. La versión que reduce las consultas a la base ya está en Render. El nuevo archivo registra salud. El cierre de la acción requiere las cinco muestras autenticadas de Pedidos. |
| A-07 Acreditar el despliegue automático del servicio del curso | Integrante con acceso a Render y a la configuración de GitHub | Antes de cerrar la Inspección 5 | Ejecución exitosa de Deploy production, enlace a la versión activa y cinco comprobaciones de disponibilidad en el artefacto. | Completada. Despliegue automático aprobado y 5/5 comprobaciones de salud correctas. [Deploy production](https://github.com/JosefOreC/ALPHA_PROJECT/actions/runs/44776606164) · [CSV de disponibilidad](evidencias/inspeccion05/disponibilidad-despliegue-automatico.csv). |

El informe SUS y el seguimiento de Render se actualizan en sus documentos de Inspección 5. [Usabilidad](04%20Usabilidad%20V_1_0_0.md) · [Pruebas y disponibilidad](03%20Analisis%20PlayWrigth%20V_1_0_0.md).

## Control de versiones

| Versión | Fecha | Cambio |
|---|---|---|
| V_1_0_0 | 19/11/2026 | Primera edición para la Inspección 5. |
| V_1_0_1 | 20/11/2026 | Incorporación de hallazgos SUS y condiciones medibles de seguimiento. |
| V_1_0_2 | 20/11/2026 | Acciones SMART con fechas, responsables de seguimiento, resultados y evidencia; se excluyen SUS y Render del trabajo solicitado. |

[← Volver al README principal](../../../README.md) · [Volver al Sprint 4](README.md)
