# Retrospectiva del Sprint

**Nombre del Proyecto:** EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Líder del Proyecto:** Ore Campos, Josef Pablo

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



### Relaciones

Establecer una reunión breve de sincronización y un canal único para registrar decisiones, dudas y cambios aprobados por el equipo.

### Procesos

Definir una política de ramas, revisión por pull request, criterios de terminado y una actualización semanal coordinada entre Jira y GitHub.

**Política de ramas adoptada:**

- Nomenclatura obligatoria: `feature/<persona>/spr<N>/<módulo>/<acción>` (ver tabla de la sección "Personas").
- Ninguna rama `feature/*` se integra directamente a `main`; todo cambio llega a `main` mediante Pull Request revisado por al menos un par técnico.
- Se exige respetar las reglas de la **arquitectura hexagonal** ya definida en el documento `12. Modelo C4`: el dominio no depende de frameworks ni de infraestructura, y toda integración externa (BD, APIs de mapas/tráfico) se realiza a través de puertos y adaptadores.

### Herramientas

Completar la configuración de Jira, preparar el entorno local, crear la estructura `src/frontend/` y `src/backend/`, y validar el `.gitignore` antes de incorporar dependencias.

### Acciones a realizar

1. ~~Confirmar responsables y tareas del siguiente incremento.~~ **Resuelto:** ver tabla de la sección "Personas".
2. Cerrar las decisiones técnicas pendientes (stack tecnológico, doc. 10).
3. Crear el esqueleto inicial de frontend y backend sobre la arquitectura hexagonal, respetando las ramas `feature/*` asignadas.
4. Preparar un dataset sintético para las primeras pruebas de rutas.
5. Coordinar a Carlos y Valentino para unificar la clase de dominio `Pedido` antes de abrir sus respectivos Pull Request.
6. Revisar semanalmente la trazabilidad entre Jira, GitHub y los documentos del proyecto.

[← Volver al README Principal](../../README.md)
