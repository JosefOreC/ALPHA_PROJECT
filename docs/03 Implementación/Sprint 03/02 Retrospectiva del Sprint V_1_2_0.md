# Retrospectiva del Sprint — Sprint 3

**Proyecto:** EcoLogística Lima — DistriRápido S.A.C.

**Versión del documento:** V_1_2_0

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

- 02 Retrospectiva del Sprint V_1_0_0.md (ver el anexo de este documento): conserva aprendizajes detallados, observaciones, responsables/fechas propuestos y registro de cambios.

La fuente proponía nombres y fechas como 30/10/2026; su encabezado indica que no eran acuerdos confirmados. Se mantienen en el histórico y no se presentan aquí como compromisos reales. Las evaluaciones de calidad (SonarQube, OWASP y WCAG) están exigidas por la consigna del Sprint 3 y se documentan en los documentos 03, 04 y 05 de esta carpeta.

En la siguiente retrospectiva, registrar para cada acción confirmada: evidencia, resultado, obstáculo y próxima revisión. Esta tabla define cómo comprobar cumplimiento; no afirma que las acciones ya se cumplieron.

## Anexo — Edición anterior V_1_0_0 (conservada como antecedente)

Texto de la edición anterior; se conserva su contenido y sus cifras con la fecha de esa edición. Solo se ajustaron enlaces y niveles de encabezado. El estado vigente es el de las secciones anteriores de este documento.

> **HISTÓRICO — no vigente.** Contenido previo conservado; solo se ajustan navegación y enlaces. Las cifras, fechas, responsables y cierres son registros atribuidos al autor indicado; no se reejecutaron ni se ratificaron en esta revisión documental. Vigente: [02 Retrospectiva del Sprint V_1_1_0](02%20Retrospectiva%20del%20Sprint%20V_1_2_0.md).

### Retrospectiva del sprint

**Nombre del Proyecto:** EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Líder del Proyecto:** Ore Campos, Josef Pablo

**Sprint:** Sprint 3 — Mapa, indicadores (10/10/2026 - 30/10/2026)

**Versión del documento:** V_1_0_0

**Última actualización:** 29/10/2026

> Borrador del autor basado en la evidencia del repositorio. Las acciones y responsables son propuestas que se confirman con el equipo en la reunión de retrospectiva; este documento no registra acuerdos que todavía no tienen evidencia.

#### ¿Qué aprendimos?

- Rediseñar la interfaz completa con un sistema de diseño y componentes compartidos acelera las pantallas posteriores, pero concentra muchos cambios en una pila de Pull Request (#12 a #21) que sigue sin revisar.
- Una funcionalidad implementada no equivale a una historia terminada: US-010, US-011 y EN-05 no cumplen la Definition of Done porque faltan cobertura medida, revisión de un par, verificación de sus escenarios Gherkin y análisis estático.
- Los documentos de estado quedan desactualizados en horas si no se contrastan con `main`: los del Sprint 2 afirmaban que la autenticación y la persistencia estaban pendientes cuando ya estaban integradas. Se corrigieron en nuevas versiones.
- La seguridad (EN-02) no se puede dejar para el final del sprint: sin cabeceras, auditoría anonimizada ni bloqueo de inyección, la evaluación OWASP saldrá con hallazgos.

#### ¿Qué estamos haciendo bien?

- Cada pantalla se entregó en su propio Pull Request, como exige la política de ramas, con pruebas y lint en cada una.
- Las cifras de pruebas se reportan con su fecha y su commit: 273 Vitest, 9 Node y 40 de navegador en frontend, y 225 pruebas en backend el 29/10/2026.
- Los documentos distinguen lo implementado de lo aceptado y marcan lo no verificado, sin presentar datos sintéticos como operación real.
- Los documentos de los Sprints 1 y 2 se versionaron con historial de cambios y se corrigieron contra el código.

#### ¿Qué podemos hacer mejor?

##### Personas

Varios Pull Request siguen sin revisor y cambios de seguridad entraron sin revisión. Cada entrega necesita un revisor distinto de quien la implementó, y las asignaciones deben quedar escritas.

##### Relaciones

Acordar con Josef, Alex, Valentino y William cómo se integra el código a `main`: el 09/10 entraron cambios de autenticación y persistencia sin Pull Request, y desde el 10/10 los commits en `main` son solo documentación. Realizar la demostración a los stakeholders y registrar su retroalimentación.

##### Procesos

Aplicar la Definition of Done antes de declarar una actividad terminada, conciliar Jira y GitHub antes de cerrar el sprint, corregir la clave del proyecto en los artefactos (`ELODRSPDSC`) y contrastar cada documento de estado con `main` antes de publicarlo.

##### Herramientas

Incorporar SonarQube o SonarCloud, la medición de cobertura (`pytest-cov` y `@vitest/coverage`) y una herramienta de accesibilidad (Lighthouse o axe) al flujo de revisión, hoy inexistentes, y un pipeline de integración continua (no existe `.github/`).

##### Acciones a realizar

| # | Dimensión | Acción concreta | Responsable propuesto | Fecha propuesta | Cómo comprobar la mejora |
|---|---|---|---|---|---|
| 1 | Personas | Asignar un revisor distinto del autor a cada PR (#11 y #12 a #21) y registrarlo en el PR. | Ore Campos, Josef Pablo | 30/10/2026 | Cada PR tiene un revisor asignado y una aprobación o un cierre con motivo. |
| 2 | Relaciones | Realizar la demostración a los stakeholders y completar el registro de la Revisión (fecha, asistentes y decisión). | Tovar Sánchez, Carlos Alberto | 30/10/2026 | La sección «Registro de la demostración» sin campos «Por registrar». |
| 3 | Relaciones | Acordar por escrito que todo cambio llega a `main` por Pull Request y activar la protección de la rama. | Ore Campos, Josef Pablo | 30/10/2026 | La consulta de protección de `main` devuelve la regla y un commit directo es rechazado. |
| 4 | Procesos | Verificar cada actividad contra la DoD y los escenarios Gherkin antes de moverla a «Listo» en Jira. | Tovar Sánchez, Carlos Alberto | Siguiente sprint | La tabla de DoD de la Revisión con cada criterio en «Cumple» o con su pendiente explícito. |
| 5 | Procesos | Agregar los mensajes de «sin registros» y «formato no soportado» a US-010 y US-011 y medir el P95 del reporte. | Rojas Peña, William Mikeiel | Siguiente sprint | Prueba automática de ambos mensajes y medición documentada frente a 1,5 s. |
| 6 | Herramientas | Configurar SonarQube o SonarCloud y la cobertura de backend y frontend, y registrar el Quality Gate. | Tovar Sánchez, Carlos Alberto | 30/10/2026 | Documentos 03 y 04 con cobertura, duplicación y las 10 categorías OWASP 2025 completadas. |
| 7 | Herramientas | Ejecutar Lighthouse o axe sobre las pantallas por rol y corregir los hallazgos de la vista del conductor. | Rojas Camayo, Valentino Jhan Pierre | 30/10/2026 | Documento 05 con la tabla de hallazgos y correcciones, y sin fallos críticos en la vista del conductor. |
| 8 | Herramientas | Completar EN-02 sobre `main`: cabeceras de seguridad, auditoría anonimizada y bloqueo y notificación de inyección SQL. | Ore Campos, Josef Pablo | Siguiente sprint | Pruebas automáticas de los escenarios de EN-02 y reducción de los hallazgos de OWASP. |

## Control de versiones del documento

| Versión | Fecha | Autoría / cambio |
|---|---|---|
| V_1_0_0 | 29/10/2026 | Tovar Sánchez, Carlos Alberto. Emisión inicial de la retrospectiva del Sprint 3 con la plantilla oficial y acciones por dimensión con responsable, fecha y verificación propuestos. |
| V_1_1_0 | 29/10/2026 | Rojas Camayo, Valentino Jhan Pierre (PR #25). Actualización documental; pendiente de revisión del equipo. Compromisos preventivos propuestos con problema, responsable pendiente, frecuencia y comprobación; fuentes históricas conservadas. |
| V_1_2_0 | 30/10/2026 | Tovar Sánchez, Carlos Alberto. Documento único vigente: se integra la retrospectiva anterior como anexo, se retira la carpeta Histórico y se actualiza el alcance de las evaluaciones de calidad. |


[← Volver al índice correspondiente](README.md)
