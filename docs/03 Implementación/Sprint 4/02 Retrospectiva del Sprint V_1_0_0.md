# Retrospectiva del sprint

**Nombre del Proyecto:** EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Líder del Proyecto:** Ore Campos, Josef Pablo.

[README principal](../../../README.md) · [Índice del Sprint 4](README.md)

## ¿Qué aprendimos?

La validación técnica y la experiencia de uso aportan información distinta. Playwright comprobó que el conductor podía consultar y confirmar un pedido. Dos de los cinco participantes declararon ese perfil y sus puntajes quedaron por debajo de 68. Uno de ellos describió una tarea de operador, por lo que el próximo registro debe distinguir el perfil asignado de las tareas que se ejecutaron. [Informe SUS](04%20Usabilidad%20V_1_0_0.md).

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

| Acción de seguimiento | Responsable propuesto | Plazo | Criterio de cierre |
|---|---|---|---|
| Conciliar las historias y registrar la aceptación | Josef Pablo Ore Campos, líder del proyecto | Antes de la siguiente revisión | Las tres historias de la Review enlazan a ticket y commit. El acta registra la decisión de aceptación sobre cada una. |
| Repetir el ingreso y la primera tarea del conductor | Responsable de UX y equipo frontend | En la próxima sesión de usabilidad | Al menos cinco sesiones registradas con perfil, dispositivo y versión. Al menos cuatro completan su primera tarea sin ayuda y al primer intento. |
| Validar la identificación de recorridos | Responsable de QA y responsable de pruebas operativas | Antes de volver a presentar el flujo de rutas | En la regresión, el mapa muestra las dos rutas seleccionadas. En la sesión, el operador identifica ambos tramos confirmados sin ayuda. |
| Resolver las desviaciones de rendimiento y cerrar el pipeline | Responsables de QA, frontend y despliegue | Antes de la entrega final | Ejecutar tres cargas de Acceso con TBT ≤ 85 ms o registrar la desviación con traza. Adjuntar los enlaces a CI, Tests y Deploy y su versión probada. |

## Control de versiones

| Versión | Fecha | Cambio |
|---|---|---|
| V_1_0_0 | 19/11/2026 | Primera edición para la Inspección 5. |
| V_1_0_1 | 20/11/2026 | Incorporación de hallazgos SUS y condiciones medibles de seguimiento. |

[← Volver al README principal](../../../README.md) · [Volver al Sprint 4](README.md)
