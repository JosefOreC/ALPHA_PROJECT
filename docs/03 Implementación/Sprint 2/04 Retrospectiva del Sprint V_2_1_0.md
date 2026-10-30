# Retrospectiva del Sprint — Sprint 2

**Proyecto:** EcoLogística Lima — DistriRápido S.A.C.

**Versión del documento:** V_2_1_0

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
| PR acumulados y cambios sin revisión: IMP-004/005 | Planificar revisores por entrega, revisar el incremento ya integrado y acordar protección de rama antes de la siguiente integración. | Responsable por confirmar | En cada entrega (propuesto); primera fecha por confirmar | Revisión independiente y regla de protección documentadas; sin presumir estado remoto. | Propuesta pendiente de confirmación |
| Documentos describían funciones ya implementadas: IMP-011 | Contrastar cada estado con el commit y distinguir implementación, ejecución y aceptación. | Responsable por confirmar | En cada actualización documental (propuesto); primera fecha por confirmar | Referencia de código y evidencia por criterio; comprobar enlaces con check_docs.py. | Propuesta pendiente de confirmación |
| Migración y recuperación sin evidencia: IMP-006 | Reservar verificación de base nueva, rollback, reinicio y restauración antes de cada demo de persistencia. | Responsable por confirmar | Antes de cada demo de persistencia (propuesto); primera fecha por confirmar | Log reproducible del entorno y resultado de recuperación. | Propuesta pendiente de confirmación |
| Identidad, permisos y seguridad se confundieron: IMP-007 | Revisar sesión y matriz RBAC por separado de los criterios completos EN-02; ejecutar rechazos por rol/recurso. | Responsable por confirmar | Antes de aceptar cambios de acceso (propuesto); primera fecha por confirmar | Matriz por rol, pruebas negativas y revisión de seguridad trazables. | Propuesta pendiente de confirmación |
| Base, .env y administrador no coincidían | Añadir al arranque la comprobación de destino de base, migración y existencia del administrador, sin publicar secretos. | Responsable por confirmar | Después de cambiar conexión y antes de demo (propuesto); primera fecha por confirmar | Lista de comprobación de conexión/cantidades sin credenciales; fuente: retrospectiva V_2_0_0. | Propuesta pendiente de confirmación |
| Datos sintéticos se confundían con operación: IMP-009 | Documentar origen y antigüedad de GPS/ETA y versionar factores ambientales; conciliar API, dashboard y CSV. | Responsable por confirmar | Antes de aceptar mapa o sostenibilidad (propuesto); primera fecha por confirmar | Contrato D-08 y factores/línea base con unidades y evidencia común. | Propuesta pendiente de confirmación |
| Cambios visuales causaban desbordamiento y filtros inconsistentes | Comprobar escenarios de filtros, selección, limpieza y mensajes largos en escritorio y móvil con lista/mapa sincronizados. | Responsable por confirmar | En cambios de mapa/UI (propuesto); primera fecha por confirmar | Evidencia a 390 px, resultados por filtro y evaluación accesible independiente. | Propuesta pendiente de confirmación |
| Una corrida dirigida se confundía con regresión completa | Registrar qué casos se ejecutaron, cuáles se omitieron y qué integraciones fueron sustituidas. | Responsable por confirmar | En cada registro de pruebas (propuesto); primera fecha por confirmar | Comando, commit, entorno, artefacto y límites; no extrapolar tests dirigidos. | Propuesta pendiente de confirmación |
| Motor y despacho seguían pendientes: IMP-003 | Dividir US-005 en motor, persistencia, aprobación y despacho, con dependencias y criterios antes del planning. | Responsable por confirmar | En planning de continuación de PMV-2 (propuesto); primera fecha por confirmar | Demo integrada pedido → ruta → despacho → entrega y benchmark trazable. | Propuesta pendiente de confirmación |
| Dependencias y proveedor cartográfico sin preparación operativa | Verificar instalación reproducible y registrar decisión de proveedor/límites de teselas antes del despliegue. | Responsable por confirmar | Antes de desplegar (propuesto); primera fecha por confirmar | Guía reproducida y decisión de proveedor, atribución y límites; no sustituirla por capturas. | Propuesta pendiente de confirmación |

### Seguimiento de acuerdos y antecedentes

- [04 Retrospectiva del Sprint V_1_3_0.md](Hist%C3%B3rico/04%20Retrospectiva%20del%20Sprint%20V_1_3_0.md): conserva aprendizajes detallados, observaciones, responsables/fechas propuestos y registro de cambios.
- [06 Retrospectiva del Sprint V_2_0_0.md](Hist%C3%B3rico/06%20Retrospectiva%20del%20Sprint%20V_2_0_0.md): conserva aprendizajes detallados, observaciones, responsables/fechas propuestos y registro de cambios.

V_2_1_0 consolida V_1_3_0 y V_2_0_0. La segunda aporta diagnóstico del administrador y conexión, datos sintéticos, prioridad de .env, filtros, prueba dirigida y conciliación ambiental; las acciones anteriores cubren esos problemas. Ninguna de las dos fuentes acredita ratificación de nuevas acciones por el equipo. El número V_2_0_0 era versión documental del Sprint 2, no un Sprint 3.

En la siguiente retrospectiva, registrar para cada acción confirmada: evidencia, resultado, obstáculo y próxima revisión. Esta tabla define cómo comprobar cumplimiento; no afirma que las acciones ya se cumplieron.

## Control de versiones del documento

| Versión | Fecha | Autoría / cambio |
|---|---|---|
| V_1_3_0 y antecedentes | Fechas en la fuente | Autoría y registro completos en [fuente histórica](Hist%C3%B3rico/04%20Retrospectiva%20del%20Sprint%20V_1_3_0.md). |
| V_2_0_0 y antecedentes | Fechas en la fuente | Autoría y registro completos en [fuente histórica](Hist%C3%B3rico/06%20Retrospectiva%20del%20Sprint%20V_2_0_0.md). |
| V_2_1_0 | 29/10/2026 | Actualización documental; pendiente de revisión del equipo. Compromisos preventivos propuestos con problema, responsable pendiente, frecuencia y comprobación; fuentes históricas conservadas. |


[← Volver al índice correspondiente](README.md)
