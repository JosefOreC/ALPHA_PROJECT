# Revisión del Sprint — Sprint 2

**Nombre del Proyecto:** EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Líder del Proyecto:** Ore Campos, Josef Pablo

**Sprint:** Sprint 2 — interfaces por rol con el sistema de diseño, mapa visual, autorización por roles y preparación de datos de prueba.

**Fecha de elaboración:** 09/10/2026

**Versión del documento:** V_1_1_0

**Estado:** documento preparado para la reunión de revisión. **La aceptación del sprint está pendiente:** las fechas efectivas de inicio y cierre, los asistentes, la decisión por historia y los acuerdos se registran en la reunión.

> **Documento unificado.** Reúne en un solo texto la revisión de la serie de interfaz por rol (Tovar Sánchez, Carlos Alberto) y la revisión del mapa visual, la autorización por roles y la base de pruebas (Ore Campos, Josef Pablo), que se había redactado por separado en la rama `feature/josef/spr2/auth` como «05 Revisión del Sprint». Cuando esa rama se fusione, su versión suelta debe retirarse a favor de este documento.

**Referencias del repositorio evaluado:**

- Serie de interfaz por rol: rama `feature/carlos/spr2/m_pedidos/confirmacion`, commit `1bf3ee8` (Pull Requests #12 a #21, abiertos).
- Mapa visual, autorización por roles y base de pruebas: ramas `feature/josef/spr2/map` (commit `c314f64`) y `feature/josef/spr2/auth` (commit `68d2b60`), sin Pull Request. Ambas parten de la serie de interfaz y la extienden. Según su autor, parte de su documentación y del generador de datos de prueba incluye cambios del árbol de trabajo pendientes de commit y revisión.
- Arquitectura del backend: commits `960e63c` y `51b2223` en `main`.

## Historias de Usuario completadas en este Sprint

En este Sprint 2 se completaron tareas técnicas de interfaz, presentación del mapa, control de permisos y generación de datos de prueba. **Ninguna historia se da por cerrada:** una pantalla que funciona con datos de ejemplo, o un generador de datos, no acredita por sí sola el criterio de aceptación, y el flujo íntegro pedido → generación de ruta → despacho → entrega del objetivo de PMV-2 todavía requiere el optimizador, la persistencia y la autenticación reales.

| Historia / tarea | Trabajo realizado | Estado para la revisión |
|---|---|---|
| **US-003** Pedidos y rutas | Pantalla del Planificador con resumen, buscador, pestañas con conteo, lista agrupada por estado, detalle, registro, edición y cancelación (se conserva la regla: solo se modifican pedidos pendientes y sin conductor). | Implementado en demo; datos persistentes y asignación a ruta pendientes. |
| **US-001 / US-002** Flota | Pantalla con resumen, lista por estado, etiquetas de bajas emisiones y diálogo de registro y edición con validación visible. | Implementado sobre la API de vehículos; datos en memoria. |
| **US-005** Generar rutas | Configuración de prioridad, ventanas y bajas emisiones; avance por pasos; resultado con rutas, km, CO₂ y cumplimiento de ventanas; mensaje «No hay vehículos disponibles para generar rutas en este momento» y límite de cálculo tomado de los parámetros del algoritmo. | Interfaz y caso de uso listos; **motor de optimización pendiente** (propuesta de ejemplo). «Aprobar» solo navega y «Ajustar» está deshabilitado. |
| **US-004 / EN-05** Conductor | «Mi ruta» (paradas, avance, aviso de reoptimización) y «Pedido actual» con hoja de confirmación; objetivos táctiles de 48 px comprobados en navegador. | Implementado en demo; Incidencias y ruta real pendientes; accesibilidad sin certificar. |
| **US-006 / RF-004** Visualizar rutas activas | Mapa Leaflet y OpenStreetMap con capas, pines por estado, selección sincronizada con la lista y alternativa con lista si no cargan los datos o las teselas (serie de interfaz). La rama de Josef lo amplía con el mapa de Lima, navegación restringida con un margen de 10 km por lado, capas configurables y estados de contingencia. | Incremento visual implementado; fuente operativa y actualización pendientes. |
| **US-007 / RF-004** Detalle vehicular en el mapa | Camiones independientes, selección y cuadros de detalle de pedidos, rutas y vehículos, con cierre mediante el mouse (rama de Josef). | Interacción visual implementada; GPS y ETA reales pendientes. |
| **US-008** Dashboard | Pedidos y CO₂ lado a lado, mapa de solo lectura, lista de pedidos en riesgo y filtro por distrito; se conservan la actualización cada 60 s y la prueba de arquitectura hexagonal. | Implementado; CO₂ evitado y pedidos en riesgo son de ejemplo. |
| **US-010 / US-011** Sostenibilidad | Reporte por semana, mes o trimestre con gráfico, tablas por distrito y vehículo y exportación de un CSV que se descarga con los datos del periodo mostrado. | Implementado en demo; cálculo y fuente real pendientes. |
| **Administración** | Pestañas de usuarios y roles, parámetros del algoritmo (peso CO₂/tiempo, tiempo máximo, carga máxima, holgura de ventana, reoptimización automática y factores de emisión) e integraciones. Los parámetros se guardan por el puerto `AlgorithmSettings` con validación previa. | Implementado en demo; sin valores inventados para GNV ni eléctrico; invitar y editar usuarios deshabilitados. |
| **EN-02 / T-01 / T-09** Autorización por roles | Matriz compartida ROL-01 a ROL-05 entre frontend y backend, acceso por URL, controles por perfil, API común y comprobación de recursos propios del conductor (rama de Josef). | Autorización implementada en los módulos existentes; autenticación productiva y auditoría operativa pendientes. |
| **EN-00 / T-02** Base de pruebas | Comando configurado mediante `.env`, esquema PostgreSQL/PostGIS y datos relacionados de todos los módulos, con carga repetible y reinicio transaccional (rama de Josef). | Generador verificado por Josef con PostgreSQL real; la API aún no usa los adaptadores SQL y las migraciones productivas siguen pendientes. |

El trabajo de mapa adelanta la preparación visual de PMV-3 dentro del incremento actual. No se declara completada US-005 ni el flujo íntegro de PMV-2: el optimizador y la integración operativa todavía requieren desarrollo.

## Demostración del trabajo completado

La demostración del Sprint 2 muestra los artefactos y comportamientos realmente disponibles.

**Serie de interfaz por rol (modo demostración):**

1. **Pedidos y rutas (Planificador):** buscar por placa o distrito, filtrar por estado, elegir un pedido y ver su ruta en el mapa; registrar, editar y cancelar un pedido pendiente.
2. **Flota:** registrar un vehículo con un valor inválido para ver la validación, corregirlo y ver los conteos por estado.
3. **Generar rutas:** configurar la prioridad, generar la propuesta de ejemplo y comprobar el caso «sin vehículos disponibles». Explicar que el motor aún no existe.
4. **Conductor (móvil, 390 px):** recorrer «Mi ruta», abrir la parada actual, confirmar la entrega y ver que el avance pasa de 2/9 a 3/9.
5. **Dashboard y sostenibilidad (Responsable de Logística):** elegir un pedido en riesgo y verlo en el mapa; cambiar de periodo y exportar el CSV.
6. **Administración:** cambiar un parámetro, ver un error de validación, guardar y comprobar que «Generar rutas» usa el nuevo tiempo máximo.
7. **Datos de ejemplo:** en cada pantalla señalar qué es de ejemplo (barra superior «Modo demo») y qué avisa que no hay datos fuera de la demostración.

**Mapa, roles y base de pruebas (rama de Josef):**

1. **Mapa de Lima:** cartografía vectorial clara, áreas verdes y agua suaves, íconos de pedidos y camiones con relleno pastel, rutas finas y controles de zoom y reencuadre. El área navegable mantiene visibles las zonas de interés sin permitir una vista mundial.
2. **Capas e interacción:** rutas, pedidos, camiones y almacén juntos o separados según el perfil de vista. Selección sincronizada con la lista, cuadros de detalle que se cierran con el mouse y alternativa de consulta ante fallos de carga del mapa.
3. **Roles:** perfiles de administrador, planificador, conductor, responsable de logística y auditor externo. El selector funciona únicamente en modo demostración; el modo HTTP exige identidad verificada. La navegación y las operaciones siguen la sección 4 del documento de Usuarios, con denegación de accesos insuficientes y de recursos ajenos.
4. **API común:** en esa rama, pedidos, confirmación, vehículos, conductores, dashboard y sesión se componen en una misma aplicación; las mutaciones requieren verificación del servidor y un rol enviado por URL o cabecera no reemplaza una identidad autenticada. En `main` y en la serie de interfaz las aplicaciones siguen separadas (`manage:app` para pedidos).
5. **Base de pruebas:** ejecutar `scripts/create_test_db.py` con la conexión definida en `.env`. La configuración predeterminada prepara siete días con 20 usuarios, 15 vehículos, 15 conductores, 1.050 pedidos, 70 rutas, entregas, incidencias, posiciones, zonas, reportes, parámetros y auditoría. `--dry-run` muestra las cantidades y `--reset` reinicia los datos de una base identificada por el generador.
6. **Validación:** reproducir los resultados registrados y evaluar los criterios pendientes antes de aprobar historias o cerrar el sprint.

| Evidencia registrada (09/10/2026) | Resultado | Alcance de la comprobación |
|---|---|---|
| Frontend sobre `1bf3ee8` (serie de interfaz) | 247 pruebas de Vitest, 9 de Node y 22 de navegador aprobadas; lint, tipos y compilación sin errores. | Interfaz por rol, casos de uso, mapa, exportación CSV (incluida una descarga real), objetivos táctiles de 48 px y ausencia de desbordamiento a 390 px. No acredita autenticación real, certificación de accesibilidad ni rendimiento. |
| Backend sobre `1bf3ee8` | 169 pruebas y 36 subpruebas aprobadas. | Dominio, casos de uso y API de pedidos, vehículos, conductores y dashboard con almacenamiento en memoria. No cubre PostgreSQL real. |
| Frontend de la rama `feature/josef/spr2/auth` (reportado por Josef) | 264 pruebas de Vitest, 9 de Node y 35 de navegador aprobadas; lint y compilación aprobados. | Interfaz, permisos, navegación, mapa y regresión de vistas móviles. No acredita un inicio de sesión productivo ni certificación de accesibilidad. |
| Backend de la rama `feature/josef/spr2/auth` (reportado por Josef) | 217 pruebas y 36 subpruebas aprobadas, incluidas cuatro de integración real. | PostgreSQL 18 con PostGIS aislado: repetición de carga, geometría, restricciones, lectura del adaptador, reversión y protección de tablas ajenas. |

Los resultados de la rama de Josef proceden de las ejecuciones que él documentó el 09/10/2026; no se volvieron a ejecutar al unificar este documento. Estas evidencias no equivalen a la aprobación de los interesados.

Documentación de soporte (en la rama `feature/josef/spr2/auth`, sin enlaces hasta fusionarla): «Mapa visual de Lima» y sus evidencias cartográficas, «Control de acceso por roles», «Base de datos de pruebas», y el plan de sprints, el backlog y los criterios de calidad de `development/`.

## Pendientes

- Revisar y fusionar los Pull Requests abiertos (#7, #11 y #12 a #21) y, después, abrir y fusionar los de las ramas `feature/josef/spr2/map` y `feature/josef/spr2/auth`, que parten de esa serie.
- Implementar el proveedor real de autenticación: inicio de sesión, vigencia, revocación, protección de la sesión y vínculo persistente entre usuario y conductor; reemplazar los usuarios genéricos de cada rol.
- Conectar los adaptadores de la API al esquema PostgreSQL (el generador no cambia los repositorios en memoria de la aplicación), preparar migraciones productivas y componer una API única.
- Implementar el motor de optimización VRPTW / Green VRP, la aprobación, la asignación y el despacho de rutas, y medir el rendimiento (RNF-001); verificar la confirmación de entregas sobre el mismo estado persistente.
- Incorporar fuentes operativas para mapa, rutas, posición y ETA, y para CO₂ evitado, pedidos en riesgo, reportes y usuarios. Las geometrías, posiciones, restricciones y métricas actuales son sintéticas.
- Completar las pantallas y los endpoints pendientes: incidencias del conductor, configuración, informes y auditoría, y las acciones deshabilitadas (ajustar rutas, invitar y editar usuarios, configurar integraciones). Definir el alcance del rol Auditor Externo en la serie de interfaz.
- Validar concurrencia, rendimiento, seguridad y accesibilidad con evidencia propia; medir cobertura (RNF-001, RNF-005 y RNF-007).
- Consolidar los cambios en commits y PR revisados, conciliar Jira con el backlog y registrar la aceptación por historia y la decisión de cierre del sprint.

Los responsables y las fechas de resolución se confirman en la revisión. El incremento aporta una base verificable para continuar el desarrollo; PMV-2, PMV-3, EN-00 y EN-02 conservan los pendientes descritos.



[← Volver al README Principal](../../../README.md)

### **Control de versiones del documento**

| Versión | Fecha | Autor | Descripción del cambio |
|---|---|---|---|
| V_1_0_0 | 09/10/2026 | Tovar Sánchez, Carlos Alberto | Revisión del Sprint 2 con el estado real de cada historia, la pauta de demostración y el registro de la reunión pendiente de completar. |
| V_1_1_0 | 09/10/2026 | Tovar Sánchez, Carlos Alberto | Se unifica con la revisión de la rama `feature/josef/spr2/auth` (mapa visual, autorización por roles y base de pruebas): se integran su demostración, su evidencia de pruebas y sus pendientes sin duplicarlos. |
