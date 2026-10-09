# Revisión del Sprint

**Nombre del Proyecto:** EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Líder del Proyecto:** Ore Campos, Josef Pablo

**Sprint:** Sprint 2 — incremento de mapa visual, autorización por roles y preparación de datos.

**Fecha de elaboración:** 09/10/2026

**Rama actual:** `feature/josef/spr2/auth`.

**Referencia del repositorio:** `c314f64` para mapa y `a07136a` como HEAD inspeccionado. El generador de base de pruebas y esta documentación incluyen cambios del árbol de trabajo pendientes de commit y revisión.

**Estado:** Documento preparado para la revisión; aceptación formal del sprint pendiente. Las fechas efectivas de inicio y cierre, evaluadores y PR de integración deben registrarse en la reunión.

## Historias de Usuario completadas en este Sprint

En este incremento se completaron tareas técnicas de presentación del mapa, control de permisos y generación de datos de pruebas. Las historias y enablers asociados conservan alcance pendiente: la implementación visual o las pruebas con datos sintéticos no acreditan por sí solas su cierre integral ni la aceptación de un PMV.

| Historia / tarea | Trabajo realizado | Estado para la revisión |
|---|---|---|
| **US-006 / RF-004 / T-MAP-VIS:** Visualizar rutas activas | Mapa de Lima, navegación restringida con margen ampliado de 10 km por lado, capas configurables y estados de contingencia. | Incremento visual implementado; fuente operativa y actualización pendientes. |
| **US-007 / RF-004:** Detalle vehicular en mapa | Camiones independientes, selección y cuadros de detalle de pedidos, rutas y vehículos; cierre con el mouse. | Interacción visual implementada; GPS y ETA reales pendientes. |
| **EN-02 / T-01 / T-09:** Autorización por roles | Matriz compartida ROL-01–05, acceso por URL, controles por perfil, API común y comprobación de recursos propios del conductor. | Autorización implementada en módulos existentes; autenticación productiva y auditoría operativa pendientes. |
| **EN-00 / T-02:** Base de pruebas | Comando configurado mediante `.env`, esquema PostgreSQL/PostGIS y datos relacionados de todos los módulos; carga repetible y reinicio transaccional. | Generador verificado con PostgreSQL real; conexión de la API y migraciones productivas pendientes. |

El trabajo de mapa adelanta la preparación visual de PMV-3 dentro del incremento actual. No se declara completada US-005 ni el flujo íntegro pedido → generación → despacho → entrega del objetivo de PMV-2: el optimizador y la integración operativa todavía requieren desarrollo.

## Demostración del trabajo completado

La demostración propuesta para la revisión muestra los siguientes artefactos y comportamientos disponibles:

1. **Mapa de Lima:** cartografía vectorial clara, áreas verdes y agua suaves, iconos de pedidos y camiones con relleno pastel, rutas finas y controles de zoom y reencuadre. El área navegable mantiene visibles las zonas de interés sin permitir una vista mundial.
2. **Capas e interacción:** rutas, pedidos, camiones y almacén juntos o separados según el perfil de vista. Selección sincronizada con la lista, cuadros de detalle que se cierran con el mouse y alternativa de consulta ante fallos de carga del mapa.
3. **Roles:** perfiles de administrador, planificador, conductor, responsable de logística y auditor externo. El selector funciona únicamente en modo demo; el modo HTTP exige identidad verificada. La navegación y las operaciones siguen la sección 4 del documento de Usuarios, con denegación de accesos insuficientes y de recursos ajenos.
4. **API común:** pedidos, confirmación, vehículos, conductores, dashboard y sesión compuestos en una misma aplicación. Las mutaciones requieren verificación del servidor; un rol enviado por URL o cabecera no reemplaza una identidad autenticada.
5. **Base de pruebas:** ejecutar `scripts/create_test_db.py` con la conexión definida en `.env`. La configuración predeterminada prepara siete días con 20 usuarios, 15 vehículos, 15 conductores, 1.050 pedidos, 70 rutas, entregas, incidencias, posiciones, zonas, reportes, parámetros y auditoría. `--dry-run` muestra cantidades y `--reset` reinicia los datos de una base identificada por el generador.
6. **Validación:** reproducir los resultados registrados y evaluar los criterios pendientes antes de aprobar historias o cerrar el sprint.

| Evidencia registrada | Resultado | Alcance de la comprobación |
|---|---|---|
| Frontend después del manejo por roles | 264 pruebas Vitest, 9 pruebas Node y 35 pruebas de navegador aprobadas; build y lint aprobados. | Interfaz, permisos, navegación, mapa y regresión de vistas móviles. No acredita login productivo ni certificación de accesibilidad. |
| Backend después del generador de base de pruebas | 217 pruebas y 36 subtests aprobados, incluidas cuatro pruebas de integración real. | PostgreSQL 18/PostGIS aislado: repetición de carga, geometría, constraints, lectura del adaptador, rollback y protección de tablas ajenas. |

Estos resultados proceden de ejecuciones documentadas del 09/10/2026; no se volvieron a ejecutar al redactar esta revisión ni equivalen a aprobación por parte de los interesados.

Documentación de soporte:

- [Mapa visual de Lima](../../development/Mapa%20visual%20de%20Lima.md) y [evidencias cartográficas](evidencias-mapa-visual/).
- [Control de acceso por roles](../../development/Control%20de%20acceso%20por%20roles.md).
- [Base de datos de pruebas](../../development/Base%20de%20datos%20de%20pruebas.md).
- [Plan de sprints](../../development/sprints.md), [backlog](../../development/backlog.md) y [criterios de calidad](../../development/calidad.md).

## Pendientes

- Implementar el proveedor real de autenticación: login, vigencia, revocación, protección de sesión y vínculo persistente entre usuario y conductor.
- Conectar los adaptadores de la API al esquema PostgreSQL; el generador no cambia los repositorios en memoria de la aplicación.
- Incorporar fuentes operativas para mapa, rutas, posición y ETA. Las geometrías, posiciones, restricciones y métricas del dataset son sintéticas.
- Integrar optimización, aprobación, asignación y despacho de rutas; verificar la confirmación de entregas sobre el mismo estado persistente.
- Completar las pantallas y endpoints pendientes de conductores, incidencias, configuración, informes y auditoría, según el alcance de cada módulo.
- Preparar migraciones productivas y validar concurrencia, rendimiento, seguridad y accesibilidad con evidencia específica.
- Consolidar los cambios en commits y PR revisados, conciliar Jira con el backlog y registrar aceptación por historia y decisión de cierre del sprint.

Los responsables y fechas de resolución se confirmarán en la revisión. El incremento aporta una base verificable para continuar el desarrollo; PMV-2, PMV-3, EN-00 y EN-02 conservan los pendientes descritos.

[← Volver al README Principal](../../README.md)
