# Retrospectiva del Sprint

**Nombre del Proyecto:** EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Líder del Proyecto:** Ore Campos, Josef Pablo

**Sprint:** Sprint 2 — mapa con filtros, inicio de sesión, administración de usuarios y persistencia de las vistas.

**Versión del documento:** V_2_0_0. Actualiza V_1_0_0; no constituye una nueva versión publicada del producto.

**Fecha de elaboración:** 09/10/2026

**Rama actual:** `main`.

**Referencia del repositorio:** `97b401b` como HEAD inspeccionado. Se incorporan los resultados técnicos y las solicitudes de la sesión del 09/10/2026.

**Estado:** Insumo para la retrospectiva. Las acciones, responsables y fechas siguientes son propuestas para confirmar con el equipo; no se registra una reunión ni acuerdos que todavía no tienen evidencia.

## ¿Qué aprendimos?

- La fidelidad del mapa requiere distinguir el área navegable, la cobertura logística y el encuadre de los elementos. El margen de 10 km permite explorar el entorno sin perder el contexto de Lima.
- La referencia visual y las iteraciones de diseño ayudaron a concretar colores suaves, marcadores pastel y cuadros de detalle menos invasivos. La solicitud de reducir la saturación mostró la necesidad de combinar capas con filtros de pedidos y estados, conservando la selección y el encuadre de los resultados.
- El control por roles necesita una matriz común y comprobaciones en el servidor, además de navegación y botones adecuados. Las descripciones generales del diseño pueden diferir de los permisos explícitos del documento de Usuarios.
- La autorización y la autenticación son entregables distintos. Ahora los permisos usan una identidad validada en PostgreSQL; se comprobaron vigencia, revocación, CSRF, límite de intentos y acceso a recursos propios del conductor.
- Los datos relacionados y las pruebas en PostgreSQL permiten comprobar constraints, geometría y rollback durable que los dobles de repositorio no demuestran.
- Un archivo de entorno configura la aplicación, pero no crea usuarios. Activar `python.terminal.useEnvFile` tampoco registra una cuenta ni cambia el hash de su contraseña. El primer administrador necesita un comando de alta y las cuentas posteriores se crean desde Administración.
- La ausencia de datos en pantalla puede deberse a una base distinta, migraciones faltantes o variables heredadas de una terminal. Se alinearon `.env`, la base sembrada y la migración de sesiones; los valores actuales del archivo prevalecen al arrancar la API.
- Una consulta real a PostgreSQL puede contener datos sintéticos. Las rutas y posiciones generadas permiten validar la interfaz y los permisos, pero no demuestran GPS, enrutamiento vial ni resultados de una operación real.
- Completar una tarea visual o un generador de datos no significa completar la historia de negocio. El cierre requiere integración, criterios de aceptación y revisión del incremento.

## Situaciones observadas y ajustes realizados

| Situación de la sesión | Ajuste realizado | Resultado o límite |
|---|---|---|
| El administrador local no podía iniciar sesión. | Se verificó la cuenta persistida y se habilitó una excepción explícita en el comando para la contraseña corta del primer administrador. | Acceso y cierre de sesión comprobados; las cuentas creadas en la interfaz siguen requiriendo al menos 12 caracteres. No se publican credenciales. |
| Los datos generados no aparecían en las vistas. | Se hizo coincidir la conexión de la API con `ecologistica_seed_test`, se aplicó la migración de sesiones y se conservó el administrador existente. | Lecturas verificadas: 1.050 pedidos en la base y 150 en el mapa del día; 21 usuarios, incluidos los 20 del generador. |
| La aplicación heredaba configuración anterior de una terminal. | Se dio prioridad al archivo `.env` al iniciar scripts y API, con comprobación de regresión. | La conexión actual es reproducible al reiniciar la API después de editar el archivo. |
| La interfaz conservaba señales de pruebas y distribución poco uniforme. | Se retiraron selector de perfiles y avisos demo; se reorganizaron navegación, formularios y contenido con superficies claras. | La interfaz principal usa sesiones y API, conserva la paleta y adapta sus controles a móvil. |
| El mapa concentraba demasiados pedidos y rutas. | Se añadieron filtros por estado del pedido, pedido específico y búsqueda, sincronizados con la vista de Pedidos. | Se ocultan elementos ajenos y se actualizan contadores y encuadre; los pendientes sin asignación permanecen consultables. |
| Una prueba de navegador esperaba un conteo incorrecto. | Se corrigió la expectativa y se repitieron los casos afectados, junto con regresiones de encuadre y móvil. | Los casos dirigidos pasaron; queda repetir la corrida global sobre el commit que se presente para aceptación. |

## ¿Qué estamos haciendo bien?

- Se utiliza un mapa reutilizable con perfiles de vista y capas independientes para rutas, pedidos, camiones y almacén.
- Se incorporaron las correcciones de límites, presentación, iconos y cierre de cuadros solicitadas durante el desarrollo, conservando pruebas de interacción y de vistas móviles.
- Los cinco roles de producción comparten una política ejecutable entre frontend y backend, con pruebas de paridad y de rechazo de accesos no autorizados.
- El inicio de sesión y el alta administrativa evitan depender de una selección visual de identidad. El vínculo persistente entre usuario, conductor y vehículo permite comprobar permisos por recurso.
- Las vistas consultan PostgreSQL mediante la API común; los errores de conexión se muestran sin sustituir los resultados por ejemplos. Indicadores y CSV usan los mismos datos y periodos.
- El generador admite `.env.test`, repetición sin duplicados y comprobación de propiedad. Reconoce las tablas aditivas de sesiones sin aceptar tablas ajenas; la conservación del administrador no requirió borrar el dataset.
- Las pruebas de integración de las vistas revierten las escrituras al terminar. Se complementaron con navegación contra la API local y filtros del mapa en escritorio y a 390 px.
- Se mantuvo la paleta al aclarar la interfaz y se reutilizó el mismo filtrado para marcadores, rutas, vehículos, contadores y lista, reduciendo inconsistencias entre pantallas.
- Se documentan comandos, resultados y límites de la demostración; las credenciales locales se excluyen de Git y la plantilla `.env.example` se conserva versionada.

## ¿Qué podemos hacer mejor?

### Personas

Mantener las responsabilidades de referencia del equipo y confirmar capacidad para la integración restante:

| Responsable propuesto | Enfoque del siguiente trabajo | Coordinación necesaria |
|---|---|---|
| Ore Campos, Josef Pablo | Mapa, composición por vista y coordinación del incremento. | Valentino para UX; Carlos y William para datos operativos. |
| Tovar Sánchez, Carlos Alberto | Despliegue de persistencia, revisión de sesiones y confirmación integrada con despacho. | William para API y seguridad; Alex para permisos del conductor. |
| Rojas Camayo, Valentino Jhan Pierre | Coherencia visual, filtros y evaluación de accesibilidad. | Josef para mapa; Carlos para contratos y errores de API. |
| Rojas Peña, William Mikeiel | Optimizador avanzado, matriz vial, indicadores y servicios externos. | Carlos para datos persistidos; Josef para rutas y posiciones. |
| Cueva Ricse, Alex Roberto | Pruebas de aceptación de roles, entregas y revisión documental. | Carlos para perfiles; revisión cruzada con los responsables de cada módulo. |

Estas propuestas retoman el plan de desarrollo y no sustituyen las asignaciones históricas confirmadas en la retrospectiva anterior. Cada entrega debe contar con un revisor distinto del implementador.

### Relaciones

- Revisar con logística y representantes de conductores la composición de vistas, las consultas autorizadas y los casos de incidencia antes de cerrar sus contratos.
- Registrar las decisiones de permisos en el documento de Usuarios y en la política compartida, evitando cambios aislados por pantalla.
- Revisar con usuarios el alcance de los filtros por estado de pedido y la consulta de pendientes sin ruta, conservando acceso rápido a limpiar los filtros.
- Mantener una sincronización breve sobre contratos entre módulos y registrar dudas o impedimentos con responsable y próxima revisión.

### Procesos

- Desglosar las historias en tareas de interfaz, contratos, persistencia, integración y aceptación. Registrar el avance parcial sin trasladarlo automáticamente a estado Done.
- Continuar la política `feature/<persona>/spr<N>/<módulo>/<acción>` y documentar las ramas existentes `feature/josef/spr2/map` y `feature/josef/spr2/auth` al preparar sus PR. Su nombre no acredita cierre de sprint.
- Revisar cada PR con la arquitectura hexagonal, los criterios de aceptación y las pruebas apropiadas; preservar el dominio independiente de frameworks e infraestructura.
- Vincular los resultados de pruebas al commit o árbol de trabajo evaluado y completar la aceptación del PMV con evidencia del flujo integrado.
- Separar alta inicial, migración y carga sintética en la guía de arranque; comprobar conexión y cantidades antes de atribuir una lista vacía a la interfaz.
- Diferenciar las comprobaciones de navegador con API interceptada de las realizadas con PostgreSQL; registrar cuándo se sustituye la cartografía y qué integraciones quedan sin validar.
- Mantener los enlaces documentales cuando se reorganizan archivos entre `development/` y `docs/`, para que la evidencia siga siendo accesible.

### Herramientas

- Utilizar una base exclusiva y `.env.test` para la carga sintética. Confirmar que la API apunta a la base elegida en `.env` y reiniciarla después de cambios de conexión.
- Usar `scripts/check_database.py` para diagnosticar consultas y cantidades; `scripts/migrate.py` para la migración aditiva y `scripts/create_admin.py` para el primer administrador. El alta posterior corresponde a la interfaz administrativa.
- Incorporar las suites backend, frontend y navegador al flujo de revisión y, posteriormente, al pipeline de integración.
- Ejecutar la suite con los cinco perfiles y comprobar accesos directos, recursos ajenos, fallos de sesión y mutaciones rechazadas.
- Mantener sincronizados Jira, los PR y el backlog de `development/`; registrar explícitamente las tareas que continúan.

### Acciones a realizar

| Acción concreta | Responsable propuesto | Momento de revisión | Cómo comprobar la mejora |
|---|---|---|---|
| Revisar la seguridad y el despliegue del login ya integrado. | Carlos + William | Próximo planning; fecha a confirmar. | Expiración, revocación, CSRF, límite de intentos y permisos revisados en el entorno de despliegue. |
| Validar migración, reinicio y recuperación de la persistencia integrada. | Carlos + responsables de módulos | Antes de la siguiente demo de integración. | Una base nueva arranca siguiendo la guía; los datos persisten tras reinicio y existe evidencia de restauración. |
| Acordar las fuentes operativas de posición, GPS, ETA y actualización del mapa. | Josef + William + Carlos | Antes de integrar seguimiento operativo. | Contrato con origen y antigüedad de posición; pruebas de actualización sin presentar posiciones sintéticas como GPS. |
| Implementar el flujo de generación, asignación y despacho restante. | William + Carlos | Planning de continuación de PMV-2. | Demo pedido → ruta → despacho → entrega, con capacidad, ventanas y permisos verificados. |
| Revisar filtros, distribución clara y vistas por perfil. | Valentino + Alex + Josef | Siguiente review. | Estados, pedido, búsqueda, limpieza y lista sincronizada evaluados en escritorio y móvil; suite global de navegador repetida y revisión de accesibilidad. |
| Conciliar métricas y validar factores ambientales operativos. | William + Carlos | Antes de aceptar dashboard y reportes. | Mismo periodo y distrito en API y CSV; origen y unidades de factores documentados, línea base explícita y rendimiento medido. |
| Consolidar commits, PR, enlaces y trazabilidad del incremento. | Josef + Alex + equipo | Antes del cierre formal del sprint. | PR revisado, evidencias accesibles, Jira conciliado y aceptación registrada por historia. |

Las acciones anteriores de integrar autenticación y conectar módulos a PostgreSQL cuentan ahora con implementación y comprobaciones de la sesión. Las propuestas de esta tabla se concentran en validación, operación y aceptación; sus responsables y fechas aún deben confirmarse.

La siguiente retrospectiva debe comprobar estas acciones y registrar resultados, obstáculos y fechas reales. La [revisión de este incremento](05%20Revisi%C3%B3n%20del%20Sprint%20V_2_0_0.md) y la [guía de inicio de sesión y persistencia](../../development/Inicio%20de%20sesi%C3%B3n%20y%20persistencia.md) registran el alcance actualizado. El [estado de desarrollo](../../development/estado-actual.md) y el backlog requieren conciliar sus pendientes históricos con esta revisión.

## Historial de versiones

| Versión | Fecha | Cambio |
|---|---|---|
| V_1_0_0 | 09/10/2026 | Aprendizajes iniciales sobre mapa, roles y preparación de datos. |
| V_2_0_0 | 09/10/2026 | Incorpora diagnóstico del login y entorno, persistencia, administración, distribución visual y filtros; revisa aprendizajes y acciones siguientes. |

[← Volver al README Principal](../../README.md)
