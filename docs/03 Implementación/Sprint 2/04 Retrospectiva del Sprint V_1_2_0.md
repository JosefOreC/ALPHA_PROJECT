# Retrospectiva del Sprint — Sprint 2

**Nombre del Proyecto:** EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Líder del Proyecto:** Ore Campos, Josef Pablo

**Sprint:** Sprint 2 — interfaces por rol con el sistema de diseño, mapa visual, autorización por roles y preparación de datos de prueba.

**Fecha de elaboración:** 09/10/2026

**Versión del documento:** V_1_2_0

**Estado:** insumo para la retrospectiva. Las acciones, responsables y fechas son propuestas para confirmar con el equipo; este documento no registra una reunión ni acuerdos que todavía no tienen evidencia.

> **Documento unificado.** Reúne en un solo texto la retrospectiva de la serie de interfaz por rol (Tovar Sánchez, Carlos Alberto) y la retrospectiva del mapa visual, la autorización por roles y la base de pruebas (Ore Campos, Josef Pablo), redactada por separado en la rama `feature/josef/spr2/auth` como «06 Retrospectiva del Sprint». Cuando esa rama se fusione, su versión suelta debe retirarse a favor de este documento.

## ¿Qué aprendimos?

**De la serie de interfaz por rol**

- Una referencia visual cerrada por rol (sistema de diseño, pantallas y reglas) permitió construir ocho pantallas coherentes entre sí, pero solo mientras cada vista respetó los mismos componentes y la misma arquitectura hexagonal. Cada decisión de diseño que faltaba (por ejemplo, el CO₂ evitado del mes) se tradujo en una pregunta por dato, no en una cifra inventada.
- Las pruebas unitarias no bastan para una interfaz: la ejecución en un navegador real encontró defectos que las pruebas de componentes no veían. Un mensaje de error largo sin espacios ensanchaba la página a 3 025 px en móvil; las líneas de ruta del mapa no recibían su clase porque la biblioteca aplica las opciones después de crearlas; los controles de capas medían 28 px cuando la vista del conductor exige 48 px; y el formato de números de `es-PE` usa punto decimal, contrario a la guía de estilo del proyecto.
- Una pantalla que funciona con datos de ejemplo no acredita la historia. Separar los datos de ejemplo detrás de puertos y adaptadores permite mostrar avance sin confundirlo con operación, a condición de avisarlo en pantalla.
- Los Pull Requests apilados dan trazabilidad por pantalla, pero crean una cadena de dependencias: ninguno se puede fusionar antes del anterior y cada fusión obliga a rehacer la base del siguiente.
- La documentación se contradice con facilidad cuando se actualiza por partes: la [auditoría de coherencia](05%20Auditor%C3%ADa%20de%20coherencia%20del%20proyecto%20V_1_2_0.md) encontró discrepancias en el README, el informe del Sprint 1 y los identificadores de historias y requisitos.
- Un entorno local sin actualizar puede parecer un defecto del código: las pruebas del backend fallaban por falta de `tzdata` hasta reinstalar los requisitos.

**Del mapa, los roles y la base de pruebas**

- La fidelidad del mapa requiere distinguir el área navegable, la cobertura logística y el encuadre de los elementos. El margen de 10 km permite explorar el entorno sin perder el contexto de Lima.
- La referencia visual y las iteraciones de diseño ayudaron a concretar colores suaves, marcadores pastel y cuadros de detalle menos invasivos. La composición de capas debe responder a la vista y al perfil del usuario.
- El control por roles necesita una matriz común y comprobaciones en el servidor, además de navegación y botones adecuados. Las descripciones generales del diseño pueden diferir de los permisos explícitos del documento de Usuarios.
- La autorización y la autenticación son entregables distintos: los permisos ya implementados requieren todavía una identidad validada por un proveedor real.
- Los datos relacionados y las pruebas en PostgreSQL permiten comprobar restricciones, geometría y reversión durable que los dobles de repositorio no demuestran.
- Completar una tarea visual o un generador de datos no significa completar la historia de negocio. El cierre requiere integración, criterios de aceptación y revisión del incremento.

## ¿Qué estamos haciendo bien?

- Cada pantalla se construyó con casos de uso, puertos y adaptadores, de modo que el motor de rutas, la persistencia, la autenticación y las fuentes de datos se pueden sustituir sin tocar las vistas. La prueba de fronteras de la capa de dominio del dashboard se mantiene.
- Se conserva la regla de no inventar datos: los factores de emisión de GNV, eléctrico, GLP e híbrido quedan «por definir», y las pantallas sin fuente real avisan que no hay datos en lugar de mostrar cifras.
- Las suites crecieron junto con el código: 169 pruebas de backend y 247 de frontend, más 22 pruebas de navegador que cubren móvil, descarga de archivos, mapa y reglas de accesibilidad básicas.
- Se añadió una prueba automática que hace cumplir las reglas de diseño (sin colores sueltos, emoji, fuentes ajenas ni CSS heredado), para que la limpieza no se pierda.
- El mapa es un componente reutilizable con perfiles de vista y capas independientes para rutas, pedidos, camiones y almacén; se incorporaron las correcciones de límites, presentación, íconos y cierre de cuadros solicitadas durante el desarrollo, conservando las pruebas de interacción y de vistas móviles.
- Los cinco roles de producción comparten una política ejecutable entre frontend y backend, con pruebas de paridad y de rechazo de accesos no autorizados.
- El generador de datos prepara todos los módulos desde `.env`, admite repetición sin duplicados y verifica la propiedad de la base antes de reiniciar sus tablas. Se probó la carga y la reversión en un PostgreSQL/PostGIS aislado del servidor habitual, que se detuvo al finalizar.
- Se documentan comandos, resultados y límites de la demostración, y las acciones sin función quedan deshabilitadas con la indicación «Próximamente». Las credenciales locales se excluyen de Git y la plantilla `.env.example` se conserva versionada.

## ¿Qué podemos hacer mejor?

### Personas

Responsabilidades de referencia según el trabajo realizado y el enfoque propuesto para el siguiente; se confirman con el equipo y no sustituyen las asignaciones históricas de la retrospectiva del Sprint 1:

| Responsable | Rama de referencia | Trabajo realizado en el Sprint 2 | Enfoque propuesto para el siguiente trabajo | Coordinación necesaria |
|---|---|---|---|---|
| Ore Campos, Josef Pablo | `feature/josef/spr2/m_vehiculos/crud`, `feature/josef/spr2/map` y `feature/josef/spr2/auth` | Flota, mapa visual, autorización por roles, base de pruebas y arquitectura del backend. | Mapa, composición por vista y coordinación del incremento. | Valentino para la experiencia de uso; Carlos y William para los datos operativos. |
| Tovar Sánchez, Carlos Alberto | `feature/carlos/spr2/m_pedidos/confirmacion` | Interfaz por rol con el sistema de diseño (PR #12 a #21) y confirmación de entrega del conductor. | Persistencia, integración de identidad y confirmación de entregas. | William para la API y la seguridad; Alex para el vínculo usuario/conductor. |
| Rojas Camayo, Valentino Jhan Pierre | `feature/valentino/spr2/m_pedidos/crud` | CRUD y vista del módulo Pedidos. | Pedidos, interfaz por perfil y coherencia del sistema visual. | Josef para el mapa; Carlos para los contratos y errores de la API. |
| Rojas Peña, William Mikeiel | `feature/william/spr2/dashboard` | Dashboard y puertos de datos. | Backend, algoritmo, indicadores y servicios de operación. | Carlos para los datos persistidos; Josef para rutas y posiciones. |
| Cueva Ricse, Alex Roberto | `feature/alex/spr1/m_conductor/crud` | CRUD de conductores y su interfaz (PR #11). | Conductores, pruebas de aceptación y revisión documental. | Carlos para los perfiles; revisión cruzada con los responsables de cada módulo. |

Cada entrega necesita un revisor distinto de quien la implementó. Los Pull Requests apilados de la serie de interfaz se reparten entre revisores para no depender de una sola persona.

### Relaciones

- Revisar con logística y con representantes de los conductores la composición de vistas, las consultas autorizadas y los casos de incidencia antes de cerrar sus contratos.
- Registrar las decisiones de permisos en el documento de Usuarios y en la política compartida, evitando cambios aislados por pantalla.
- Coordinar a Josef y Carlos el orden de fusión: la rama del mapa de Josef contiene la serie de interfaz y reescribe archivos del componente `RouteMap`, por lo que debe entrar después del PR #21.
- Acordar con Valentino y William los contratos de datos (pedidos con coordenadas, rutas, CO₂ evitado y pedidos en riesgo) antes de reemplazar los adaptadores de ejemplo.
- Mantener una sincronización breve sobre los contratos entre módulos, con un único canal para registrar decisiones, dudas e impedimentos con responsable y próxima revisión.

### Procesos

- Desglosar las historias en tareas de interfaz, contratos, persistencia, integración y aceptación. Registrar el avance parcial sin trasladarlo automáticamente a «Done»: no cerrar una historia por haber terminado su interfaz.
- Mantener la nomenclatura `feature/<persona>/spr<N>/<módulo>/<acción>`. La serie de interfaz quedó nombrada `feature/carlos/spr3/ui/*` aunque pertenece al Sprint 2; conviene renombrarla o registrar la equivalencia. Existen además ramas fuera de la nomenclatura (`feature/arquitectura_01`, `refactor/architecture/domain/value_objects` y cuatro `merge/*`) que se deben archivar o renombrar. Documentar las ramas `feature/josef/spr2/map` y `feature/josef/spr2/auth` al preparar sus Pull Requests: su nombre no acredita el cierre del sprint.
- Evitar los commits directos a `main` (hubo dos el 06/10) y activar la protección de la rama con revisión obligatoria.
- Revisar cada Pull Request con la arquitectura hexagonal, los criterios de aceptación y las pruebas apropiadas, preservando el dominio independiente de frameworks e infraestructura.
- Vincular los resultados de las pruebas al commit o al árbol de trabajo evaluado y completar la aceptación del PMV con evidencia del flujo integrado.
- Para cambios de interfaz, ejecutar siempre las pruebas de navegador y comprobar 390 px además de las pruebas unitarias.
- Corregir la documentación a partir de la auditoría y revisarla en cada sprint junto con Jira y GitHub. Mantener los enlaces documentales cuando se reorganizan archivos entre `development/` y `docs/`, y retirar los documentos duplicados al fusionar.

### Herramientas

- Utilizar el generador PostgreSQL/PostGIS para reproducir escenarios de prueba; configurar una base exclusiva y un archivo `.env` local por ambiente. Reinstalar los requisitos del backend y del frontend al cambiar de rama.
- Incorporar las suites de backend, frontend y navegador al flujo de revisión y, después, a un pipeline de integración continua (hoy no existe `.github/`).
- Ejecutar la suite con los cinco perfiles y comprobar accesos directos, recursos ajenos, fallos de sesión y mutaciones rechazadas.
- Mantener sincronizados Jira, los Pull Requests y el backlog de `development/`, registrando explícitamente las tareas que continúan; completar la configuración de Jira.
- Reemplazar el servidor público de teselas de OpenStreetMap por un proveedor o servidor propio antes de cualquier uso productivo, y medir cobertura de código para dar evidencia al requisito RNF-007.

### Acciones a realizar

| Acción concreta | Responsable propuesto | Momento de revisión | Cómo comprobar la mejora |
|---|---|---|---|
| Revisar y fusionar los PR #11 y #12 a #21 en orden, con un revisor distinto del autor. | Equipo; revisor por PR a asignar | Antes del cierre formal del Sprint 2. | Todos los PR fusionados o cerrados con motivo y `main` con la interfaz por rol. |
| Abrir y fusionar los PR de `feature/josef/spr2/map` y `feature/josef/spr2/auth` después de la serie de interfaz. | Josef + Carlos | Después de fusionar el PR #21. | `main` con el mapa ampliado y la política de roles compartida, con las pruebas de ambas ramas aprobadas. |
| Activar la protección de `main` y archivar o renombrar las ramas fuera de nomenclatura. | Administrador del repositorio (Josef) | Próxima semana. | La consulta de protección responde la regla; un commit directo a `main` es rechazado. |
| Definir e integrar el proveedor de autenticación real y quitar los usuarios genéricos por rol. | Carlos + William | Próximo planning; fecha a confirmar. | Inicio de sesión, expiración, revocación y permisos de los cinco perfiles verificados con sesiones reales. |
| Componer una API única, conectar los módulos de gestión a PostgreSQL y preparar migraciones versionadas. | Carlos + Josef + responsables de módulos | Antes de la siguiente demo de integración. | Registro, edición y confirmación comparten datos y conservan los cambios tras reiniciar la aplicación. |
| Acordar las fuentes de rutas, coordenadas, posiciones y ETA, y las de CO₂ evitado y pedidos en riesgo. | Josef + William + Carlos | Antes de integrar la fuente operativa del mapa. | Contrato documentado y prueba de mapa con datos de la API, sin depender de fixtures para acreditar la operación. |
| Implementar el flujo de generación, asignación y despacho restante, con la versión base del motor VRPTW / Green VRP y su medición de rendimiento. | William + Carlos | Planning de continuación de PMV-2. | Demo pedido → ruta → despacho → entrega, con capacidad, ventanas y permisos verificados, y tiempo medido contra RNF-001 con 150 pedidos y 15 vehículos. |
| Completar la revisión del mapa y de las vistas por perfil. | Valentino + Alex + Josef | Siguiente revisión. | Lista de aceptación, interacción con el mouse y uso móvil evaluados por un revisor distinto del implementador. |
| Consolidar commits, Pull Requests, enlaces y trazabilidad del incremento. | Josef + Alex + equipo | Antes del cierre formal del sprint. | PR revisado, evidencias accesibles, Jira conciliado y aceptación registrada por historia. |
| Corregir el README y los documentos de Inicio señalados en la auditoría de coherencia (los del Sprint 1 ya se corrigieron en V_1_1_0). | Alex + Carlos | Antes de la siguiente revisión. | Cada hallazgo de la auditoría cerrado o justificado y los enlaces comprobados. |

La siguiente retrospectiva debe comprobar estas acciones y registrar resultados, obstáculos y fechas reales. La [revisión de este sprint](03%20Revisi%C3%B3n%20del%20Sprint%20V_1_1_0.md) y el [registro de impedimentos](02%20Registro%20de%20Impedimentos%20V_1_2_0.md) sirven de base de seguimiento.

[← Volver al README Principal](../../../README.md)

### **Control de versiones del documento**

| Versión | Fecha | Autor | Descripción del cambio |
|---|---|---|---|
| V_1_0_0 | 09/10/2026 | Tovar Sánchez, Carlos Alberto | Retrospectiva del Sprint 2 con aprendizajes, aciertos, mejoras por categoría y acciones propuestas pendientes de confirmar. |
| V_1_1_0 | 09/10/2026 | Tovar Sánchez, Carlos Alberto | Se unifica con la retrospectiva de la rama `feature/josef/spr2/auth` (mapa visual, autorización por roles y base de pruebas): una sola tabla de responsables, aprendizajes integrados y acciones sin duplicados. |
| V_1_2_0 | 09/10/2026 | Tovar Sánchez, Carlos Alberto | Se actualizan los enlaces y se registra que los documentos del Sprint 1 ya fueron corregidos. |
