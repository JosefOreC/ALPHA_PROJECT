[← Volver al README Principal](../README.md)

# Guía de desarrollo de EcoLogística Lima

Fecha de corte: **08/10/2026** (America/Lima). Rama de coordinación actual: `feature/josef/spr2/map`. Base inspeccionada: `1bf3ee8`.

Esta carpeta convierte la documentación del proyecto en un plan de ejecución: incrementos PMV, backlog trazable, sprints, ramas y criterios de entrega. PMV y MVP se usan como equivalentes. Los documentos de esta carpeta deben mantener navegación relativa y salida al README principal.

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
| [task-roles.md](task-roles.md) | Aplicar la matriz de permisos de los cinco roles y completar la integración de identidad. |
| [task-base-pruebas.md](task-base-pruebas.md) | Crear PostgreSQL + PostGIS desde `.env` y generar datos de todos los módulos. |
| [Revisión del Sprint 2 V_2_0_0](../docs/03%20Implementaci%C3%B3n/05%20Revisi%C3%B3n%20del%20Sprint%20V_2_0_0.md) | Consultar el incremento actualizado de login, persistencia, interfaz y filtros. |
| [Retrospectiva del Sprint 2 V_2_0_0](../docs/03%20Implementaci%C3%B3n/06%20Retrospectiva%20del%20Sprint%20V_2_0_0.md) | Consultar aprendizajes de la sesión y acciones propuestas para continuar. |
| [templates/sprint.md](templates/sprint.md) | Registrar planificación, revisión y retrospectiva. |
| [templates/historia.md](templates/historia.md) | Desglosar una historia o tarea con aceptación y evidencia. |
| [templates/pull-request.md](templates/pull-request.md) | Preparar una revisión trazable. |

## Guías de implementación

| Guía | Destino |
|---|---|
| [Inicio de sesión y persistencia](Inicio%20de%20sesi%C3%B3n%20y%20persistencia.md) | Arranque, migraciones y verificación |
| [Base de datos de pruebas](Base%20de%20datos%20de%20pruebas.md) | Creación de BD/PostGIS y dataset |
| [Control de acceso por roles](Control%20de%20acceso%20por%20roles.md) | Matriz RBAC y uso |
| [Mapa visual de Lima](Mapa%20visual%20de%20Lima.md) | Diseño y evidencias cartográficas |
| [CRUD de pedidos](CRUD%20de%20pedidos.md) | Alcance, API y evidencias |
| [Confirmación de pedidos](Confirmacion%20de%20pedidos.md) | Flujo conductor / confirmación |

## Fuentes y precedencia

1. El [Acta](../docs/01%20Inicio/02.%20Acta%20de%20constitución%20V_1_0_0.md), la [visión](../docs/01%20Inicio/03.%20Declaración%20de%20la%20visión%20V_1_0_0.md) y el [enfoque](../docs/01%20Inicio/01.%20Selecci%C3%B3n%20del%20enfoque%20del%20proyecto%20V_1_0_0.md) definen la intención del producto.
2. Los [RF](../docs/01%20Inicio/06.%20Requisitos%20funcionales%20V_1_0_0.md), [RNF](../docs/01%20Inicio/07.%20Requisitos%20no%20funcionales%20V_1_0_0.md), [usuarios/RBAC](../docs/01%20Inicio/08.%20Usuarios%20V_1_0_0.md) y [reglas](../docs/01%20Inicio/09.%20Reglas%20de%20negocio%20V_1_0_0.md) encuadran cada tarea.
3. [Transformando a ágil](../docs/02%20Planificación/01%20Transformando%20a%20ágil%20V_1_0_0.md) conserva los IDs US-001–US-013 y EN-00–EN-06 y sus puntos.
4. [Stack](../docs/01%20Inicio/10.%20Stack%20tecnológico%20V_1_0_0.md), [BD](../docs/01%20Inicio/11.%20Base%20de%20datos%20V_1_0_0.md) y [C4](../docs/01%20Inicio/12.%20Modelo%20C4%20V_1_0_0.md) fijan la arquitectura.
5. [Supuestos/restricciones](../docs/01%20Inicio/04.%20Registro%20de%20supuestos%20y%20restricciones%20V_1_0_0.md), [interesados](../docs/01%20Inicio/05.%20Registro%20de%20interesados%20V_1_0_0.md), [impedimentos](../docs/03%20Implementaci%C3%B3n/Sprint%201/02%20Registro%20de%20Impedimentos%20V_1_2_0.md) y [estado del sprint](../docs/03%20Implementaci%C3%B3n/Sprint%201/01%20Informe%20de%20estado%20del%20proyecto%20V_1_2_0.md) explican el contexto actual.
6. [Paquete de diseño](../ecologistica-ui/LEEME.md), [guía visual](../ecologistica-ui/design-system/GUIA.md), [reglas](../ecologistica-ui/CLAUDE-diseno.md) y [secuencia UI](../ecologistica-ui/PROMPTS.md) orientan la experiencia y la navegación.

El código inspeccionado demuestra existencia de componentes, no aceptación del producto. Las discrepancias se resuelven en [decisiones.md](decisiones.md) sin sobrescribir silenciosamente los documentos fuente.

## Mantenimiento

En cada planning se actualizan `task.md`, capacidad, responsables y alcance del sprint. Cada PR identifica US/EN y sus criterios. Cada review actualiza estado, matriz RF, evidencias y siguiente incremento, y se conserva un índice relativo a la documentación ejecutiva.

`development/*.md` y `development/templates/*.md` se versionan. Los artefactos locales de esta carpeta siguen excluidos; la evidencia permanente se guarda en `docs/03 Implementación/` con una referencia de navegación y retorno correcto al README principal.

