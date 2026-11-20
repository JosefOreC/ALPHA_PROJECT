# Retrospectiva del Sprint — Sprint 2

**Proyecto:** EcoLogística Lima — DistriRápido S.A.C.

**Versión del documento:** V_2_2_0

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
| PR acumulados y cambios sin revisión: IMP-004/005 | Planificar revisores por entrega, revisar el incremento ya integrado y acordar protección de rama antes de la siguiente integración. | Ore Campos, Josef Pablo | En cada entrega; primera aplicación en el Sprint 4 | Revisión independiente y regla de protección documentadas; sin presumir estado remoto. | Acordada |
| Documentos describían funciones ya implementadas: IMP-011 | Contrastar cada estado con el commit y distinguir implementación, ejecución y aceptación. | Cueva Ricse, Alex Roberto | En cada actualización documental; primera aplicación en el Sprint 4 | Referencia de código y evidencia por criterio; comprobar enlaces con check_docs.py. | Acordada |
| Migración y recuperación sin evidencia: IMP-006 | Reservar verificación de base nueva, rollback, reinicio y restauración antes de cada demo de persistencia. | Tovar Sánchez, Carlos Alberto | Antes de cada demo de persistencia; primera aplicación en el Sprint 4 | Log reproducible del entorno y resultado de recuperación. | Acordada |
| Identidad, permisos y seguridad se confundieron: IMP-007 | Revisar sesión y matriz RBAC por separado de los criterios completos EN-02; ejecutar rechazos por rol/recurso. | Rojas Peña, William Mikeiel | Antes de aceptar cambios de acceso; primera aplicación en el Sprint 4 | Matriz por rol, pruebas negativas y revisión de seguridad trazables. | Acordada |
| Base, .env y administrador no coincidían | Añadir al arranque la comprobación de destino de base, migración y existencia del administrador, sin publicar secretos. | Tovar Sánchez, Carlos Alberto | Después de cambiar conexión y antes de demo; primera aplicación en el Sprint 4 | Lista de comprobación de conexión/cantidades sin credenciales; fuente: retrospectiva V_2_0_0. | Acordada |
| Datos sintéticos se confundían con operación: IMP-009 | Documentar origen y antigüedad de GPS/ETA y versionar factores ambientales; conciliar API, dashboard y CSV. | Rojas Peña, William Mikeiel | Antes de aceptar mapa o sostenibilidad; primera aplicación en el Sprint 4 | Contrato D-08 y factores/línea base con unidades y evidencia común. | Acordada |
| Cambios visuales causaban desbordamiento y filtros inconsistentes | Comprobar escenarios de filtros, selección, limpieza y mensajes largos en escritorio y móvil con lista/mapa sincronizados. | Rojas Camayo, Valentino Jhan Pierre | En cambios de mapa/UI; primera aplicación en el Sprint 4 | Evidencia a 390 px, resultados por filtro y evaluación accesible independiente. | Acordada |
| Una corrida dirigida se confundía con regresión completa | Registrar qué casos se ejecutaron, cuáles se omitieron y qué integraciones fueron sustituidas. | Cueva Ricse, Alex Roberto | En cada registro de pruebas; primera aplicación en el Sprint 4 | Comando, commit, entorno, artefacto y límites; no extrapolar tests dirigidos. | Acordada |
| Motor y despacho seguían pendientes: IMP-003 | Dividir US-005 en motor, persistencia, aprobación y despacho, con dependencias y criterios antes del planning. | Rojas Peña, William Mikeiel | En planning de continuación de PMV-2; primera aplicación en el Sprint 4 | Demo integrada pedido → ruta → despacho → entrega y benchmark trazable. | Acordada |
| Dependencias y proveedor cartográfico sin preparación operativa | Verificar instalación reproducible y registrar decisión de proveedor/límites de teselas antes del despliegue. | Ore Campos, Josef Pablo | Antes de desplegar; primera aplicación en el Sprint 4 | Guía reproducida y decisión de proveedor, atribución y límites; no sustituirla por capturas. | Acordada |

## Control de versiones del documento

| Versión | Fecha | Autoría / cambio |
|---|---|---|
| V_1_0_0 | 09/10/2026 | Tovar Sánchez, Carlos Alberto. Retrospectiva del Sprint 2 con aprendizajes, aciertos, mejoras por categoría y acciones propuestas pendientes de confirmar. |
| V_1_1_0 | 09/10/2026 | Tovar Sánchez, Carlos Alberto. Se unifica con la retrospectiva de la rama `feature/josef/spr2/auth` (mapa visual, autorización por roles y base de pruebas): una sola tabla de responsables, aprendizajes integrados y acciones sin duplicados. |
| V_1_2_0 | 09/10/2026 | Tovar Sánchez, Carlos Alberto. Se actualizan los enlaces y se registra que los documentos del Sprint 1 ya fueron corregidos. |
| V_1_3_0 | 29/10/2026 | Tovar Sánchez, Carlos Alberto. Corrige afirmaciones que `main` ya contradecía (autenticación, persistencia y API única integradas; ramas de Josef en `main` sin Pull Request), actualiza las cifras de pruebas del 29/10, los procesos y tres acciones, y agrega el aprendizaje sobre contrastar los documentos con `main`. |
| V_1_0_0 | 09/10/2026 | Retrospectiva de la rama `feature/josef/spr2/auth`. Aprendizajes iniciales sobre mapa, roles y preparación de datos. |
| V_2_0_0 | 09/10/2026 | Incorpora diagnóstico del login y entorno, persistencia, administración, distribución visual y filtros; revisa aprendizajes y acciones siguientes. |
| V_2_1_0 | 29/10/2026 | Rojas Camayo, Valentino Jhan Pierre (PR #25). Actualización documental; pendiente de revisión del equipo. Compromisos preventivos propuestos con problema, responsable pendiente, frecuencia y comprobación; fuentes históricas conservadas. |
| V_2_2_0 | 30/10/2026 | Tovar Sánchez, Carlos Alberto. Documento único vigente: se unifican las dos retrospectivas anteriores y se retira la carpeta Histórico. |


[← Volver al índice correspondiente](README.md)
