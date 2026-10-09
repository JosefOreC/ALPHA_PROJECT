# Retrospectiva del Sprint

**Nombre del Proyecto:** EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Líder del Proyecto:** Ore Campos, Josef Pablo

**Sprint:** Sprint 2 — incremento de mapa visual, autorización por roles y preparación de datos.

**Fecha de elaboración:** 09/10/2026

**Rama actual:** `feature/josef/spr2/auth`.

**Estado:** Insumo para la retrospectiva. Las acciones, responsables y fechas siguientes son propuestas para confirmar con el equipo; no se registra una reunión ni acuerdos que todavía no tienen evidencia.

## ¿Qué aprendimos?

- La fidelidad del mapa requiere distinguir el área navegable, la cobertura logística y el encuadre de los elementos. El margen de 10 km permite explorar el entorno sin perder el contexto de Lima.
- La referencia visual y las iteraciones de diseño ayudaron a concretar colores suaves, marcadores pastel y cuadros de detalle menos invasivos. La composición de capas debe responder a la vista y al perfil del usuario.
- El control por roles necesita una matriz común y comprobaciones en el servidor, además de navegación y botones adecuados. Las descripciones generales del diseño pueden diferir de los permisos explícitos del documento de Usuarios.
- La autorización y la autenticación son entregables distintos: los permisos ya implementados requieren todavía una identidad validada por un proveedor real.
- Los datos relacionados y las pruebas en PostgreSQL permiten comprobar constraints, geometría y rollback durable que los dobles de repositorio no demuestran.
- Completar una tarea visual o un generador de datos no significa completar la historia de negocio. El cierre requiere integración, criterios de aceptación y revisión del incremento.

## ¿Qué estamos haciendo bien?

- Se utiliza un mapa reutilizable con perfiles de vista y capas independientes para rutas, pedidos, camiones y almacén.
- Se incorporaron las correcciones de límites, presentación, iconos y cierre de cuadros solicitadas durante el desarrollo, conservando pruebas de interacción y de vistas móviles.
- Los cinco roles de producción comparten una política ejecutable entre frontend y backend, con pruebas de paridad y de rechazo de accesos no autorizados.
- El generador prepara datos de todos los módulos desde `.env`, admite repetición sin duplicados y verifica la propiedad de la base antes de reiniciar sus tablas.
- Se probó la carga y el rollback en un PostgreSQL/PostGIS aislado del servidor habitual y se detuvo el entorno temporal al finalizar.
- Se documentan comandos, resultados y límites de la demostración; las credenciales locales se excluyen de Git y la plantilla `.env.example` se conserva versionada.

## ¿Qué podemos hacer mejor?

### Personas

Mantener las responsabilidades de referencia del equipo y confirmar capacidad para la integración restante:

| Responsable propuesto | Enfoque del siguiente trabajo | Coordinación necesaria |
|---|---|---|
| Ore Campos, Josef Pablo | Mapa, composición por vista y coordinación del incremento. | Valentino para UX; Carlos y William para datos operativos. |
| Tovar Sánchez, Carlos Alberto | Persistencia, integración de identidad y confirmación de entregas. | William para API y seguridad; Alex para el vínculo usuario/conductor. |
| Rojas Camayo, Valentino Jhan Pierre | Pedidos, interfaz por perfil y coherencia del sistema visual. | Josef para mapa; Carlos para contratos y errores de API. |
| Rojas Peña, William Mikeiel | Backend, algoritmo, indicadores y servicios de operación. | Carlos para datos persistidos; Josef para rutas y posiciones. |
| Cueva Ricse, Alex Roberto | Conductores, pruebas de aceptación y revisión documental. | Carlos para perfiles; revisión cruzada con los responsables de cada módulo. |

Estas propuestas retoman el plan de desarrollo y no sustituyen las asignaciones históricas confirmadas en la retrospectiva anterior. Cada entrega debe contar con un revisor distinto del implementador.

### Relaciones

- Revisar con logística y representantes de conductores la composición de vistas, las consultas autorizadas y los casos de incidencia antes de cerrar sus contratos.
- Registrar las decisiones de permisos en el documento de Usuarios y en la política compartida, evitando cambios aislados por pantalla.
- Mantener una sincronización breve sobre contratos entre módulos y registrar dudas o impedimentos con responsable y próxima revisión.

### Procesos

- Desglosar las historias en tareas de interfaz, contratos, persistencia, integración y aceptación. Registrar el avance parcial sin trasladarlo automáticamente a estado Done.
- Continuar la política `feature/<persona>/spr<N>/<módulo>/<acción>` y documentar las ramas existentes `feature/josef/spr2/map` y `feature/josef/spr2/auth` al preparar sus PR. Su nombre no acredita cierre de sprint.
- Revisar cada PR con la arquitectura hexagonal, los criterios de aceptación y las pruebas apropiadas; preservar el dominio independiente de frameworks e infraestructura.
- Vincular los resultados de pruebas al commit o árbol de trabajo evaluado y completar la aceptación del PMV con evidencia del flujo integrado.
- Mantener los enlaces documentales cuando se reorganizan archivos entre `development/` y `docs/`, para que la evidencia siga siendo accesible.

### Herramientas

- Utilizar el generador PostgreSQL/PostGIS para reproducir escenarios de prueba; configurar una base exclusiva y un archivo `.env` local por ambiente.
- Incorporar las suites backend, frontend y navegador al flujo de revisión y, posteriormente, al pipeline de integración.
- Ejecutar la suite con los cinco perfiles y comprobar accesos directos, recursos ajenos, fallos de sesión y mutaciones rechazadas.
- Mantener sincronizados Jira, los PR y el backlog de `development/`; registrar explícitamente las tareas que continúan.

### Acciones a realizar

| Acción concreta | Responsable propuesto | Momento de revisión | Cómo comprobar la mejora |
|---|---|---|---|
| Definir e integrar el proveedor de autenticación real. | Carlos + William | Próximo planning; fecha a confirmar. | Login, expiración, revocación y permisos de los cinco perfiles verificados con sesiones reales. |
| Conectar los módulos de gestión a PostgreSQL y preparar migraciones versionadas. | Carlos + responsables de módulos | Antes de la siguiente demo de integración. | Registro, edición y confirmación comparten datos y conservan cambios tras reiniciar la aplicación. |
| Acordar las fuentes de rutas, coordenadas, posiciones y ETA. | Josef + William + Carlos | Antes de integrar la fuente operativa del mapa. | Contrato documentado y prueba de mapa con datos de la API, sin depender de fixtures para acreditar operación. |
| Implementar el flujo de generación, asignación y despacho restante. | William + Carlos | Planning de continuación de PMV-2. | Demo pedido → ruta → despacho → entrega, con capacidad, ventanas y permisos verificados. |
| Completar la revisión del mapa y de las vistas por perfil. | Valentino + Alex + Josef | Siguiente review. | Checklist de aceptación, interacción con el mouse y uso móvil evaluados por un revisor distinto del implementador. |
| Consolidar commits, PR, enlaces y trazabilidad del incremento. | Josef + Alex + equipo | Antes del cierre formal del sprint. | PR revisado, evidencias accesibles, Jira conciliado y aceptación registrada por historia. |

La siguiente retrospectiva debe comprobar estas acciones y registrar resultados, obstáculos y fechas reales. La [revisión de este incremento](05%20Revisi%C3%B3n%20del%20Sprint%20V_1_0_0.md) y el [estado de desarrollo](../../development/estado-actual.md) sirven como base de seguimiento.

[← Volver al README Principal](../../README.md)
