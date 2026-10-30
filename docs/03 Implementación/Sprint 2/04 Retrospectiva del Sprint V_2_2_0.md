# Retrospectiva del Sprint — Sprint 2

**Proyecto:** EcoLogística Lima — DistriRápido S.A.C.

**Versión del documento:** V_2_2_0

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
| PR acumulados y cambios sin revisión: IMP-004/005 | Planificar revisores por entrega, revisar el incremento ya integrado y acordar protección de rama antes de la siguiente integración. | Responsable por confirmar | En cada entrega (propuesto); primera fecha por confirmar | Revisión independiente y regla de protección documentadas; sin presumir estado remoto. | Propuesta pendiente de confirmación |
| Documentos describían funciones ya implementadas: IMP-011 | Contrastar cada estado con el commit y distinguir implementación, ejecución y aceptación. | Responsable por confirmar | En cada actualización documental (propuesto); primera fecha por confirmar | Referencia de código y evidencia por criterio; comprobar enlaces con check_docs.py. | Propuesta pendiente de confirmación |
| Migración y recuperación sin evidencia: IMP-006 | Reservar verificación de base nueva, rollback, reinicio y restauración antes de cada demo de persistencia. | Responsable por confirmar | Antes de cada demo de persistencia (propuesto); primera fecha por confirmar | Log reproducible del entorno y resultado de recuperación. | Propuesta pendiente de confirmación |
| Identidad, permisos y seguridad se confundieron: IMP-007 | Revisar sesión y matriz RBAC por separado de los criterios completos EN-02; ejecutar rechazos por rol/recurso. | Responsable por confirmar | Antes de aceptar cambios de acceso (propuesto); primera fecha por confirmar | Matriz por rol, pruebas negativas y revisión de seguridad trazables. | Propuesta pendiente de confirmación |
| Base, .env y administrador no coincidían | Añadir al arranque la comprobación de destino de base, migración y existencia del administrador, sin publicar secretos. | Responsable por confirmar | Después de cambiar conexión y antes de demo (propuesto); primera fecha por confirmar | Lista de comprobación de conexión/cantidades sin credenciales; fuente: retrospectiva V_2_0_0. | Propuesta pendiente de confirmación |
| Datos sintéticos se confundían con operación: IMP-009 | Documentar origen y antigüedad de GPS/ETA y versionar factores ambientales; conciliar API, dashboard y CSV. | Responsable por confirmar | Antes de aceptar mapa o sostenibilidad (propuesto); primera fecha por confirmar | Contrato D-08 y factores/línea base con unidades y evidencia común. | Propuesta pendiente de confirmación |
| Cambios visuales causaban desbordamiento y filtros inconsistentes | Comprobar escenarios de filtros, selección, limpieza y mensajes largos en escritorio y móvil con lista/mapa sincronizados. | Responsable por confirmar | En cambios de mapa/UI (propuesto); primera fecha por confirmar | Evidencia a 390 px, resultados por filtro y evaluación accesible independiente. | Propuesta pendiente de confirmación |
| Una corrida dirigida se confundía con regresión completa | Registrar qué casos se ejecutaron, cuáles se omitieron y qué integraciones fueron sustituidas. | Responsable por confirmar | En cada registro de pruebas (propuesto); primera fecha por confirmar | Comando, commit, entorno, artefacto y límites; no extrapolar tests dirigidos. | Propuesta pendiente de confirmación |
| Motor y despacho seguían pendientes: IMP-003 | Dividir US-005 en motor, persistencia, aprobación y despacho, con dependencias y criterios antes del planning. | Responsable por confirmar | En planning de continuación de PMV-2 (propuesto); primera fecha por confirmar | Demo integrada pedido → ruta → despacho → entrega y benchmark trazable. | Propuesta pendiente de confirmación |
| Dependencias y proveedor cartográfico sin preparación operativa | Verificar instalación reproducible y registrar decisión de proveedor/límites de teselas antes del despliegue. | Responsable por confirmar | Antes de desplegar (propuesto); primera fecha por confirmar | Guía reproducida y decisión de proveedor, atribución y límites; no sustituirla por capturas. | Propuesta pendiente de confirmación |

### Seguimiento de acuerdos y antecedentes

- 04 Retrospectiva del Sprint V_1_3_0.md (ver el anexo de este documento): conserva aprendizajes detallados, observaciones, responsables/fechas propuestos y registro de cambios.
- 06 Retrospectiva del Sprint V_2_0_0.md (ver el anexo de este documento): conserva aprendizajes detallados, observaciones, responsables/fechas propuestos y registro de cambios.

V_2_1_0 consolida V_1_3_0 y V_2_0_0. La segunda aporta diagnóstico del administrador y conexión, datos sintéticos, prioridad de .env, filtros, prueba dirigida y conciliación ambiental; las acciones anteriores cubren esos problemas. Ninguna de las dos fuentes acredita ratificación de nuevas acciones por el equipo. El número V_2_0_0 era versión documental del Sprint 2, no un Sprint 3.

En la siguiente retrospectiva, registrar para cada acción confirmada: evidencia, resultado, obstáculo y próxima revisión. Esta tabla define cómo comprobar cumplimiento; no afirma que las acciones ya se cumplieron.

## Anexo A — Edición anterior V_1_3_0 (conservada como antecedente)

Texto de la edición anterior; se conserva su contenido y sus cifras con la fecha de esa edición. Solo se ajustaron enlaces y niveles de encabezado. El estado vigente es el de las secciones anteriores de este documento.

> **HISTÓRICO — no vigente.** Contenido previo conservado; solo se ajustan navegación y enlaces. Las cifras, fechas, responsables y cierres son registros atribuidos al autor indicado; no se reejecutaron ni se ratificaron en esta revisión documental. Vigente: [04 Retrospectiva del Sprint V_2_1_0](04%20Retrospectiva%20del%20Sprint%20V_2_2_0.md).

### Retrospectiva del Sprint — Sprint 2

**Nombre del Proyecto:** EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Líder del Proyecto:** Ore Campos, Josef Pablo

**Sprint:** Sprint 2 — interfaces por rol con el sistema de diseño, mapa visual, autorización por roles y preparación de datos de prueba.

**Fecha de elaboración:** 09/10/2026

**Versión del documento:** V_1_3_0

**Última actualización:** 29/10/2026

**Estado:** insumo para la retrospectiva. Las acciones, responsables y fechas son propuestas para confirmar con el equipo; este documento no registra una reunión ni acuerdos que todavía no tienen evidencia.

> **Actualización V_1_3_0 (29/10/2026).** La versión anterior daba por pendientes la autenticación, la persistencia en PostgreSQL y la API única, y trataba las ramas de Josef como «sin fusionar». Ese trabajo entró a `main` el 09/10 sin Pull Request (commits `c314f64`, `a07136a`, `c981e8a` y `97b401b`), así que se corrigen los aprendizajes, los aciertos, los procesos y las acciones afectados. Un aprendizaje nuevo: **redactar un documento de estado sin volver a contrastarlo con `main` lo deja desactualizado en horas**; este propio documento fue un ejemplo.

> **Documento unificado.** Reúne en un solo texto la retrospectiva de la serie de interfaz por rol (Tovar Sánchez, Carlos Alberto) y la retrospectiva del mapa visual, la autorización por roles y la base de pruebas (Ore Campos, Josef Pablo). La retrospectiva de Josef está en esta misma carpeta como `06 Retrospectiva del Sprint V_2_0_0.md`; este documento es la referencia unificada.

#### ¿Qué aprendimos?

**De la serie de interfaz por rol**

- Una referencia visual cerrada por rol (sistema de diseño, pantallas y reglas) permitió construir ocho pantallas coherentes entre sí, pero solo mientras cada vista respetó los mismos componentes y la misma arquitectura hexagonal. Cada decisión de diseño que faltaba (por ejemplo, el CO₂ evitado del mes) se tradujo en una pregunta por dato, no en una cifra inventada.
- Las pruebas unitarias no bastan para una interfaz: la ejecución en un navegador real encontró defectos que las pruebas de componentes no veían. Un mensaje de error largo sin espacios ensanchaba la página a 3 025 px en móvil; las líneas de ruta del mapa no recibían su clase porque la biblioteca aplica las opciones después de crearlas; los controles de capas medían 28 px cuando la vista del conductor exige 48 px; y el formato de números de `es-PE` usa punto decimal, contrario a la guía de estilo del proyecto.
- Una pantalla que funciona con datos de ejemplo no acredita la historia. Separar los datos de ejemplo detrás de puertos y adaptadores permite mostrar avance sin confundirlo con operación, a condición de avisarlo en pantalla.
- Los Pull Requests apilados dan trazabilidad por pantalla, pero crean una cadena de dependencias: ninguno se puede fusionar antes del anterior y cada fusión obliga a rehacer la base del siguiente.
- La documentación se contradice con facilidad cuando se actualiza por partes: la [auditoría de coherencia](05%20Auditor%C3%ADa%20de%20coherencia%20del%20proyecto%20V_1_5_0.md) encontró discrepancias en el README, el informe del Sprint 1 y los identificadores de historias y requisitos.
- Un entorno local sin actualizar puede parecer un defecto del código: las pruebas del backend fallaban por falta de `tzdata` hasta reinstalar los requisitos.

**Del mapa, los roles y la base de pruebas**

- La fidelidad del mapa requiere distinguir el área navegable, la cobertura logística y el encuadre de los elementos. El margen de 10 km permite explorar el entorno sin perder el contexto de Lima.
- La referencia visual y las iteraciones de diseño ayudaron a concretar colores suaves, marcadores pastel y cuadros de detalle menos invasivos. La composición de capas debe responder a la vista y al perfil del usuario.
- El control por roles necesita una matriz común y comprobaciones en el servidor, además de navegación y botones adecuados. Las descripciones generales del diseño pueden diferir de los permisos explícitos del documento de Usuarios.
- La autorización y la autenticación son entregables distintos. *(V_1_2_0: «requieren todavía una identidad validada por un proveedor real».)* Ahora los permisos usan una identidad validada en PostgreSQL con sesiones propias; faltan la revisión de seguridad y el despliegue.
- Los datos relacionados y las pruebas en PostgreSQL permiten comprobar restricciones, geometría y reversión durable que los dobles de repositorio no demuestran.
- Completar una tarea visual o un generador de datos no significa completar la historia de negocio. El cierre requiere integración, criterios de aceptación y revisión del incremento.

#### ¿Qué estamos haciendo bien?

- Cada pantalla se construyó con casos de uso, puertos y adaptadores, de modo que el motor de rutas, la persistencia, la autenticación y las fuentes de datos se pueden sustituir sin tocar las vistas. La prueba de fronteras de la capa de dominio del dashboard se mantiene.
- Se conserva la regla de no inventar datos: los factores de emisión de GNV, eléctrico, GLP e híbrido quedan «por definir», y las pantallas sin fuente real avisan que no hay datos en lugar de mostrar cifras.
- Las suites crecieron junto con el código. En `main` (29/10/2026) hay 225 pruebas de backend, 273 de Vitest, 9 de Node y 40 de navegador que cubren móvil, descarga de archivos, mapa, login y reglas de accesibilidad básicas. *(V_1_2_0: 169, 247 y 22, medidas el 09/10 sobre la rama de Carlos.)*
- Se añadió una prueba automática que hace cumplir las reglas de diseño (sin colores sueltos, emoji, fuentes ajenas ni CSS heredado), para que la limpieza no se pierda.
- El mapa es un componente reutilizable con perfiles de vista y capas independientes para rutas, pedidos, camiones y almacén; se incorporaron las correcciones de límites, presentación, íconos y cierre de cuadros solicitadas durante el desarrollo, conservando las pruebas de interacción y de vistas móviles.
- Los cinco roles de producción comparten una política ejecutable entre frontend y backend, con pruebas de paridad y de rechazo de accesos no autorizados.
- El generador de datos prepara todos los módulos desde `.env`, admite repetición sin duplicados y verifica la propiedad de la base antes de reiniciar sus tablas. Se probó la carga y la reversión en un PostgreSQL/PostGIS aislado del servidor habitual, que se detuvo al finalizar.
- Se documentan comandos, resultados y límites de la demostración, y las acciones sin función quedan deshabilitadas con la indicación «Próximamente». Las credenciales locales se excluyen de Git y la plantilla `.env.example` se conserva versionada.

#### ¿Qué podemos hacer mejor?

##### Personas

Responsabilidades de referencia según el trabajo realizado y el enfoque propuesto para el siguiente; se confirman con el equipo y no sustituyen las asignaciones históricas de la retrospectiva del Sprint 1:

| Responsable | Rama de referencia | Trabajo realizado en el Sprint 2 | Enfoque propuesto para el siguiente trabajo | Coordinación necesaria |
|---|---|---|---|---|
| Ore Campos, Josef Pablo | `feature/josef/spr2/m_vehiculos/crud`, `feature/josef/spr2/map` y `feature/josef/spr2/auth` | Flota, mapa visual, autorización por roles, base de pruebas y arquitectura del backend. | Mapa, composición por vista y coordinación del incremento. | Valentino para la experiencia de uso; Carlos y William para los datos operativos. |
| Tovar Sánchez, Carlos Alberto | `feature/carlos/spr2/m_pedidos/confirmacion` | Interfaz por rol con el sistema de diseño (PR #12 a #21) y confirmación de entrega del conductor. | Persistencia, integración de identidad y confirmación de entregas. | William para la API y la seguridad; Alex para el vínculo usuario/conductor. |
| Rojas Camayo, Valentino Jhan Pierre | `feature/valentino/spr2/m_pedidos/crud` | CRUD y vista del módulo Pedidos. | Pedidos, interfaz por perfil y coherencia del sistema visual. | Josef para el mapa; Carlos para los contratos y errores de la API. |
| Rojas Peña, William Mikeiel | `feature/william/spr2/dashboard` | Dashboard y puertos de datos. | Backend, algoritmo, indicadores y servicios de operación. | Carlos para los datos persistidos; Josef para rutas y posiciones. |
| Cueva Ricse, Alex Roberto | `feature/alex/spr1/m_conductor/crud` | CRUD de conductores y su interfaz (PR #11). | Conductores, pruebas de aceptación y revisión documental. | Carlos para los perfiles; revisión cruzada con los responsables de cada módulo. |

Cada entrega necesita un revisor distinto de quien la implementó. Los Pull Requests apilados de la serie de interfaz se reparten entre revisores para no depender de una sola persona.

##### Relaciones

- Revisar con logística y con representantes de los conductores la composición de vistas, las consultas autorizadas y los casos de incidencia antes de cerrar sus contratos.
- Registrar las decisiones de permisos en el documento de Usuarios y en la política compartida, evitando cambios aislados por pantalla.
- Coordinar a Josef y Carlos el orden de fusión: la rama del mapa de Josef contiene la serie de interfaz y reescribe archivos del componente `RouteMap`, por lo que debe entrar después del PR #21.
- Acordar con Valentino y William los contratos de datos (pedidos con coordenadas, rutas, CO₂ evitado y pedidos en riesgo) antes de reemplazar los adaptadores de ejemplo.
- Mantener una sincronización breve sobre los contratos entre módulos, con un único canal para registrar decisiones, dudas e impedimentos con responsable y próxima revisión.

##### Procesos

- Desglosar las historias en tareas de interfaz, contratos, persistencia, integración y aceptación. Registrar el avance parcial sin trasladarlo automáticamente a «Done»: no cerrar una historia por haber terminado su interfaz.
- Mantener la nomenclatura `feature/<persona>/spr<N>/<módulo>/<acción>`. La serie de interfaz quedó nombrada `feature/carlos/spr3/ui/*` aunque pertenece al Sprint 2; conviene renombrarla o registrar la equivalencia. Existen además ramas fuera de la nomenclatura (`feature/arquitectura_01`, `refactor/architecture/domain/value_objects` y cuatro `merge/*`) que se deben archivar o renombrar. Las ramas `feature/josef/spr2/map` y `feature/josef/spr2/auth` ya están integradas en `main` sin Pull Request; su nombre no acredita el cierre del sprint.
- Evitar los commits directos a `main` y activar la protección de la rama con revisión obligatoria. *(V_1_2_0: «hubo dos el 06/10».)* Al 29/10 hay además cinco commits de Josef el 09/10 (mapa, autenticación y PostgreSQL), tres de Carlos y ocho de Valentino que llegaron sin Pull Request.
- Revisar cada Pull Request con la arquitectura hexagonal, los criterios de aceptación y las pruebas apropiadas, preservando el dominio independiente de frameworks e infraestructura.
- Vincular los resultados de las pruebas al commit o al árbol de trabajo evaluado y completar la aceptación del PMV con evidencia del flujo integrado.
- Para cambios de interfaz, ejecutar siempre las pruebas de navegador y comprobar 390 px además de las pruebas unitarias.
- Corregir la documentación a partir de la auditoría y revisarla en cada sprint junto con Jira y GitHub. Mantener los enlaces documentales cuando se reorganizan archivos entre `development/` y `docs/`, y retirar los documentos duplicados al fusionar.

##### Herramientas

- Utilizar el generador PostgreSQL/PostGIS para reproducir escenarios de prueba; configurar una base exclusiva y un archivo `.env` local por ambiente. Reinstalar los requisitos del backend y del frontend al cambiar de rama.
- Incorporar las suites de backend, frontend y navegador al flujo de revisión y, después, a un pipeline de integración continua (hoy no existe `.github/`).
- Ejecutar la suite con los cinco perfiles y comprobar accesos directos, recursos ajenos, fallos de sesión y mutaciones rechazadas.
- Mantener sincronizados Jira, los Pull Requests y el backlog de `development/`, registrando explícitamente las tareas que continúan; completar la configuración de Jira.
- Reemplazar el servidor público de teselas de OpenStreetMap por un proveedor o servidor propio antes de cualquier uso productivo, y medir cobertura de código para dar evidencia al requisito RNF-007.

##### Acciones a realizar

| Acción concreta | Responsable propuesto | Momento de revisión | Cómo comprobar la mejora |
|---|---|---|---|
| Revisar los PR #11 y #12 a #21 con un revisor distinto del autor y cerrarlos con motivo o fusionarlos (su código ya está en `main`). | Equipo; revisor por PR a asignar | Antes del cierre formal del Sprint 2. | Todos los PR fusionados o cerrados con motivo y revisión registrada. *(V_1_2_0: «fusionar en orden; `main` con la interfaz por rol».)* |
| ~~Abrir y fusionar los PR de `feature/josef/spr2/map` y `feature/josef/spr2/auth`.~~ **Cambió:** ese código ya está en `main` sin Pull Request; se revisa retroactivamente el código de seguridad y se activa la protección de la rama. | Josef + Carlos | Antes del cierre formal del Sprint 2. | Revisión de la autenticación, las sesiones y los permisos registrada por un par técnico. |
| Activar la protección de `main` y archivar o renombrar las ramas fuera de nomenclatura. | Administrador del repositorio (Josef) | Próxima semana. | La consulta de protección responde la regla; un commit directo a `main` es rechazado. |
| ~~Definir e integrar el proveedor de autenticación real y quitar los usuarios genéricos por rol.~~ **Hecho** con sesiones propias (no OAuth2/JWT). Queda revisar la seguridad y validarla en el despliegue. | Carlos + William | Próximo planning; fecha a confirmar. | Expiración, revocación, CSRF, límite de intentos y permisos de los cinco perfiles revisados en el entorno de despliegue. |
| ~~Componer una API única, conectar los módulos de gestión a PostgreSQL y preparar migraciones.~~ **Hecho en parte:** API única y adaptadores PostgreSQL en `main`. Queda validar las migraciones, el reinicio y la recuperación, y ejecutar las pruebas con PostgreSQL real. | Carlos + Josef + responsables de módulos | Antes de la siguiente demo de integración. | Una base nueva arranca con la guía; los datos persisten tras reiniciar y existe evidencia de restauración. |
| Acordar las fuentes de rutas, coordenadas, posiciones y ETA, y las de CO₂ evitado y pedidos en riesgo. | Josef + William + Carlos | Antes de integrar la fuente operativa del mapa. | Contrato documentado y prueba de mapa con datos de la API, sin depender de fixtures para acreditar la operación. |
| Implementar el flujo de generación, asignación y despacho restante, con la versión base del motor VRPTW / Green VRP y su medición de rendimiento. | William + Carlos | Planning de continuación de PMV-2. | Demo pedido → ruta → despacho → entrega, con capacidad, ventanas y permisos verificados, y tiempo medido contra RNF-001 con 150 pedidos y 15 vehículos. |
| Completar la revisión del mapa y de las vistas por perfil. | Valentino + Alex + Josef | Siguiente revisión. | Lista de aceptación, interacción con el mouse y uso móvil evaluados por un revisor distinto del implementador. |
| Consolidar commits, Pull Requests, enlaces y trazabilidad del incremento. | Josef + Alex + equipo | Antes del cierre formal del sprint. | PR revisado, evidencias accesibles, Jira conciliado y aceptación registrada por historia. |
| Corregir el README y los documentos de Inicio señalados en la auditoría de coherencia (los del Sprint 1 ya se corrigieron en V_1_1_0). | Alex + Carlos | Antes de la siguiente revisión. | Cada hallazgo de la auditoría cerrado o justificado y los enlaces comprobados. |

La siguiente retrospectiva debe comprobar estas acciones y registrar resultados, obstáculos y fechas reales. La [revisión de este sprint](03%20Revisi%C3%B3n%20del%20Sprint%20V_1_4_0.md) y el [registro de impedimentos](02%20Registro%20de%20Impedimentos%20V_1_5_0.md) sirven de base de seguimiento.

## Anexo B — Edición anterior V_2_0_0 (conservada como antecedente)

Texto de la edición anterior; se conserva su contenido y sus cifras con la fecha de esa edición. Solo se ajustaron enlaces y niveles de encabezado. El estado vigente es el de las secciones anteriores de este documento.

> **HISTÓRICO — no vigente.** Contenido previo conservado; solo se ajustan navegación y enlaces. Las cifras, fechas, responsables y cierres son registros atribuidos al autor indicado; no se reejecutaron ni se ratificaron en esta revisión documental. Vigente: [04 Retrospectiva del Sprint V_2_1_0](04%20Retrospectiva%20del%20Sprint%20V_2_2_0.md).

### Retrospectiva del Sprint

**Nombre del Proyecto:** EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Líder del Proyecto:** Ore Campos, Josef Pablo

**Sprint:** Sprint 2 — mapa con filtros, inicio de sesión, administración de usuarios y persistencia de las vistas.

**Versión del documento:** V_2_0_0. Actualiza V_1_0_0; no constituye una nueva versión publicada del producto.

**Fecha de elaboración:** 09/10/2026

**Rama actual:** `main`.

**Referencia del repositorio:** `97b401b` como HEAD inspeccionado. Se incorporan los resultados técnicos y las solicitudes de la sesión del 09/10/2026.

**Estado:** Insumo para la retrospectiva. Las acciones, responsables y fechas siguientes son propuestas para confirmar con el equipo; no se registra una reunión ni acuerdos que todavía no tienen evidencia.

#### ¿Qué aprendimos?

- La fidelidad del mapa requiere distinguir el área navegable, la cobertura logística y el encuadre de los elementos. El margen de 10 km permite explorar el entorno sin perder el contexto de Lima.
- La referencia visual y las iteraciones de diseño ayudaron a concretar colores suaves, marcadores pastel y cuadros de detalle menos invasivos. La solicitud de reducir la saturación mostró la necesidad de combinar capas con filtros de pedidos y estados, conservando la selección y el encuadre de los resultados.
- El control por roles necesita una matriz común y comprobaciones en el servidor, además de navegación y botones adecuados. Las descripciones generales del diseño pueden diferir de los permisos explícitos del documento de Usuarios.
- La autorización y la autenticación son entregables distintos. Ahora los permisos usan una identidad validada en PostgreSQL; se comprobaron vigencia, revocación, CSRF, límite de intentos y acceso a recursos propios del conductor.
- Los datos relacionados y las pruebas en PostgreSQL permiten comprobar constraints, geometría y rollback durable que los dobles de repositorio no demuestran.
- Un archivo de entorno configura la aplicación, pero no crea usuarios. Activar `python.terminal.useEnvFile` tampoco registra una cuenta ni cambia el hash de su contraseña. El primer administrador necesita un comando de alta y las cuentas posteriores se crean desde Administración.
- La ausencia de datos en pantalla puede deberse a una base distinta, migraciones faltantes o variables heredadas de una terminal. Se alinearon `.env`, la base sembrada y la migración de sesiones; los valores actuales del archivo prevalecen al arrancar la API.
- Una consulta real a PostgreSQL puede contener datos sintéticos. Las rutas y posiciones generadas permiten validar la interfaz y los permisos, pero no demuestran GPS, enrutamiento vial ni resultados de una operación real.
- Completar una tarea visual o un generador de datos no significa completar la historia de negocio. El cierre requiere integración, criterios de aceptación y revisión del incremento.

#### Situaciones observadas y ajustes realizados

| Situación de la sesión | Ajuste realizado | Resultado o límite |
|---|---|---|
| El administrador local no podía iniciar sesión. | Se verificó la cuenta persistida y se habilitó una excepción explícita en el comando para la contraseña corta del primer administrador. | Acceso y cierre de sesión comprobados; las cuentas creadas en la interfaz siguen requiriendo al menos 12 caracteres. No se publican credenciales. |
| Los datos generados no aparecían en las vistas. | Se hizo coincidir la conexión de la API con `ecologistica_seed_test`, se aplicó la migración de sesiones y se conservó el administrador existente. | Lecturas verificadas: 1.050 pedidos en la base y 150 en el mapa del día; 21 usuarios, incluidos los 20 del generador. |
| La aplicación heredaba configuración anterior de una terminal. | Se dio prioridad al archivo `.env` al iniciar scripts y API, con comprobación de regresión. | La conexión actual es reproducible al reiniciar la API después de editar el archivo. |
| La interfaz conservaba señales de pruebas y distribución poco uniforme. | Se retiraron selector de perfiles y avisos demo; se reorganizaron navegación, formularios y contenido con superficies claras. | La interfaz principal usa sesiones y API, conserva la paleta y adapta sus controles a móvil. |
| El mapa concentraba demasiados pedidos y rutas. | Se añadieron filtros por estado del pedido, pedido específico y búsqueda, sincronizados con la vista de Pedidos. | Se ocultan elementos ajenos y se actualizan contadores y encuadre; los pendientes sin asignación permanecen consultables. |
| Una prueba de navegador esperaba un conteo incorrecto. | Se corrigió la expectativa y se repitieron los casos afectados, junto con regresiones de encuadre y móvil. | Los casos dirigidos pasaron; queda repetir la corrida global sobre el commit que se presente para aceptación. |

#### ¿Qué estamos haciendo bien?

- Se utiliza un mapa reutilizable con perfiles de vista y capas independientes para rutas, pedidos, camiones y almacén.
- Se incorporaron las correcciones de límites, presentación, iconos y cierre de cuadros solicitadas durante el desarrollo, conservando pruebas de interacción y de vistas móviles.
- Los cinco roles de producción comparten una política ejecutable entre frontend y backend, con pruebas de paridad y de rechazo de accesos no autorizados.
- El inicio de sesión y el alta administrativa evitan depender de una selección visual de identidad. El vínculo persistente entre usuario, conductor y vehículo permite comprobar permisos por recurso.
- Las vistas consultan PostgreSQL mediante la API común; los errores de conexión se muestran sin sustituir los resultados por ejemplos. Indicadores y CSV usan los mismos datos y periodos.
- El generador admite `.env.test`, repetición sin duplicados y comprobación de propiedad. Reconoce las tablas aditivas de sesiones sin aceptar tablas ajenas; la conservación del administrador no requirió borrar el dataset.
- Las pruebas de integración de las vistas revierten las escrituras al terminar. Se complementaron con navegación contra la API local y filtros del mapa en escritorio y a 390 px.
- Se mantuvo la paleta al aclarar la interfaz y se reutilizó el mismo filtrado para marcadores, rutas, vehículos, contadores y lista, reduciendo inconsistencias entre pantallas.
- Se documentan comandos, resultados y límites de la demostración; las credenciales locales se excluyen de Git y la plantilla `.env.example` se conserva versionada.

#### ¿Qué podemos hacer mejor?

##### Personas

Mantener las responsabilidades de referencia del equipo y confirmar capacidad para la integración restante:

| Responsable propuesto | Enfoque del siguiente trabajo | Coordinación necesaria |
|---|---|---|
| Ore Campos, Josef Pablo | Mapa, composición por vista y coordinación del incremento. | Valentino para UX; Carlos y William para datos operativos. |
| Tovar Sánchez, Carlos Alberto | Despliegue de persistencia, revisión de sesiones y confirmación integrada con despacho. | William para API y seguridad; Alex para permisos del conductor. |
| Rojas Camayo, Valentino Jhan Pierre | Coherencia visual, filtros y evaluación de accesibilidad. | Josef para mapa; Carlos para contratos y errores de API. |
| Rojas Peña, William Mikeiel | Optimizador avanzado, matriz vial, indicadores y servicios externos. | Carlos para datos persistidos; Josef para rutas y posiciones. |
| Cueva Ricse, Alex Roberto | Pruebas de aceptación de roles, entregas y revisión documental. | Carlos para perfiles; revisión cruzada con los responsables de cada módulo. |

Estas propuestas retoman el plan de desarrollo y no sustituyen las asignaciones históricas confirmadas en la retrospectiva anterior. Cada entrega debe contar con un revisor distinto del implementador.

##### Relaciones

- Revisar con logística y representantes de conductores la composición de vistas, las consultas autorizadas y los casos de incidencia antes de cerrar sus contratos.
- Registrar las decisiones de permisos en el documento de Usuarios y en la política compartida, evitando cambios aislados por pantalla.
- Revisar con usuarios el alcance de los filtros por estado de pedido y la consulta de pendientes sin ruta, conservando acceso rápido a limpiar los filtros.
- Mantener una sincronización breve sobre contratos entre módulos y registrar dudas o impedimentos con responsable y próxima revisión.

##### Procesos

- Desglosar las historias en tareas de interfaz, contratos, persistencia, integración y aceptación. Registrar el avance parcial sin trasladarlo automáticamente a estado Done.
- Continuar la política `feature/<persona>/spr<N>/<módulo>/<acción>` y documentar las ramas existentes `feature/josef/spr2/map` y `feature/josef/spr2/auth` al preparar sus PR. Su nombre no acredita cierre de sprint.
- Revisar cada PR con la arquitectura hexagonal, los criterios de aceptación y las pruebas apropiadas; preservar el dominio independiente de frameworks e infraestructura.
- Vincular los resultados de pruebas al commit o árbol de trabajo evaluado y completar la aceptación del PMV con evidencia del flujo integrado.
- Separar alta inicial, migración y carga sintética en la guía de arranque; comprobar conexión y cantidades antes de atribuir una lista vacía a la interfaz.
- Diferenciar las comprobaciones de navegador con API interceptada de las realizadas con PostgreSQL; registrar cuándo se sustituye la cartografía y qué integraciones quedan sin validar.
- Mantener los enlaces documentales cuando se reorganizan archivos entre `development/` y `docs/`, para que la evidencia siga siendo accesible.

##### Herramientas

- Utilizar una base exclusiva y `.env.test` para la carga sintética. Confirmar que la API apunta a la base elegida en `.env` y reiniciarla después de cambios de conexión.
- Usar `scripts/check_database.py` para diagnosticar consultas y cantidades; `scripts/migrate.py` para la migración aditiva y `scripts/create_admin.py` para el primer administrador. El alta posterior corresponde a la interfaz administrativa.
- Incorporar las suites backend, frontend y navegador al flujo de revisión y, posteriormente, al pipeline de integración.
- Ejecutar la suite con los cinco perfiles y comprobar accesos directos, recursos ajenos, fallos de sesión y mutaciones rechazadas.
- Mantener sincronizados Jira, los PR y el backlog de `development/`; registrar explícitamente las tareas que continúan.

##### Acciones a realizar

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

La siguiente retrospectiva debe comprobar estas acciones y registrar resultados, obstáculos y fechas reales. La [revisión de este incremento](03%20Revisi%C3%B3n%20del%20Sprint%20V_1_4_0.md) y la [guía de inicio de sesión y persistencia](../Gu%C3%ADas%20t%C3%A9cnicas/Inicio%20de%20sesi%C3%B3n%20y%20persistencia.md) registran el alcance actualizado. El [estado de desarrollo](../../../development/estado-actual.md) y el backlog requieren conciliar sus pendientes históricos con esta revisión.

## Control de versiones del documento

| Versión | Fecha | Autoría / cambio |
|---|---|---|
| V_1_0_0 | 09/10/2026 | Tovar Sánchez, Carlos Alberto. Retrospectiva del Sprint 2 con aprendizajes, aciertos, mejoras por categoría y acciones propuestas pendientes de confirmar. |
| V_1_1_0 | 09/10/2026 | Tovar Sánchez, Carlos Alberto. Se unifica con la retrospectiva de la rama `feature/josef/spr2/auth` (mapa visual, autorización por roles y base de pruebas): una sola tabla de responsables, aprendizajes integrados y acciones sin duplicados. |
| V_1_2_0 | 09/10/2026 | Tovar Sánchez, Carlos Alberto. Se actualizan los enlaces y se registra que los documentos del Sprint 1 ya fueron corregidos. |
| V_1_3_0 | 29/10/2026 | Tovar Sánchez, Carlos Alberto. Corrige afirmaciones que `main` ya contradecía (autenticación, persistencia y API única integradas; ramas de Josef en `main` sin Pull Request), actualiza las cifras de pruebas del 29/10, los procesos y tres acciones, y agrega el aprendizaje sobre contrastar los documentos con `main`. |
| V_1_0_0 | 09/10/2026 | Aprendizajes iniciales sobre mapa, roles y preparación de datos. |
| V_2_0_0 | 09/10/2026 | Incorpora diagnóstico del login y entorno, persistencia, administración, distribución visual y filtros; revisa aprendizajes y acciones siguientes. |
| V_2_1_0 | 29/10/2026 | Rojas Camayo, Valentino Jhan Pierre (PR #25). Actualización documental; pendiente de revisión del equipo. Compromisos preventivos propuestos con problema, responsable pendiente, frecuencia y comprobación; fuentes históricas conservadas. |
| V_2_2_0 | 30/10/2026 | Tovar Sánchez, Carlos Alberto. Documento único vigente: se integran las dos retrospectivas anteriores como anexos y se retira la carpeta Histórico. |


[← Volver al índice correspondiente](README.md)
