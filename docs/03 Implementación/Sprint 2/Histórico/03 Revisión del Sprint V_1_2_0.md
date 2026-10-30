> **HISTÓRICO — no vigente.** Contenido previo conservado; solo se ajustan navegación y enlaces. Las cifras, fechas, responsables y cierres son registros atribuidos al autor indicado; no se reejecutaron ni se ratificaron en esta revisión documental. Vigente: [03 Revisión del Sprint V_1_3_0](../03%20Revisi%C3%B3n%20del%20Sprint%20V_1_3_0.md).

# Revisión del Sprint — Sprint 2

**Nombre del Proyecto:** EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Líder del Proyecto:** Ore Campos, Josef Pablo

**Sprint:** Sprint 2 — interfaces por rol con el sistema de diseño, mapa visual, autorización por roles, inicio de sesión, persistencia y preparación de datos de prueba.

**Fecha de elaboración:** 09/10/2026; actualizado el 29/10/2026

**Versión del documento:** V_1_2_0

**Estado:** documento preparado para la reunión de revisión. **La aceptación del sprint está pendiente:** las fechas efectivas de inicio y cierre, los asistentes, la decisión por historia y los acuerdos se registran en la reunión.

> **Actualización V_1_2_0 (29/10/2026).** La versión V_1_1_0 describía la autenticación, la persistencia en PostgreSQL y la API única como pendientes, y las ramas de Josef como «sin integrar». El 09/10, después de redactarla, esas ramas entraron a `main` (commits `c314f64`, `a07136a`, `68d2b60`, `c981e8a` y `97b401b`, sin Pull Request). Esta versión corrige esas afirmaciones contrastándolas con `main` (commit `30969da`). Lo que sigue pendiente se mantiene.

> **Documento único de revisión del Sprint 2.** Reúne la revisión de la serie de interfaz por rol (Tovar Sánchez, Carlos Alberto) y la del mapa visual, la autorización por roles, el inicio de sesión y la base de pruebas (Ore Campos, Josef Pablo). La revisión suelta de Josef (`05 Revisión del Sprint V_2_0_0.md`, 09/10/2026) se retiró de la carpeta el 29/10/2026 porque este documento incorpora su contenido; sigue disponible en el historial de Git.

**Referencias del repositorio evaluado:**

- `main`, commit `30969da` (29/10/2026): incluye la serie de interfaz, el mapa, la autenticación y la persistencia.
- Serie de interfaz por rol: commits de la rama `feature/carlos/spr2/m_pedidos/confirmacion` hasta `1bf3ee8` (Pull Requests #12 a #21, **abiertos**; su código ya está en `main`).
- Mapa visual, autorización, inicio de sesión y base de pruebas: commits `c314f64`, `a07136a`, `c981e8a` y `97b401b` de Josef, integrados a `main` el 09/10 sin Pull Request.
- Arquitectura del backend: commits `960e63c` y `51b2223` en `main`.

## Historias de Usuario completadas en este Sprint

En este Sprint 2 se completaron tareas técnicas de interfaz, presentación del mapa, control de permisos, inicio de sesión, persistencia y generación de datos de prueba. **Ninguna historia se da por cerrada:** una pantalla o un generador de datos no acredita por sí solo el criterio de aceptación, y el flujo íntegro pedido → generación de ruta → despacho → entrega del objetivo de PMV-2 todavía requiere el optimizador, el despacho y la validación de despliegue.

| Historia / tarea | Trabajo realizado | Estado para la revisión (29/10/2026) |
|---|---|---|
| **US-003** Pedidos y rutas | Pantalla del Planificador con resumen, buscador, pestañas con conteo, lista agrupada por estado, detalle, registro, edición y cancelación (se conserva la regla: solo se modifican pedidos pendientes y sin conductor). | Implementado sobre la API y PostgreSQL; asignación a ruta y aceptación pendientes. *(V_1_1_0: «implementado en demo».)* |
| **US-001 / US-002** Flota | Pantalla con resumen, lista por estado, etiquetas de bajas emisiones y diálogo de registro y edición con validación visible. | Implementado sobre la API y PostgreSQL; aceptación pendiente. *(V_1_1_0: «datos en memoria».)* |
| **US-005** Generar rutas | Configuración de prioridad, ventanas y bajas emisiones; avance por pasos; resultado con rutas, km, CO₂ y cumplimiento de ventanas; mensaje «No hay vehículos disponibles para generar rutas en este momento» y límite de cálculo tomado de los parámetros del algoritmo. | Interfaz, caso de uso y propuesta estimada con datos de la base listos; **motor de optimización VRPTW pendiente**. Una propuesta calculada no se guarda como ruta aprobada ni avisa a los conductores. |
| **US-004 / EN-05** Conductor | «Mi ruta» (paradas, avance, aviso de reoptimización) y «Pedido actual» con hoja de confirmación; objetivos táctiles de 48 px comprobados en navegador. | Implementado sobre la API (`/conductor/ruta`, confirmación e incidencias con permisos por recurso); accesibilidad sin certificar. *(V_1_1_0: «Incidencias y ruta real pendientes».)* |
| **US-006 / RF-004** Visualizar rutas activas | Mapa Leaflet y OpenStreetMap con capas, pines por estado, selección sincronizada con la lista y alternativa con lista si no cargan los datos o las teselas. Amplía el mapa de Lima con navegación restringida (margen de 10 km), capas configurables y filtros por estado del pedido, pedido específico y búsqueda por cliente, número o placa. | Lectura persistente y filtros implementados; actualización en tiempo real y aceptación pendientes. |
| **US-007 / RF-004** Detalle vehicular en el mapa | Camiones independientes, selección y cuadros de detalle de pedidos, rutas y vehículos, con cierre mediante el mouse. | Interacción implementada; las posiciones de la base de pruebas son simuladas; GPS y ETA reales pendientes. |
| **US-008** Dashboard | Pedidos y CO₂ lado a lado, mapa de solo lectura, lista de pedidos en riesgo y filtro por distrito; se conservan la actualización cada 60 s y la prueba de arquitectura hexagonal. | Implementado sobre la API; factores de emisión y línea base sin validar con datos operativos. *(V_1_1_0: «CO₂ evitado y pedidos en riesgo son de ejemplo».)* |
| **US-010 / US-011** Sostenibilidad | Reporte por semana, mes o trimestre con gráfico, tablas por distrito y vehículo y exportación de un CSV con los datos del periodo mostrado. | Implementado sobre `/reports/sustainability`; rendimiento (P95 1,5 s), factores y fuente operativa pendientes. *(V_1_1_0: «cálculo y fuente real pendientes».)* |
| **Administración** | Pestañas de usuarios y roles, parámetros del algoritmo (peso CO₂/tiempo, tiempo máximo, carga máxima, holgura de ventana, reoptimización automática y factores de emisión), integraciones y auditoría. Los parámetros se guardan por el puerto `AlgorithmSettings` con validación previa. | Alta de usuarios (sin registro público), parámetros y auditoría conectados a la API; sin valores inventados para GNV ni eléctrico; las integraciones externas siguen pendientes. |
| **EN-02 / T-01 / T-09** Inicio de sesión y autorización | Cuenta activa en PostgreSQL con hash de contraseña, cookie de sesión, expiración, revocación, CSRF y límite de intentos; matriz compartida ROL-01 a ROL-05 entre frontend y backend, acceso por URL y comprobación de recursos propios del conductor. | Login y autorización integrados en `main`; faltan cabeceras de seguridad, auditoría anonimizada, bloqueo de inyección SQL, Ley N.° 29733 y la revisión de seguridad. *(V_1_1_0: «autenticación productiva pendiente».)* |
| **EN-00 / T-02** Persistencia y datos de prueba | Adaptadores PostgreSQL, esquema vacío, migración de sesiones, alta inicial del administrador y generador con `.env.test` (siete días: 1.050 pedidos, 70 rutas, 15 vehículos y 15 conductores). | API conectada al esquema local; validación de migraciones en despliegue y recuperación pendientes. *(V_1_1_0: «la API aún no usa los adaptadores SQL».)* |

El trabajo de mapa adelanta la preparación visual de PMV-3 dentro del incremento actual. No se declara completada US-005 ni el flujo íntegro de PMV-2: el optimizador y el despacho todavía requieren desarrollo.

## Demostración del trabajo completado

La demostración del Sprint 2 muestra los artefactos y comportamientos realmente disponibles. Reproducirla exige PostgreSQL local con PostGIS, `.env` con `DATABASE_URL`, `scripts/migrate.py`, la base de pruebas (`scripts/create_test_db.py --env-file .env.test`) y el primer administrador (`scripts/create_admin.py`); los detalles están en la guía de inicio de sesión y persistencia.

**Recorrido por rol (con sesión iniciada):**

1. **Acceso:** ingresar con una cuenta activa, cerrar sesión y comprobar la revocación. No hay selector de perfiles ni registro público; el administrador crea las demás cuentas.
2. **Pedidos y rutas (Planificador):** buscar por placa o distrito, filtrar por estado, elegir un pedido y ver su ruta en el mapa; registrar, editar y cancelar un pedido pendiente.
3. **Flota:** registrar un vehículo con un valor inválido para ver la validación, corregirlo y ver los conteos por estado.
4. **Generar rutas:** configurar la prioridad, generar la propuesta estimada y comprobar el caso «sin vehículos disponibles». Explicar que el motor de optimización aún no existe y que la propuesta no se publica.
5. **Conductor (móvil, 390 px):** recorrer «Mi ruta», abrir la parada actual, confirmar la entrega y ver que el avance se actualiza.
6. **Mapa:** combinar capas, filtrar por **Pendientes** o **En camino**, seleccionar un pedido o buscar por cliente, número o placa, y limpiar los filtros.
7. **Dashboard y sostenibilidad (Responsable de Logística):** elegir un pedido en riesgo y verlo en el mapa; cambiar de periodo y exportar el CSV.
8. **Administración:** crear una cuenta, cambiar un parámetro, ver un error de validación, guardar y comprobar que «Generar rutas» usa el nuevo tiempo máximo.
9. **Permisos:** probar administrador, planificador, conductor, logística y auditor; el servidor rechaza accesos insuficientes y recursos ajenos aunque se entre por URL.
10. **Datos:** indicar que los pedidos, las rutas y las posiciones de la base de pruebas son sintéticos y que no acreditan una operación real ni GPS.

| Evidencia registrada | Resultado | Alcance de la comprobación |
|---|---|---|
| **`main`, commit `30969da` (29/10/2026) — frontend** | 273 pruebas de Vitest, 9 de Node y 40 de navegador aprobadas; lint, tipos y compilación sin errores. | Interfaz por rol, login, permisos, mapa y filtros, CSV (incluida una descarga real), objetivos táctiles de 48 px y ausencia de desbordamiento a 390 px. No acredita certificación de accesibilidad ni rendimiento. |
| **`main`, commit `30969da` (29/10/2026) — backend** | 225 pruebas aprobadas, 5 omitidas y 36 subpruebas. | Dominio, casos de uso, API, sesiones, permisos y vistas. Las 5 omitidas son las de integración con un PostgreSQL real, que no se ejecutó. Requiere instalar `requirements-postgres.txt`. |
| Frontend sobre `1bf3ee8` (09/10/2026, serie de interfaz) | 247 pruebas de Vitest, 9 de Node y 22 de navegador aprobadas. | Medición anterior sobre la rama de Carlos, sin el trabajo de Josef; se conserva como antecedente. |
| Backend sobre `1bf3ee8` (09/10/2026) | 169 pruebas y 36 subpruebas aprobadas, con almacenamiento en memoria. | Medición anterior; se conserva como antecedente. |
| Frontend y backend de Josef (reportado por él el 09/10/2026) | 273 pruebas de Vitest y 9 de Node, 37 casos de navegador tras el login, y 226 pruebas con 36 subpruebas (4 omitidas) en el backend; dos comprobaciones reales de la base de pruebas. | Documentadas por Josef en su revisión del 09/10/2026 (retirada; ver la nota inicial); incluyen PostgreSQL real, que no se repitió el 29/10. |

Estos resultados no equivalen a la aprobación de los interesados.

## Entorno y datos verificados (reportado por Josef el 09/10/2026)

Se preparó PostgreSQL local con PostGIS. El generador se ejecutó para la base de pruebas `ecologistica_seed_test` mediante `.env.test`; después se configuró la API en `.env` para consultar esa misma base y se aplicó la migración `001_sessions.sql`. El conjunto de siete días contiene **1.050 pedidos, 70 rutas, 15 vehículos y 15 conductores**, con 20 cuentas del generador (21 usuarios con el administrador local).

Las comprobaciones del mapa del día leyeron **150 pedidos** desde la API: el filtro **En camino** mostró 24 pedidos y 4 rutas, un pedido asignado dejó visibles un pedido, una ruta y un camión, y limpiar los filtros restauró los 150 pedidos. Estos resultados demuestran persistencia y consulta con datos de pruebas, no entregas de una operación real: geometrías, posiciones, factores ambientales y restricciones son sintéticos. Los comandos de arranque (`scripts/migrate.py`, `check_database.py`, `create_admin.py`, `run_backend.py`) están en la guía de inicio de sesión y persistencia de `development/`.

## Pendientes

- Revisar y cerrar o fusionar los Pull Requests abiertos (#7, #11 y #12 a #21): su código ya está en `main` y falta la revisión de un par técnico.
- Revisar la seguridad del inicio de sesión integrado sin Pull Request (expiración, revocación, CSRF, límite de intentos y permisos) y validarla en el despliegue; activar la protección de `main`.
- Validar las migraciones, el reinicio, la recuperación y la concurrencia de PostgreSQL con una base nueva; ejecutar las pruebas de integración con PostgreSQL real.
- Implementar el motor de optimización VRPTW / Green VRP, la aprobación, la asignación y el despacho de rutas, y medir el rendimiento (RNF-001).
- Incorporar fuentes operativas de GPS, ETA y actualización del mapa, y validar factores de emisión y línea base con datos operativos. Las geometrías, posiciones y métricas actuales son sintéticas.
- Integrar tráfico, notificaciones y reoptimización; las integraciones externas siguen pendientes. Definir el alcance del rol Auditor Externo en la interfaz.
- Completar EN-02: cabeceras de seguridad, auditoría anonimizada, bloqueo de inyección SQL y Ley N.° 29733.
- Validar concurrencia, rendimiento, seguridad y accesibilidad con evidencia propia; medir cobertura (RNF-001, RNF-005 y RNF-007).
- Conciliar Jira con el backlog y registrar la aceptación por historia y la decisión de cierre del sprint.

Los responsables y las fechas de resolución se confirman en la revisión. El incremento aporta una base verificable para continuar el desarrollo; PMV-2, PMV-3, EN-00 y EN-02 conservan los pendientes descritos.

[← Volver al README Principal](../../../../README.md)

### **Control de versiones del documento**

| Versión | Fecha | Autor | Descripción del cambio |
|---|---|---|---|
| V_1_0_0 | 09/10/2026 | Tovar Sánchez, Carlos Alberto | Revisión del Sprint 2 con el estado real de cada historia, la pauta de demostración y el registro de la reunión pendiente de completar. |
| V_1_1_0 | 09/10/2026 | Tovar Sánchez, Carlos Alberto | Se unifica con la revisión de la rama `feature/josef/spr2/auth` (mapa visual, autorización por roles y base de pruebas): se integran su demostración, su evidencia de pruebas y sus pendientes sin duplicarlos. |
| V_1_2_0 | 29/10/2026 | Tovar Sánchez, Carlos Alberto | Corrige afirmaciones que `main` ya contradecía (autenticación, persistencia en PostgreSQL, API única y datos desde la API están integradas; las ramas de Josef están en `main` sin Pull Request), reemplaza la evidencia de pruebas por la del 29/10 sobre `30969da` y actualiza el estado de cada historia, la demostración y los pendientes. Absorbe la revisión de Josef (`05 Revisión del Sprint V_2_0_0.md`), que se retira de la carpeta. |


[← Volver al índice correspondiente](README.md)
