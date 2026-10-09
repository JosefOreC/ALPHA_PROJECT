# Retrospectiva del Sprint

**Nombre del Proyecto:** EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Líder del Proyecto:** Ore Campos, Josef Pablo

**Sprint:** Sprint 1

**Versión del documento:** V_1_1_0

**Última actualización:** 09/10/2026

> El contenido de las secciones originales se conserva tal como se redactó (con la actualización del 02/10/2026). La versión V_1_1_0 agrega el seguimiento del estado de cada acción al 09/10/2026 y algunas notas aclaratorias, marcadas como tales.

## ¿Qué aprendimos?

- El problema logístico requiere combinar requisitos operativos, restricciones locales de Lima y objetivos ambientales.
- La documentación de requisitos debe mantenerse alineada con Jira y con la futura implementación para evitar declarar como terminado algo que solo está diseñado.
- El algoritmo VRPTW/Green VRP debe validarse progresivamente con datos de prueba y métricas de rendimiento.

## ¿Qué estamos haciendo bien?

- Se consolidó una base documental amplia para el proyecto: visión, acta, interesados, requisitos, usuarios, reglas, tecnología, base de datos, arquitectura, riesgos y presupuesto.
- Se adoptó un enfoque ágil con cuatro sprints y una estructura de épicas, historias de usuario, criterios Gherkin y Definition of Done.
- Se identificaron desde el inicio las obligaciones de seguridad, privacidad, accesibilidad, sostenibilidad y escalabilidad.

## ¿Qué podemos hacer mejor?

### Personas

Responsables confirmados por módulo para el presente incremento:

| Responsable | Rama | Alcance |
|---|---|---|
| Cueva Ricse, Alex Roberto | `feature/alex/spr1/m_conductor/crud` | CRUD del módulo Conductor. |
| Tovar Sánchez, Carlos Alberto | `feature/carlos/spr2/m_pedidos/confirmacion` | Accionar e interfaz, en el rol Conductor, para la vista y confirmación de un pedido. |
| Rojas Camayo, Valentino Jhan Pierre | `feature/valentino/spr2/m_pedidos/crud` | CRUD y vista del módulo Pedido en los roles correspondientes a esta tarea (aún no existe rol Cliente). |
| Ore Campos, Josef Pablo | `feature/josef/spr2/m_vehiculos/crud` | Formulario de creación, edición y listado de Vehículos. |
| Rojas Peña, William Mikeiel | `feature/william/spr2/dashboard` | Interfaz y creación de los puertos de extracción de los datos a mostrar en el Dashboard. |

> **Nota (V_1_1_0):** la rama de conductores usa `spr1` mientras las demás usan `spr2`, aunque corresponden al mismo incremento. Ver el hallazgo H-08 de la auditoría de coherencia del Sprint 2.

### Relaciones

Establecer una reunión breve de sincronización y un canal único para registrar decisiones, dudas y cambios aprobados por el equipo.

### Procesos

Definir una política de ramas, revisión por pull request, criterios de terminado y una actualización semanal coordinada entre Jira y GitHub.

**Política de ramas adoptada:**

- Nomenclatura obligatoria: `feature/<persona>/spr<N>/<módulo>/<acción>` (ver tabla de la sección "Personas").
- Ninguna rama `feature/*` se integra directamente a `main`; todo cambio llega a `main` mediante Pull Request revisado por al menos un par técnico.
- Se exige respetar las reglas de la **arquitectura hexagonal** ya definida en el documento `12. Modelo C4`: el dominio no depende de frameworks ni de infraestructura, y toda integración externa (BD, APIs de mapas/tráfico) se realiza a través de puertos y adaptadores.

> **Nota (V_1_1_0):** al 09/10/2026 la política no se cumple por completo: `main` tiene commits directos sin Pull Request, existen ramas fuera de la nomenclatura y no se pudo verificar la protección de la rama (auditoría de coherencia, hallazgo H-08).

### Herramientas

Completar la configuración de Jira, preparar el entorno local, crear la estructura `src/frontend/` y `src/backend/`, y validar el `.gitignore` antes de incorporar dependencias.

### Acciones a realizar

1. ~~Confirmar responsables y tareas del siguiente incremento.~~ **Resuelto:** ver tabla de la sección "Personas".
2. Cerrar las decisiones técnicas pendientes (stack tecnológico, doc. 10).
3. Crear el esqueleto inicial de frontend y backend sobre la arquitectura hexagonal, respetando las ramas `feature/*` asignadas.
4. Preparar un dataset sintético para las primeras pruebas de rutas.
5. Coordinar a Carlos y Valentino para unificar la clase de dominio `Pedido` antes de abrir sus respectivos Pull Request.
6. Revisar semanalmente la trazabilidad entre Jira, GitHub y los documentos del proyecto.

### Seguimiento de las acciones (agregado en V_1_1_0, estado al 09/10/2026)

| # | Acción | Estado | Evidencia |
|---|---|---|---|
| 1 | Confirmar responsables y tareas del siguiente incremento. | Resuelto | Tabla de la sección «Personas». |
| 2 | Cerrar las decisiones técnicas pendientes (stack, doc. 10). | Resuelto en el documento 10 y en el código; el README conserva el texto anterior de «decisión pendiente». | Documento 10 (Alternativa B: FastAPI + React + PostgreSQL); código de `src/`. |
| 3 | Crear el esqueleto de frontend y backend con arquitectura hexagonal. | Resuelto el 30/09/2026. | Commits `9bf7a5a` y `e8ff9bc`. |
| 4 | Preparar un dataset sintético para las pruebas de rutas. | Parcial: no hay dataset de rutas en `main`; un generador de base de pruebas está en la rama `feature/josef/spr2/auth`, sin integrar. | Rama `feature/josef/spr2/auth`. |
| 5 | Unificar la clase de dominio `Pedido` antes de abrir los Pull Request. | En el código existe una sola entidad `Order` (`domain/entities/order.py`) y la gestión añade sus datos en `order_management.py`; no hay un acuerdo documentado. | Código del backend en `main`. |
| 6 | Revisar semanalmente la trazabilidad entre Jira, GitHub y los documentos. | Pendiente: Jira no se ha conciliado con el repositorio. | Auditoría de coherencia del Sprint 2, H-14. |

[← Volver al README Principal](../../README.md)

### **Control de versiones del documento**

| Versión | Fecha | Autor | Descripción del cambio |
|---|---|---|---|
| V_1_0_0 | 25/09/2026 | Equipo del proyecto | Emisión inicial. El 02/10/2026 se asignaron responsables y ramas `feature/*` sin cambio de versión (historial reconstruido desde Git). |
| V_1_1_0 | 09/10/2026 | Tovar Sánchez, Carlos Alberto | Se agregan la versión y la fecha de actualización, el seguimiento del estado de las seis acciones y dos notas aclaratorias (nomenclatura de ramas y cumplimiento de la política). El texto original se conserva. |
