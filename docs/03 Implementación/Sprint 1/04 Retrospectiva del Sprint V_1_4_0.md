# Retrospectiva del Sprint — Sprint 1

**Proyecto:** EcoLogística Lima — DistriRápido S.A.C.

**Versión del documento:** V_1_4_0

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

- 04 Retrospectiva del Sprint V_1_2_0.md (ver el anexo de este documento): conserva aprendizajes detallados, observaciones, responsables/fechas propuestos y registro de cambios.

La fuente V_1_2_0, sección «Personas», declara responsables confirmados por módulo y «Procesos» declara política adoptada: PR revisado por un par y arquitectura hexagonal. Se conservan como acuerdos documentados atribuidos a esa fuente. Su cumplimiento y cualquier asignación futura siguen por confirmar; no se reemplazan por los responsables genéricos de propuestas nuevas. Las seis acciones originales y sus estados permanecen en «Seguimiento de las acciones» del histórico.

En la siguiente retrospectiva, registrar para cada acción confirmada: evidencia, resultado, obstáculo y próxima revisión. Esta tabla define cómo comprobar cumplimiento; no afirma que las acciones ya se cumplieron.

## Anexo — Edición anterior V_1_2_0 (conservada como antecedente)

Texto de la edición anterior; se conserva su contenido y sus cifras con la fecha de esa edición. Solo se ajustaron enlaces y niveles de encabezado. El estado vigente es el de las secciones anteriores de este documento.

> **HISTÓRICO — no vigente.** Contenido previo conservado; solo se ajustan navegación y enlaces. Las cifras, fechas, responsables y cierres son registros atribuidos al autor indicado; no se reejecutaron ni se ratificaron en esta revisión documental. Vigente: [04 Retrospectiva del Sprint V_1_3_0](04%20Retrospectiva%20del%20Sprint%20V_1_4_0.md).

### Retrospectiva del Sprint

**Nombre del Proyecto:** EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Líder del Proyecto:** Ore Campos, Josef Pablo

**Sprint:** Sprint 1

**Versión del documento:** V_1_2_0

**Última actualización:** 29/10/2026

> El contenido de las secciones originales se conserva tal como se redactó (con la actualización del 02/10/2026). La versión V_1_1_0 agrega el seguimiento del estado de cada acción al 09/10/2026 y algunas notas aclaratorias, marcadas como tales.

#### ¿Qué aprendimos?

- El problema logístico requiere combinar requisitos operativos, restricciones locales de Lima y objetivos ambientales.
- La documentación de requisitos debe mantenerse alineada con Jira y con la futura implementación para evitar declarar como terminado algo que solo está diseñado.
- El algoritmo VRPTW/Green VRP debe validarse progresivamente con datos de prueba y métricas de rendimiento.

#### ¿Qué estamos haciendo bien?

- Se consolidó una base documental amplia para el proyecto: visión, acta, interesados, requisitos, usuarios, reglas, tecnología, base de datos, arquitectura, riesgos y presupuesto.
- Se adoptó un enfoque ágil con cuatro sprints y una estructura de épicas, historias de usuario, criterios Gherkin y Definition of Done.
- Se identificaron desde el inicio las obligaciones de seguridad, privacidad, accesibilidad, sostenibilidad y escalabilidad.

#### ¿Qué podemos hacer mejor?

##### Personas

Responsables confirmados por módulo para el presente incremento:

| Responsable | Rama | Alcance |
|---|---|---|
| Cueva Ricse, Alex Roberto | `feature/alex/spr1/m_conductor/crud` | CRUD del módulo Conductor. |
| Tovar Sánchez, Carlos Alberto | `feature/carlos/spr2/m_pedidos/confirmacion` | Accionar e interfaz, en el rol Conductor, para la vista y confirmación de un pedido. |
| Rojas Camayo, Valentino Jhan Pierre | `feature/valentino/spr2/m_pedidos/crud` | CRUD y vista del módulo Pedido en los roles correspondientes a esta tarea (aún no existe rol Cliente). |
| Ore Campos, Josef Pablo | `feature/josef/spr2/m_vehiculos/crud` | Formulario de creación, edición y listado de Vehículos. |
| Rojas Peña, William Mikeiel | `feature/william/spr2/dashboard` | Interfaz y creación de los puertos de extracción de los datos a mostrar en el Dashboard. |

> **Nota (V_1_1_0):** la rama de conductores usa `spr1` mientras las demás usan `spr2`, aunque corresponden al mismo incremento. Ver el hallazgo H-08 de la auditoría de coherencia del Sprint 2.

##### Relaciones

Establecer una reunión breve de sincronización y un canal único para registrar decisiones, dudas y cambios aprobados por el equipo.

##### Procesos

Definir una política de ramas, revisión por pull request, criterios de terminado y una actualización semanal coordinada entre Jira y GitHub.

**Política de ramas adoptada:**

- Nomenclatura obligatoria: `feature/<persona>/spr<N>/<módulo>/<acción>` (ver tabla de la sección "Personas").
- Ninguna rama `feature/*` se integra directamente a `main`; todo cambio llega a `main` mediante Pull Request revisado por al menos un par técnico.
- Se exige respetar las reglas de la **arquitectura hexagonal** ya definida en el documento `12. Modelo C4`: el dominio no depende de frameworks ni de infraestructura, y toda integración externa (BD, APIs de mapas/tráfico) se realiza a través de puertos y adaptadores.

> **Nota (V_1_1_0):** al 09/10/2026 la política no se cumple por completo: `main` tiene commits directos sin Pull Request, existen ramas fuera de la nomenclatura y no se pudo verificar la protección de la rama (auditoría de coherencia, hallazgo H-08).

##### Herramientas

Completar la configuración de Jira, preparar el entorno local, crear la estructura `src/frontend/` y `src/backend/`, y validar el `.gitignore` antes de incorporar dependencias.

##### Acciones a realizar

1. ~~Confirmar responsables y tareas del siguiente incremento.~~ **Resuelto:** ver tabla de la sección "Personas".
2. Cerrar las decisiones técnicas pendientes (stack tecnológico, doc. 10).
3. Crear el esqueleto inicial de frontend y backend sobre la arquitectura hexagonal, respetando las ramas `feature/*` asignadas.
4. Preparar un dataset sintético para las primeras pruebas de rutas.
5. Coordinar a Carlos y Valentino para unificar la clase de dominio `Pedido` antes de abrir sus respectivos Pull Request.
6. Revisar semanalmente la trazabilidad entre Jira, GitHub y los documentos del proyecto.

##### Seguimiento de las acciones (agregado en V_1_1_0, estado al 09/10/2026)

| # | Acción | Estado | Evidencia |
|---|---|---|---|
| 1 | Confirmar responsables y tareas del siguiente incremento. | Resuelto | Tabla de la sección «Personas». |
| 2 | Cerrar las decisiones técnicas pendientes (stack, doc. 10). | Resuelto en el documento 10 y en el código; el README conserva el texto anterior de «decisión pendiente». | Documento 10 (Alternativa B: FastAPI + React + PostgreSQL); código de `src/`. |
| 3 | Crear el esqueleto de frontend y backend con arquitectura hexagonal. | Resuelto el 30/09/2026. | Commits `9bf7a5a` y `e8ff9bc`. |
| 4 | Preparar un dataset sintético para las pruebas de rutas. | Parcial: no hay dataset de rutas en `main`; un generador de base de pruebas está en la rama `feature/josef/spr2/auth`, sin integrar. *(Actualización 29/10/2026: el generador `create_test_db.py` está en `main`, sin Pull Request.)* | Rama `feature/josef/spr2/auth`. |
| 5 | Unificar la clase de dominio `Pedido` antes de abrir los Pull Request. | En el código existe una sola entidad `Order` (`domain/entities/order.py`) y la gestión añade sus datos en `order_management.py`; no hay un acuerdo documentado. | Código del backend en `main`. |
| 6 | Revisar semanalmente la trazabilidad entre Jira, GitHub y los documentos. | Pendiente: Jira no se ha conciliado con el repositorio. | Auditoría de coherencia del Sprint 2, H-14. |

## Control de versiones del documento

| Versión | Fecha | Autoría / cambio |
|---|---|---|
| V_1_0_0 | 25/09/2026 | Equipo del proyecto. Emisión inicial. El 02/10/2026 se asignaron responsables y ramas `feature/*` sin cambio de versión (historial reconstruido desde Git). |
| V_1_1_0 | 09/10/2026 | Tovar Sánchez, Carlos Alberto. Se agregan la versión y la fecha de actualización, el seguimiento del estado de las seis acciones y dos notas aclaratorias (nomenclatura de ramas y cumplimiento de la política). El texto original se conserva. |
| V_1_2_0 | 29/10/2026 | Tovar Sánchez, Carlos Alberto. Se anota la actualización de la acción 4: el generador de base de pruebas ya está en `main`. |
| V_1_3_0 | 29/10/2026 | Rojas Camayo, Valentino Jhan Pierre (PR #25). Actualización documental; pendiente de revisión del equipo. Compromisos preventivos propuestos con problema, responsable pendiente, frecuencia y comprobación; fuentes históricas conservadas. |
| V_1_4_0 | 30/10/2026 | Tovar Sánchez, Carlos Alberto. Documento único vigente: se integra la edición anterior como anexo y se retira la carpeta Histórico. |


[← Volver al índice correspondiente](README.md)
