# Retrospectiva del sprint

**Nombre del Proyecto:** EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Líder del Proyecto:** Ore Campos, Josef Pablo

**Sprint:** Sprint 3 (10/10/2026 - 30/10/2026)

**Versión del documento:** V_1_2_0

**Actualización documental:** 29/10/2026. No es fecha de reunión ni de aceptación.

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
| Entregas sin revisor: IMP-012 | Registrar revisor distinto del autor antes de solicitar aceptación y revisar el código ya integrado. | Ore Campos, Josef Pablo | En cada entrega; primera aplicación en el Sprint 4 | Revisión asociada al commit y criterios, incluida disposición de PR. | Acordada |
| Sin feedback de stakeholders | Reservar demostración y recopilar decisión por historia con fecha y asistentes identificados. | Ore Campos, Josef Pablo | En cada review; primera aplicación en el Sprint 4 | Acta o registro atribuido con aceptación y pendientes explícitos. | Acordada |
| DoD incompleta | Usar una lista por historia que exija evidencia de cobertura, análisis, staging y escenarios antes de Done. | Cueva Ricse, Alex Roberto | Antes de mover una historia a Done; primera aplicación en el Sprint 4 | Todos los gates con artefactos o historia pendiente, sin excepciones tácitas. | Acordada |
| Jira y documentos discrepan: IMP-015 | Conciliar clave, asignación de sprint y estados antes de computar puntos. | Ore Campos, Josef Pablo | Antes del cierre; primera aplicación en el Sprint 4 | Correspondencia Jira ↔ historias ↔ commit sin doble conteo Sprint 2/3. | Acordada |
| Evaluaciones de calidad anunciadas sin resultados | Definir alcance de SonarQube/OWASP/WCAG con la consigna y conservar reportes solo después de ejecutarlos. | Tovar Sánchez, Carlos Alberto | Antes de aceptar EN-02/05; primera aplicación en el Sprint 4 | Herramienta, versión, commit, configuración y resultado real; no inferirlos de lint o capturas. | Acordada |
| US-010/011 carecen de evidencia completa: IMP-014 | Incluir periodo vacío, formato inválido, fronteras de fechas y medición P95 en el plan de aceptación. | Rojas Peña, William Mikeiel | En cada cambio de reportes; primera aplicación en el Sprint 4 | Resultados de matriz y conciliación de factores y CSV. | Acordada |
| Conectividad y seguridad incompletas: IMP-013 | Validar reintentos sin duplicados y escenarios de EN-02 antes de aceptar el flujo conductor. | Rojas Peña, William Mikeiel | Antes de aceptar EN-05/02; primera aplicación en el Sprint 4 | Prueba de conexión intermitente y evaluación de seguridad con datos minimizados. | Acordada |

## Control de versiones del documento

| Versión | Fecha | Autoría / cambio |
|---|---|---|
| V_1_0_0 | 29/10/2026 | Tovar Sánchez, Carlos Alberto. Emisión inicial de la retrospectiva del Sprint 3 con la plantilla oficial y acciones por dimensión con responsable, fecha y verificación propuestos. |
| V_1_1_0 | 29/10/2026 | Rojas Camayo, Valentino Jhan Pierre (PR #25). Actualización documental; pendiente de revisión del equipo. Compromisos preventivos propuestos con problema, responsable pendiente, frecuencia y comprobación; fuentes históricas conservadas. |
| V_1_2_0 | 30/10/2026 | Tovar Sánchez, Carlos Alberto. Documento único vigente: se retira la carpeta Histórico y se actualiza el alcance de las evaluaciones de calidad. |


[← Volver al índice correspondiente](README.md)
