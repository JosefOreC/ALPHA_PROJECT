# Guía de desarrollo de EcoLogística Lima

Fecha de corte: **08/10/2026** (America/Lima). Rama de coordinación actual: `feature/josef/spr2/map`. Base inspeccionada: `1bf3ee8`.

Esta carpeta convierte la documentación del proyecto en un plan de ejecución: incrementos PMV, backlog trazable, sprints, ramas y criterios de entrega. PMV y MVP se usan como equivalentes. Los documentos describen una **propuesta operativa**; no declaran nuevas aprobaciones, sprints cerrados ni versiones publicadas.

## Orden de lectura

| Archivo | Para qué usarlo |
|---|---|
| [roadmap.md](roadmap.md) | Entender los incrementos, dependencias y alcance final. |
| [estado-actual.md](estado-actual.md) | Consultar qué existe y qué falta integrar o validar. |
| [backlog.md](backlog.md) | Vincular RF, historias, enablers, puntos y trabajo técnico. |
| [sprints.md](sprints.md) | Preparar objetivos, demos y cierre de `spr1` a `spr4`. |
| [ramas.md](ramas.md) | Crear ramas, revisar PR e integrar cada sprint. |
| [calidad.md](calidad.md) | Aplicar Definition of Ready, Definition of Done y gates de PMV. |
| [decisiones.md](decisiones.md) | Resolver contradicciones, decisiones técnicas y riesgos. |
| [task.md](task.md) | Ejecutar el trabajo inmediato de coordinación. |
| [task-mapa-visual.md](task-mapa-visual.md) | Implementar el mapa visual fiel de Lima con capas configurables de rutas, camiones y pedidos. |
| [templates/sprint.md](templates/sprint.md) | Registrar planificación, revisión y retrospectiva. |
| [templates/historia.md](templates/historia.md) | Desglosar una historia o tarea con aceptación y evidencia. |
| [templates/pull-request.md](templates/pull-request.md) | Preparar una revisión trazable. |

## Fuentes y precedencia

1. El [Acta](../docs/01%20Inicio/02.%20Acta%20de%20constitución%20V_1_0_0.md), la [visión](../docs/01%20Inicio/03.%20Declaración%20de%20la%20visión%20V_1_0_0.md) y el [enfoque](../docs/01%20Inicio/01.%20Selección%20del%20enfoque%20del%20proyecto%20V_1_0_0.md) fijan objetivos, cuatro iteraciones y 14 semanas.
2. Los [RF](../docs/01%20Inicio/06.%20Requisitos%20funcionales%20V_1_0_0.md), [RNF](../docs/01%20Inicio/07.%20Requisitos%20no%20funcionales%20V_1_0_0.md), [usuarios/RBAC](../docs/01%20Inicio/08.%20Usuarios%20V_1_0_0.md) y [reglas de negocio](../docs/01%20Inicio/09.%20Reglas%20de%20negocio%20V_1_0_0.md) fijan comportamiento y calidad. Aquí se normaliza RF-01 como RF-001; los RNF usan la numeración del documento 07, porque README y Acta difieren.
3. [Transformando a ágil](../docs/02%20Planificación/01%20Transformando%20a%20ágil%20V_1_0_0.md) conserva los IDs US-001–US-013 y EN-00–EN-06 y sus puntos. [Artefactos Jira](../docs/02%20Planificación/02%20Artefactos%20Jira%20V_1_0_0.md) aporta la planificación y el release histórico. No se consultó Jira en vivo.
4. [Stack](../docs/01%20Inicio/10.%20Stack%20tecnológico%20V_1_0_0.md), [BD](../docs/01%20Inicio/11.%20Base%20de%20datos%20V_1_0_0.md) y [C4](../docs/01%20Inicio/12.%20Modelo%20C4%20V_1_0_0.md) aportan el diseño. Stack y BD tienen cambios internos de versión 2.0.0 aunque sus nombres conservan V_1_0_0.
5. [Supuestos/restricciones](../docs/01%20Inicio/04.%20Registro%20de%20supuestos%20y%20restricciones%20V_1_0_0.md), [interesados](../docs/01%20Inicio/05.%20Registro%20de%20interesados%20V_1_0_0.md), [análisis de restricciones](../docs/01%20Inicio/13.%20Restricciones%20V_1_0_0.md), [riesgos](../docs/02%20Planificación/03%20Registro%20de%20riesgos%20V_1_0_0.md) y [presupuesto](../docs/02%20Planificación/04%20Presupuesto%20del%20proyecto%20V_1_0_0.md) condicionan prioridades y contingencias.
6. [Informe](../docs/03%20Implementación/01%20Informe%20de%20estado%20del%20proyecto%20V_1_0_0.md), [impedimentos](../docs/03%20Implementación/02%20Registro%20de%20Impedimentos%20V_1_0_0.md), [review](../docs/03%20Implementación/03%20Revisión%20del%20Sprint%20V_1_0_0.md), [retrospectiva](../docs/03%20Implementación/04%20Retrospectiva%20del%20Sprint%20V_1_0_0.md), [CRUD de pedidos](../docs/03%20Implementación/CRUD%20de%20pedidos.md) y [confirmación](../docs/03%20Implementación/Confirmacion%20de%20pedidos.md) contienen evidencia histórica y límites de integración.
7. [Paquete de diseño](../ecologistica-ui/LEEME.md), [guía visual](../ecologistica-ui/design-system/GUIA.md), [reglas](../ecologistica-ui/CLAUDE-diseno.md), [secuencia UI](../ecologistica-ui/PROMPTS.md), sus pantallas y [diseño del dashboard](../docs/04%20Diseño/Dashboard%20del%20dia.dc.html) orientan la interfaz; sus cifras son ejemplos.

El código inspeccionado demuestra existencia de componentes, no aceptación del producto. Las discrepancias se resuelven en [decisiones.md](decisiones.md) sin sobrescribir silenciosamente los documentos originales.

## Mantenimiento

En cada planning se actualizan `task.md`, capacidad, responsables y alcance del sprint. Cada PR identifica US/EN y sus criterios. Cada review actualiza estado, matriz RF, evidencias y siguiente incremento. Las fechas calendario se fijan con el equipo: las semanas del roadmap son relativas al inicio original, no plazos nuevos calculados desde esta fecha.

`development/*.md` y `development/templates/*.md` se versionan. Los artefactos locales de esta carpeta siguen excluidos; la evidencia permanente se guarda en `docs/03 Implementación/` con una referencia al commit evaluado.
