# Retrospectiva del sprint

**Nombre del Proyecto:** EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Líder del Proyecto:** Ore Campos, Josef Pablo

**Sprint:** Sprint 4, en curso; retrospectiva técnica de la sesión del 12/11/2026.

**Versión del documento:** V_1_0_0

**Autoría:** elaboración técnica asistida por Codex, por solicitud del usuario; revisión del equipo pendiente.

**Fecha y hora de corte:** 12/11/2026, 20:56:09, America/Lima (UTC−05:00).

**Actualización documental:** 12/11/2026, 21:11:30, America/Lima; no es fecha de reunión formal.

**Rama y commit analizados:** `refactor/mern`, `7ea33a185619d5c06ab8ce8c090b3e334b45a9ce`.

**Estado:** análisis de sesión y propuestas de mejora. No constituye retrospectiva formal celebrada ni acuerdos aprobados por el equipo.

**Participación constatada:** usuario solicitante y asistente Codex en la conversación. No se atribuye asistencia a otros integrantes ni al cliente.

## 1. ¿Qué aprendimos?

La verificación debe corresponder al alcance de la afirmación. Las pruebas seleccionadas de la mejora del mapa aprobaron; la ejecución completa del corte encontró una regresión de la regla tipográfica, un test del lanzador que no captura `SystemExit(0)`, errores de navegación documental y un fallo de accesibilidad del mapa. Los resultados se detallan en la [revisión](01%20Revisi%C3%B3n%20del%20Sprint%20V_1_0_0.md), con salidas y horas, sin presentar esas suites como totalmente aprobadas.

Los filtros deben conservar el contexto útil sin alterar su significado. Mantener la ruta completa y marcar las demás paradas con símbolos pequeños permite explicar el recorrido sin incluir otros pedidos en el resultado principal del filtro. Se reutilizan la asignación y el número de parada ya registrados; no se reconstruye un orden nuevo al filtrar.

Una captura del mapa no demuestra telemetría ni una reducción de emisiones. Las pruebas usan fixtures y cartografía simulada; los tamaños del build son una referencia del artefacto, no tráfico real ni gramos de CO₂e ahorrados.

## 2. ¿Qué estamos haciendo bien?

- Se solicitó y recibió aclaración sobre «otras paradas de la misma ruta» antes de implementar el comportamiento.
- La presentación corporativa se aplicó desde los estilos y tokens comunes, evitando duplicar reglas por pantalla.
- La mejora del mapa se probó con filtros de estado, pedido sin ruta, capas, teclado y ancho móvil de 390 px.
- Las pruebas negativas y las comprobaciones fallidas se conservan junto a las aprobadas; cada ejecución nueva incluye commit, comando, hora y código de salida.
- Se separa el trabajo de esta sesión del enrutamiento y la documentación heredados de otros commits.

## 3. ¿Qué podemos hacer mejor?

### 3.1 Personas y relaciones

La preparación técnica no sustituye la revisión por otro integrante. Faltan un revisor independiente, la validación del responsable académico y la demostración con participantes y decisiones atribuibles. No se registra aprobación de personas que no intervinieron en la conversación.

### 3.2 Procesos

Cambiar una decisión de diseño exige revisar las reglas automatizadas que la codifican. La selección de Segoe UI quedó en conflicto con la prueba que exige Geist como primera fuente. Debe resolverse la decisión y comprobar el conjunto completo antes de afirmar que la calidad está aprobada.

La documentación también forma parte del incremento: quedaron dos versiones antiguas simultáneas en Sprint 03 y reportes Sonar sin índices. La normalización de esta entrega conserva los documentos históricos y repara su navegación; no cambia la aceptación registrada en el Sprint 3.

### 3.3 Herramientas

El comando de cobertura encadena Vitest y Node con `&&`; si Vitest falla, Node no se ejecuta. Por ello se comprobó Node por separado. No existe un resumen vigente de cobertura en esta ejecución y no se reutilizan porcentajes de otra fecha.

Playwright terminó sus casos, pero el proceso Vite local no finalizó automáticamente. Se detuvo exclusivamente el proceso de servidor creado por esta ejecución, después del último caso, para obtener el resumen y conservar la salida. El código de retorno corresponde al fallo de accesibilidad, no a un caso omitido por esa limpieza.

## 4. Acciones propuestas

| ID | Dimensión | Acción y propósito | Responsable | Momento propuesto | Evidencia de cierre | Estado |
|---|---|---|---|---|---|---|
| S4-R01 | Procesos | Conciliar token tipográfico y regla de identidad para eliminar S4-I01. | Por designar por el líder. | Antes de la siguiente revisión de incremento. | Suite completa y resumen de cobertura del commit corregido. | Propuesta. |
| S4-R02 | Herramientas | Adaptar el test del lanzador a su terminación y aislar el socket, sin iniciar un servidor real. | Por designar. | Antes de solicitar aceptación técnica. | Test del lanzador y regresión backend aprobados. | Propuesta. |
| S4-R03 | Personas | Asignar un revisor distinto del implementador. | Coordinación propuesta: Ore Campos, Josef Pablo. | Al preparar la solicitud de integración. | Revisión atribuida, fecha/hora y commit. | Pendiente de acuerdo. |
| S4-R04 | Accesibilidad | Alinear los nombres accesibles de los cinco botones de rutas con su texto visible. | Por designar. | Antes de declarar EN-05 o WCAG satisfechos. | axe-core y recorrido manual de teclado/lector documentados. | Propuesta. |
| S4-R05 | Procesos | Medir antes de optimizar, conservar entorno y ejecutar tres repeticiones comparables. | Por designar. | Antes de cambios de rendimiento. | Lighthouse, red HTTP y latencia API con medianas y datos de prueba identificados. | Propuesta. |
| S4-R06 | Relaciones | Obtener la rúbrica original y ratificar el alcance, la adaptación al stack y los criterios de aceptación. | Coordinación propuesta: Ore Campos, Josef Pablo. | Antes de cerrar la evaluación académica. | Fuente de la rúbrica y matriz completa con ponderaciones reales. | Pendiente. |
| S4-R07 | Documentación | Mantener una versión vigente por documento y enlazar reportes. | Elaboración asistida por Codex; revisión del equipo pendiente. | En esta entrega y en cada actualización posterior. | Comprobadores de enlaces y Markdown con resultado conservado. | Implementada en esta entrega documental. |

Las fechas de compromiso y responsables efectivos deben ratificarse; las expresiones «propuesta» y «por designar» no equivalen a acuerdos del equipo. No se inventa una ceremonia de cierre para completar el formato.

## Control de versiones del documento

| Versión | Fecha | Autoría / cambio |
|---|---|---|
| V_1_0_0 | 12/11/2026 | Elaboración asistida por Codex a solicitud del usuario. Aprendizajes y acciones basados en el corte `7ea33a1`; estado en curso, sin acta ni compromisos ficticios. |

[← Volver al índice correspondiente](README.md)
