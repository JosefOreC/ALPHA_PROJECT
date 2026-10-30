# Retrospectiva del Sprint — Sprint 3

**Proyecto:** EcoLogística Lima — DistriRápido S.A.C.

**Versión del documento:** V_1_1_0

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
| Entregas sin revisor: IMP-012 | Registrar revisor distinto del autor antes de solicitar aceptación y revisar el código ya integrado. | Responsable por confirmar | En cada entrega (propuesto); primera fecha por confirmar | Revisión asociada al commit y criterios, incluida disposición de PR. | Propuesta pendiente de confirmación |
| Sin feedback de stakeholders | Reservar demostración y recopilar decisión por historia con fecha y asistentes identificados. | Responsable por confirmar | En cada review (propuesto); primera fecha por confirmar | Acta o registro atribuido con aceptación y pendientes explícitos. | Propuesta pendiente de confirmación |
| DoD incompleta | Usar una lista por historia que exija evidencia de cobertura, análisis, staging y escenarios antes de Done. | Responsable por confirmar | Antes de mover una historia a Done (propuesto); primera fecha por confirmar | Todos los gates con artefactos o historia pendiente, sin excepciones tácitas. | Propuesta pendiente de confirmación |
| Jira y documentos discrepan: IMP-015 | Conciliar clave, asignación de sprint y estados antes de computar puntos. | Responsable por confirmar | Antes del cierre (propuesto); primera fecha por confirmar | Correspondencia Jira ↔ historias ↔ commit sin doble conteo Sprint 2/3. | Propuesta pendiente de confirmación |
| Evaluaciones de calidad anunciadas sin resultados | Definir alcance de SonarQube/OWASP/WCAG con la consigna y conservar reportes solo después de ejecutarlos. | Responsable por confirmar | Antes de aceptar EN-02/05 (propuesto); primera fecha por confirmar | Herramienta, versión, commit, configuración y resultado real; no inferirlos de lint o capturas. | Propuesta pendiente de confirmación |
| US-010/011 carecen de evidencia completa: IMP-014 | Incluir periodo vacío, formato inválido, fronteras de fechas y medición P95 en el plan de aceptación. | Responsable por confirmar | En cada cambio de reportes (propuesto); primera fecha por confirmar | Resultados de matriz y conciliación de factores y CSV. | Propuesta pendiente de confirmación |
| Conectividad y seguridad incompletas: IMP-013 | Validar reintentos sin duplicados y escenarios de EN-02 antes de aceptar el flujo conductor. | Responsable por confirmar | Antes de aceptar EN-05/02 (propuesto); primera fecha por confirmar | Prueba de conexión intermitente y evaluación de seguridad con datos minimizados. | Propuesta pendiente de confirmación |

### Seguimiento de acuerdos y antecedentes

- [02 Retrospectiva del Sprint V_1_0_0.md](Hist%C3%B3rico/02%20Retrospectiva%20del%20Sprint%20V_1_0_0.md): conserva aprendizajes detallados, observaciones, responsables/fechas propuestos y registro de cambios.

La fuente proponía nombres y fechas como 30/10/2026; su encabezado indica que no eran acuerdos confirmados. Se mantienen en el histórico y no se presentan aquí como compromisos reales. Falta confirmar si los apartados de evaluaciones son exigidos por la consigna completa.

En la siguiente retrospectiva, registrar para cada acción confirmada: evidencia, resultado, obstáculo y próxima revisión. Esta tabla define cómo comprobar cumplimiento; no afirma que las acciones ya se cumplieron.

## Control de versiones del documento

| Versión | Fecha | Autoría / cambio |
|---|---|---|
| V_1_0_0 y antecedentes | Fechas en la fuente | Autoría y registro completos en [fuente histórica](Hist%C3%B3rico/02%20Retrospectiva%20del%20Sprint%20V_1_0_0.md). |
| V_1_1_0 | 29/10/2026 | Actualización documental; pendiente de revisión del equipo. Compromisos preventivos propuestos con problema, responsable pendiente, frecuencia y comprobación; fuentes históricas conservadas. |


[← Volver al índice correspondiente](README.md)
