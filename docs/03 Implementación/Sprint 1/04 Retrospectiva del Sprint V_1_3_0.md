# Retrospectiva del Sprint — Sprint 1

**Proyecto:** EcoLogística Lima — DistriRápido S.A.C.

**Versión del documento:** V_1_3_0

**Actualización documental:** 29/10/2026. No es fecha de reunión ni de aceptación.

**Estado:** propuesta de compromisos preventivos para confirmar con el equipo. No se registra una nueva reunión.

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

| Problema | Acción preventiva | Responsable | Fecha o frecuencia | Comprobación del cumplimiento | Estado de confirmación |
|---|---|---|---|---|---|
| Responsabilidades difusas al inicio | Antes de iniciar otro incremento, ratificar por escrito alcance y capacidad de cada módulo y registrar cambios respecto de la tabla histórica. | Responsable por confirmar | En cada planning (propuesto); primera fecha por confirmar | Tabla de responsables ratificada y tareas con dueño; la tabla histórica no confirma capacidad futura. | Propuesta pendiente de confirmación |
| Documentación y Jira divergen | Conciliar semanalmente ID, criterio, sprint y evidencia antes de mover tarjetas a Done. | Responsable por confirmar | Semanal y antes de cada cierre (propuesto); primera fecha por confirmar | Registro de diferencias, enlaces a evidencia y decisión por historia. | Propuesta pendiente de confirmación |
| Decisiones de stack y contratos se duplican | Registrar decisión única y enlazarla desde cada tarea; revisar contrato Pedido antes de cambios entre módulos. | Responsable por confirmar | Antes de modificar contratos (propuesto); primera fecha por confirmar | Decisión referenciada y revisión de compatibilidad; D-04 explícita. | Propuesta pendiente de confirmación |
| Entorno y estructura retrasaron el inicio: IMP-001 | Comprobar arranque desde una instalación limpia siguiendo la guía y corregirla ante cada cambio de dependencias. | Responsable por confirmar | Antes de cada demo (propuesto); primera fecha por confirmar | Comandos, versiones y resultado de arranque registrados. | Propuesta pendiente de confirmación |
| Rendimiento y datos sin validar: IMP-002/003 | Definir dataset reproducible, fuente sintética declarada y benchmark de rutas antes de comprometer rendimiento. | Responsable por confirmar | Antes de aceptar EN-01 (propuesto); primera fecha por confirmar | Dataset identificado y medición P95, o brecha abierta con impacto. | Propuesta pendiente de confirmación |
| Integraciones sin revisión | Aplicar la política histórica de PR revisado y arquitectura hexagonal; registrar excepciones en decisiones. | Responsable por confirmar | En cada integración, según política documentada; primera fecha por confirmar | Revisión de un par y comprobación de dependencias; cumplimiento actual por verificar. | Propuesta pendiente de confirmación |

### Seguimiento de acuerdos y antecedentes

- [04 Retrospectiva del Sprint V_1_2_0.md](Hist%C3%B3rico/04%20Retrospectiva%20del%20Sprint%20V_1_2_0.md): conserva aprendizajes detallados, observaciones, responsables/fechas propuestos y registro de cambios.

La fuente V_1_2_0, sección «Personas», declara responsables confirmados por módulo y «Procesos» declara política adoptada: PR revisado por un par y arquitectura hexagonal. Se conservan como acuerdos documentados atribuidos a esa fuente. Su cumplimiento y cualquier asignación futura siguen por confirmar; no se reemplazan por los responsables genéricos de propuestas nuevas. Las seis acciones originales y sus estados permanecen en «Seguimiento de las acciones» del histórico.

En la siguiente retrospectiva, registrar para cada acción confirmada: evidencia, resultado, obstáculo y próxima revisión. Esta tabla define cómo comprobar cumplimiento; no afirma que las acciones ya se cumplieron.

## Control de versiones del documento

| Versión | Fecha | Autoría / cambio |
|---|---|---|
| V_1_2_0 y antecedentes | Fechas en la fuente | Autoría y registro completos en [fuente histórica](Hist%C3%B3rico/04%20Retrospectiva%20del%20Sprint%20V_1_2_0.md). |
| V_1_3_0 | 29/10/2026 | Actualización documental; pendiente de revisión del equipo. Compromisos preventivos propuestos con problema, responsable pendiente, frecuencia y comprobación; fuentes históricas conservadas. |


[← Volver al índice correspondiente](README.md)
