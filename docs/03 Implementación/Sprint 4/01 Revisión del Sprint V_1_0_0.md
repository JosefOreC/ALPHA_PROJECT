# Revisión del sprint

**Nombre del Proyecto:** EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Líder del Proyecto:** Ore Campos, Josef Pablo.

[README principal](../../../README.md) · [Índice del Sprint 4](README.md)

## Historias de Usuario completadas en este Sprint

La tabla concilia los criterios del backlog con el incremento y sus pruebas. El estado corresponde a verificación técnica. El registro del tablero Jira y el acta son los documentos de referencia para la aceptación formal. [Backlog versionado](../../02%20Planificaci%C3%B3n/01%20Transformando%20a%20%C3%A1gil%20V_1_0_0.md) · [Artefactos Jira](../../02%20Planificaci%C3%B3n/02%20Artefactos%20Jira%20V_1_1_0.md).

| Historia | Incremento comprobado | Cambios y evidencia |
|---|---|---|
| US-003 · Registrar pedido de entrega | Registro y consulta posterior del pedido, con validación de datos y autorización por rol. | [Gestión de pedidos](https://github.com/JosefOreC/ALPHA_PROJECT/commit/9f953d6acc79d569d3896ab1e2a161d8321b3720) · [Pruebas E2E](evidencias/inspeccion05/ejecucion-local.json). |
| US-004 · Confirmar entrega de un pedido | Consulta de una ruta asignada y persistencia de la entrega confirmada. La vista diferencia el tramo confirmado y las paradas restantes. | [Vistas del conductor](https://github.com/JosefOreC/ALPHA_PROJECT/commit/7811be1d261f5d2344cbc3c41fff2fd7ef093d6f) · [Avance en el mapa](https://github.com/JosefOreC/ALPHA_PROJECT/commit/8949cba) · [Pruebas E2E](evidencias/inspeccion05/ejecucion-local.json). |
| US-005 · Generar rutas optimizadas del día | Generación y aprobación de una propuesta, consulta de la asignación y seguimiento de uno o varios conductores por nombre y placa. | [Implementación del planificador](https://github.com/JosefOreC/ALPHA_PROJECT/commit/37a4cb91e193ad636eebbbf408ea0c9f201a8ffe) · [Asignación en Render](https://github.com/JosefOreC/ALPHA_PROJECT/commit/ba838ff) · [Comparación de recorridos](https://github.com/JosefOreC/ALPHA_PROJECT/commit/4f3964b) · [Escenarios de mapa](../../../src/frontend/tests/ui/map.spec.ts). |

La captura versionada del backlog confirma US-003 → ELODRSPDSC-17, US-004 → ELODRSPDSC-18 y US-005 → ELODRSPDSC-22. La matriz del [cierre técnico](08%20Cierre%20tecnico%20y%20trazabilidad%20V_1_0_0.md#conciliación-de-historias) enlaza las tres historias con commits, pruebas y multimedia. El estado actual del tablero y la aceptación formal no se deducen de capturas históricas. [Registro de trazabilidad de pedidos](../Gu%C3%ADas%20t%C3%A9cnicas/CRUD%20de%20pedidos.md).

La optimización transversal conserva sus series de transferencia y CO₂e antes y después, sus condiciones de medición y la matriz de estándares. [Informe ambiental](03%20Informe%20de%20reducci%C3%B3n%20del%20impacto%20ambiental%20V_1_2_0.md) · [Estándares y arquitectura](04%20Est%C3%A1ndares%20arquitectura%20y%20gu%C3%ADa%20de%20desarrollo%20verde%20V_1_2_0.md).

## Demostración del trabajo completado

El banco técnico ejecutó el acceso, el registro de pedidos y la confirmación de entregas sobre FastAPI y PostGIS. El código de prueba comprueba la lectura posterior del pedido. La captura del reporte deja el resultado por navegador. La prueba adicional de mapa recorre la aprobación de la propuesta y la selección de conductores con una API interceptada. [Captura del reporte](evidencias/inspeccion05/reporte-playwright.png) · [Alcance y resultados](03%20Analisis%20PlayWrigth%20V_1_0_0.md).

La evaluación de uso reunió cinco cuestionarios y obtuvo un promedio SUS actualizado de 83,0. El informe conserva los perfiles declarados, las observaciones sobre el acceso y la lectura de rutas. Los roles asignados a las cuentas institucionales figuran en el análisis de pruebas. [Informe de usabilidad](04%20Usabilidad%20V_1_0_0.md) · [Cuentas utilizadas](03%20Analisis%20PlayWrigth%20V_1_0_0.md#cuentas-utilizadas-por-el-equipo).

### Guion para la sesión de cierre

| Paso | Criterio de aceptación que se mostrará | Evidencia que se conservará |
|---|---|---|
| Registrar un pedido desde Operación | El pedido aparece en el listado y se puede consultar con la dirección, la ventana y el peso ingresados. | Captura del pedido y nota sobre el rol usado. |
| Generar o consultar la ruta desde Planificación | La propuesta aprobada conserva el conductor y el vehículo. El mapa distingue los recorridos al seleccionar dos conductores. | Captura de la asignación y del mapa, con el commit que se demostró. |
| Confirmar la entrega desde la cuenta de Conductor | El pedido figura como entregado al volver a consultarlo y la vista actualiza el tramo confirmado. | Captura del cambio de estado y del avance en el mapa. |
| Revisar el incremento con los participantes | El responsable de producto registra la decisión sobre cada historia y acuerda el tratamiento de las observaciones. | Acta con fecha, rol de los asistentes, decisiones y enlace a la grabación o a las capturas. |

## Verificación de cierre del 20/11/2026

El [registro de cierre](08%20Cierre%20tecnico%20y%20trazabilidad%20V_1_0_0.md) reúne los enlaces de CI, Tests, documentación, Lighthouse y SonarCloud del commit `64267bd`, todos aprobados. Se incluyen los reportes descargados, hashes de integridad y la demostración grabada del producto. La confirmación del conductor ahora se muestra y comprueba por interfaz en Chromium, Firefox y WebKit.

| Entrega | Resultado |
|---|---|
| Trazabilidad de las tres historias | Conciliada con la captura del backlog: tickets 17, 18 y 22, criterios, commits y pruebas. |
| Multimedia del incremento | Videos del registro de pedidos, entrega del conductor, roles y laboratorio X/Y; capturas de cada etapa. Demostración técnica automatizada. |
| Aceptación de las historias | **3/3 aceptadas** por Ore Campos, Josef Pablo, Líder del Proyecto, en revisión asíncrona del commit `8e11664`. [Acta](09%20Acta%20de%20revision%20y%20aceptacion%20V_1_0_0.md). |
| SUS y Render | El registro de cuentas y el sondeo público corresponden a la actualización de la rama de entrega. [Verificación de la versión integrada](03%20Analisis%20PlayWrigth%20V_1_0_0.md#verificación-de-la-versión-integrada). |

El líder confirmó por escrito la aceptación de las tres historias. Los videos muestran los recorridos ejecutados por las pruebas automatizadas. La revisión del estado de los tickets requiere acceso a Jira.

## Control de versiones

| Versión | Fecha | Cambio |
|---|---|---|
| V_1_0_0 | 19/11/2026 | Primera edición para la Inspección 5. |
| V_1_0_1 | 20/11/2026 | Conciliación de historias, pruebas y observaciones del cuestionario. |
| V_1_0_2 | 20/11/2026 | Tickets confirmados en captura, paquete técnico y demostración multimedia; SUS y Render fuera de alcance. |

[← Volver al README principal](../../../README.md) · [Volver al Sprint 4](README.md)
