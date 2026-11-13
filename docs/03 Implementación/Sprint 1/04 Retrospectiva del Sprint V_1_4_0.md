# Retrospectiva del Sprint — Sprint 1

**Proyecto:** EcoLogística Lima — DistriRápido S.A.C.

**Versión del documento:** V_1_4_0

**Actualización documental:** 30/10/2026. No es fecha de reunión ni de aceptación.

**Estado:** compromisos preventivos acordados por el equipo; asistieron los cinco integrantes.

## ¿Qué aprendimos?

La implementación, las pruebas ejecutadas y la aceptación son estados distintos. La coordinación entre contratos, datos y permisos necesita una fuente única. Los registros de entorno, diseño y pruebas deben identificar su alcance para evitar repetir diagnósticos erróneos.

## ¿Qué estamos haciendo bien?

Se conservan IDs, historia documental y límites de los datos sintéticos. Existen código, tests y guías que permiten preparar la verificación por criterio. Sus resultados históricos permanecen atribuidos en las fuentes y no se presentan como ejecutados nuevamente.

## ¿Qué podemos hacer mejor?

### Personas

Confirmar responsables y revisores antes de comprometer trabajo. Las propuestas de nombres de versiones anteriores se conservan como antecedentes, sin convertirlas en nuevas asignaciones.

### Relaciones

Recoger decisiones de logística, conductores y equipo en un registro identificable; enlazar desacuerdos de criterios y permisos en [decisiones](../../../development/decisiones.md).

### Procesos

Aplicar criterios, revisión y DoD por historia; contrastar el estado con código y evidencia antes de cerrar un sprint.

### Herramientas

Usar las [guías técnicas](../Gu%C3%ADas%20t%C3%A9cnicas/README.md) para arranque, datos, roles, pedidos y mapa. Automatizar enlaces con [comprobador documental](../../../scripts/check_docs.py); los comandos de operación se mantienen en esas guías para evitar duplicaciones.

### Acciones a realizar

| Problema | Acción preventiva | Responsable | Fecha o frecuencia | Comprobación del cumplimiento | Estado |
|---|---|---|---|---|---|
| Responsabilidades difusas al inicio | Antes de iniciar otro incremento, ratificar por escrito alcance y capacidad de cada módulo y registrar cambios respecto de la tabla histórica. | Ore Campos, Josef Pablo | En cada planning; primera aplicación en el Sprint 4 | Tabla de responsables ratificada y tareas con dueño; la tabla histórica no confirma capacidad futura. | Acordada |
| Documentación y Jira divergen | Conciliar semanalmente ID, criterio, sprint y evidencia antes de mover tarjetas a Done. | Ore Campos, Josef Pablo | Semanal y antes de cada cierre; primera aplicación en el Sprint 4 | Registro de diferencias, enlaces a evidencia y decisión por historia. | Acordada |
| Decisiones de stack y contratos se duplican | Registrar decisión única y enlazarla desde cada tarea; revisar contrato Pedido antes de cambios entre módulos. | Ore Campos, Josef Pablo | Antes de modificar contratos; primera aplicación en el Sprint 4 | Decisión referenciada y revisión de compatibilidad; D-04 explícita. | Acordada |
| Entorno y estructura retrasaron el inicio: IMP-001 | Comprobar arranque desde una instalación limpia siguiendo la guía y corregirla ante cada cambio de dependencias. | Ore Campos, Josef Pablo | Antes de cada demo; primera aplicación en el Sprint 4 | Comandos, versiones y resultado de arranque registrados. | Acordada |
| Rendimiento y datos sin validar: IMP-002/003 | Definir dataset reproducible, fuente sintética declarada y benchmark de rutas antes de comprometer rendimiento. | Rojas Peña, William Mikeiel | Antes de aceptar EN-01; primera aplicación en el Sprint 4 | Dataset identificado y medición P95, o brecha abierta con impacto. | Acordada |
| Integraciones sin revisión | Aplicar la política histórica de PR revisado y arquitectura hexagonal; registrar excepciones en decisiones. | Ore Campos, Josef Pablo | En cada integración, según política documentada; primera aplicación en el Sprint 4 | Revisión de un par y comprobación de dependencias; cumplimiento actual por verificar. | Acordada |

## Control de versiones del documento

| Versión | Fecha | Autoría / cambio |
|---|---|---|
| V_1_0_0 | 25/09/2026 | Equipo del proyecto. Emisión inicial. El 02/10/2026 se asignaron responsables y ramas `feature/*` sin cambio de versión (historial reconstruido desde Git). |
| V_1_1_0 | 09/10/2026 | Tovar Sánchez, Carlos Alberto. Se agregan la versión y la fecha de actualización, el seguimiento del estado de las seis acciones y dos notas aclaratorias (nomenclatura de ramas y cumplimiento de la política). El texto original se conserva. |
| V_1_2_0 | 29/10/2026 | Tovar Sánchez, Carlos Alberto. Se anota la actualización de la acción 4: el generador de base de pruebas ya está en `main`. |
| V_1_3_0 | 29/10/2026 | Rojas Camayo, Valentino Jhan Pierre (PR #25). Actualización documental; pendiente de revisión del equipo. Compromisos preventivos propuestos con problema, responsable pendiente, frecuencia y comprobación; fuentes históricas conservadas. |
| V_1_4_0 | 30/10/2026 | Tovar Sánchez, Carlos Alberto. Documento único vigente: se retira la carpeta Histórico; el historial queda en esta tabla. |


[← Volver al índice correspondiente](README.md)
