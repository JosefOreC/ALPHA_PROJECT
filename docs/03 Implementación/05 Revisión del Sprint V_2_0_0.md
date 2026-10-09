# Revisión del Sprint

**Nombre del Proyecto:** EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Líder del Proyecto:** Ore Campos, Josef Pablo

**Sprint:** Sprint 2 — mapa con filtros, inicio de sesión, administración de usuarios y persistencia de las vistas.

**Versión del documento:** V_2_0_0. Actualiza V_1_0_0; no constituye una nueva versión publicada del producto.

**Fecha de elaboración:** 09/10/2026

**Rama actual:** `main`.

**Referencia del repositorio:** `97b401b` como HEAD inspeccionado al actualizar este documento; antecedentes `c314f64` (mapa), `a07136a` (roles) y `c981e8a` (inicio de sesión). Esta revisión documental incorpora el trabajo y las comprobaciones de la sesión del 09/10/2026.

**Estado:** Documento preparado para la revisión; aceptación formal del sprint pendiente. Las fechas efectivas de inicio y cierre, evaluadores y PR de integración deben registrarse en la reunión.

## Trabajo realizado y avance de historias

El incremento incluye autenticación persistente, conexión de los módulos a PostgreSQL/PostGIS, administración de cuentas y mejoras de distribución visual. La interfaz principal ya no presenta selector de usuarios, avisos demo ni datos de ejemplo como respaldo ante errores. Los datos sintéticos se mantienen en el entorno de pruebas. La tabla distingue la implementación disponible de la aceptación integral de las historias y enablers.

| Historia / tarea | Trabajo realizado | Estado para la revisión |
|---|---|---|
| **US-006 / RF-004 / T-MAP-VIS / T-05:** Visualizar rutas | Mapa conectado a la API, capas independientes, margen de navegación de 10 km y filtros por estado del pedido, pedido específico y búsqueda por cliente, número o placa. Solo se muestran las rutas y vehículos relacionados con los pedidos filtrados. | Lectura persistente y filtros implementados; actualización en tiempo real y aceptación funcional pendientes. |
| **US-007 / RF-004:** Detalle vehicular en mapa | Selección, cuadros de detalle y reencuadre sobre los elementos visibles; conservación del pedido pendiente sin ruta ni camión asignado. | Interacción implementada; las posiciones de la base de pruebas son simuladas, GPS y ETA operativos pendientes. |
| **EN-02 / T-01:** Inicio de sesión y autorización | Cuenta activa en PostgreSQL, contraseña con hash, cookie de sesión, expiración, revocación, CSRF y límite de intentos. Cinco roles con permisos comprobados en el servidor y acceso del conductor a recursos propios. | Login y autorización integrados; revisión de seguridad y despliegue pendientes. |
| **T-09 / EN-02:** Administración | Alta de usuarios desde el administrador, sin registro público; vínculo entre cuenta, conductor y vehículo; parámetros, integraciones y auditoría consultados desde la base. | Flujos disponibles y comprobados; servicios externos conservan su estado pendiente. |
| **EN-00 / T-02:** Persistencia y preparación de datos | Adaptadores PostgreSQL, creación de esquema vacío, migración aditiva de sesiones, alta inicial de administrador y generador separado mediante `.env.test`. | API conectada al esquema local; validación de migraciones en despliegue y recuperación pendientes. |
| **US-001–004 / US-012–013 / RF-001–002 / RF-007:** Gestión y entrega | Pedidos, flota y conductores persistentes; confirmación de entrega sobre el pedido asignado e incidencias con permisos por recurso. | Flujos de gestión conectados; despacho integrado y criterios restantes de cada historia pendientes. |
| **US-008–011 / RF-005–006 / T-06:** Indicadores y reportes | Dashboard, sostenibilidad y CSV leen pedidos y rutas guardadas; fechas de Lima y distribución por distrito sin duplicar emisiones. | Consultas integradas; factores y línea base operativos, rendimiento y aceptación pendientes. |
| **US-005 / RF-003 / EN-01:** Planificación | Propuesta con pedidos, vehículos y parámetros de la base; cálculo de cercanía, capacidad y ventanas con distancias geográficas. | Propuesta estimada disponible; motor avanzado, aprobación y publicación de rutas pendientes. |
| **EN-05:** Distribución de pantallas | Login, navegación, formularios, tablas y áreas de contenido con estilo claro, adaptación móvil y la misma paleta verde y lima. | Distribución revisada en escritorio y móvil; certificación de accesibilidad pendiente. |

El mapa y los indicadores adelantan trabajo de PMV-3 dentro del incremento actual. No se declara completada US-005 ni el flujo íntegro pedido → generación → despacho → entrega de PMV-2. Una propuesta calculada todavía no se guarda como ruta aprobada ni envía avisos a los conductores.

## Demostración del trabajo completado

La demostración propuesta para la revisión muestra los siguientes artefactos y comportamientos disponibles:

1. **Acceso:** ingresar con una cuenta activa, cerrar sesión y comprobar la revocación. No hay selector de perfiles ni registro público. El administrador crea las demás cuentas; para un conductor se vincula también su perfil y vehículo.
2. **Vistas conectadas:** consultar dashboard, pedidos, flota, conductores, mapa, ruta propia del conductor, sostenibilidad, usuarios, parámetros, integraciones, incidencias y auditoría. Las consultas usan la API y PostgreSQL; un fallo de conexión presenta un error visible.
3. **Distribución visual:** recorrer navegación, formularios y tablas en escritorio y móvil; comprobar superficies claras, espacios consistentes y conservación de la paleta existente.
4. **Mapa y filtros:** combinar capas con estado **Pendientes** o **En camino**, seleccionar un pedido o buscar cliente, número o placa. Los elementos ajenos se ocultan; los contadores, selección y encuadre siguen el resultado. En Pedidos, búsqueda, estado y distrito se sincronizan con la lista. **Limpiar filtros del mapa** recupera la vista completa autorizada.
5. **Permisos:** comprobar administrador, planificador, conductor, logística y auditor. El servidor resuelve la identidad y rechaza accesos insuficientes o recursos ajenos, aunque se intente entrar por URL. Los filtros no amplían el alcance autorizado.
6. **Indicadores y planificación:** contrastar los totales con la base y exportar el mismo periodo a CSV. Mostrar la propuesta estimada sin presentarla como ruta publicada. No se afirma ahorro de kilómetros cuando falta una línea base.
7. **Validación:** reproducir las comprobaciones necesarias y registrar aceptación por historia antes de cerrar el sprint.

## Entorno y datos verificados en la sesión

Se preparó PostgreSQL local con PostGIS. La base inicial vacía y la base de pruebas son entornos distintos. El generador se ejecutó para `ecologistica_seed_test` mediante `.env.test`; después se configuró la API en `.env` para consultar esa misma base y se aplicó la migración `001_sessions.sql`.

El dataset de siete días contiene **1.050 pedidos, 70 rutas, 15 vehículos y 15 conductores**. El generador crea 20 cuentas; la base usada al finalizar la sesión contiene **21 usuarios**, al conservar también el administrador local existente. Configurar `.env` o activar `python.terminal.useEnvFile` no crea una cuenta ni modifica una contraseña guardada.

Las comprobaciones del mapa del día leyeron **150 pedidos** desde la API. El filtro **En camino** mostró **24 pedidos y 4 rutas**; un pedido asignado dejó visibles un pedido, una ruta y un camión. En móvil, un pendiente sin asignación mostró un pedido y ninguna ruta ni camión; limpiar los filtros restauró los 150 pedidos.

Estos resultados demuestran persistencia y consulta con datos de pruebas, no entregas de una operación real. Geometrías, posiciones, factores ambientales y restricciones del dataset son sintéticos.

Comandos de referencia desde la raíz, después de configurar los archivos privados de entorno:

```powershell
# Solo para preparar un entorno de pruebas.
.venv\Scripts\python.exe scripts/create_test_db.py --env-file .env.test
# Con .env apuntando a la base que utilizará la aplicación.
.venv\Scripts\python.exe scripts/migrate.py
.venv\Scripts\python.exe scripts/check_database.py
.venv\Scripts\python.exe scripts/run_backend.py
```

Para una base nueva vacía se usa `scripts/initialize_database.py` y, si no existe administrador, `scripts/create_admin.py`; el alta de las demás cuentas se realiza en la interfaz. Los scripts y la API leen `.env` con prioridad sobre variables heredadas de terminales anteriores. Tras editar la conexión se reinicia la API. Las credenciales permanecen fuera de los documentos y de Git; no se ejecutó un reinicio destructivo del dataset al conservar el administrador.

| Evidencia registrada | Resultado | Alcance de la comprobación |
|---|---|---|
| Frontend con login, persistencia y filtros | 273 pruebas Vitest y 9 pruebas Node aprobadas; build y lint aprobados. Tras el ajuste final de encuadre se aprobaron 27 pruebas dirigidas de mapa y dominio. | Permisos, presentación, filtrado y regresiones de interfaz. |
| Navegador | 37 casos aprobados tras el login; los tres nuevos casos de filtros y las regresiones dirigidas de encuadre, navegación y móvil se aprobaron. | La ejecución ampliada tuvo inicialmente 39/40 aprobados; se corrigió una expectativa de conteo y se revalidaron los casos afectados. No se registra una nueva corrida global final de los 40 casos. |
| Backend | 226 pruebas y 36 subtests aprobados; cuatro pruebas opcionales omitidas. | Sesiones, permisos, planificación, entorno y módulos. Incluye integración de las vistas con PostgreSQL, con escrituras revertidas al terminar. |
| Generador y adaptador PostgreSQL | Dos comprobaciones reales aprobadas sobre la base de pruebas. | Repetición de carga, geometría y rollback del adaptador de pedidos. La validación histórica de cuatro pruebas en un clúster aislado se conserva como antecedente. |
| Navegador conectado a la API local | Login, consultas y filtros verificados en escritorio y a 390 px; sin errores de página ni desbordamiento horizontal en el recorrido. | Datos consultados desde PostgreSQL sin interceptar la API; la cartografía se sustituyó en la comprobación para evitar dependencia externa. No acredita GPS ni conectividad del proveedor cartográfico. |

Estos resultados proceden de las ejecuciones de la sesión del 09/10/2026. No se volvieron a ejecutar las suites al editar estos documentos ni equivalen a aprobación por parte de los interesados.

Documentación de soporte:

- [Mapa visual de Lima](../../development/Mapa%20visual%20de%20Lima.md) y [evidencias cartográficas](evidencias-mapa-visual/).
- [Control de acceso por roles](../../development/Control%20de%20acceso%20por%20roles.md).
- [Base de datos de pruebas](../../development/Base%20de%20datos%20de%20pruebas.md).
- [Inicio de sesión y persistencia](../../development/Inicio%20de%20sesi%C3%B3n%20y%20persistencia.md) y [guía del frontend y filtros](../../src/frontend/README.md).
- [Plan de sprints](../../development/sprints.md), [backlog](../../development/backlog.md) y [criterios de calidad](../../development/calidad.md).

Los documentos de planificación y la guía histórica del generador pueden conservar pendientes anteriores a esta integración. Para el arranque actual se utiliza la guía de inicio de sesión y persistencia; esta revisión registra el corte actualizado del incremento.

## Pendientes

- Incorporar GPS, ETA y actualización operativa del mapa; las lecturas de la API no constituyen seguimiento en tiempo real.
- Integrar matriz vial, optimizador avanzado, aprobación, asignación y despacho de rutas; evaluar el flujo completo junto con la confirmación persistente ya disponible.
- Integrar tráfico, notificaciones y reoptimización; los proveedores externos siguen pendientes.
- Validar factores ambientales y línea base con datos operativos, además de los objetivos de rendimiento del optimizador y los reportes.
- Verificar migraciones en despliegue, recuperación, concurrencia, seguridad y accesibilidad con evidencia específica; repetir la suite completa de navegador sobre el commit que se presente para aceptación.
- Revisar los commits y PR, actualizar los pendientes históricos del backlog, conciliar Jira y registrar aceptación por historia y decisión de cierre del sprint.

Los responsables y fechas de resolución se confirmarán en la revisión. El incremento aporta una base verificable para continuar el desarrollo; PMV-2, PMV-3, EN-00 y EN-02 conservan los pendientes descritos.

## Historial de versiones

| Versión | Fecha | Cambio |
|---|---|---|
| V_1_0_0 | 09/10/2026 | Revisión inicial del mapa, autorización por roles y generador de datos. |
| V_2_0_0 | 09/10/2026 | Incorpora login, administración de cuentas, persistencia de vistas, entorno local, distribución clara y filtros del mapa; actualiza evidencia y pendientes. |

Continuación: [Retrospectiva del Sprint V_2_0_0](06%20Retrospectiva%20del%20Sprint%20V_2_0_0.md).

[← Volver al README Principal](../../README.md)
