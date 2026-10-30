# Informe de estado del proyecto — Sprint 2

**Nombre del Proyecto:** EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Líder del Proyecto:** Ore Campos, Josef Pablo

**Fecha:** 09/10/2026 (corte original); actualizado el 29/10/2026

**Periodo del Informe:** 05/10/2026 - 09/10/2026 (corte parcial del Sprint 2)

**Versión del documento:** V_1_3_0

> Las fechas oficiales de inicio y cierre del Sprint 2 se confirman en la reunión de revisión. **Actualización V_1_3_0 (29/10/2026):** la versión anterior se redactó el 09/10 con la rama `feature/carlos/spr2/m_pedidos/confirmacion` y decía que la autenticación, PostgreSQL y la API única estaban pendientes. Ese mismo día Josef Ore integró en `main` el mapa, la autorización, el inicio de sesión y los adaptadores PostgreSQL (commits `c314f64`, `a07136a`, `c981e8a` y `97b401b`), de modo que esas afirmaciones dejaron de ser ciertas. Este informe las corrige contrastándolas con `main` (commit `30969da`).

### **Estado del proyecto**

| Variables de control | Descripción del estado |
| --- | --- |
| **Alcance** | El Sprint 2 convierte los módulos del Sprint 1 en interfaces utilizables por rol (Planificador, Conductor, Responsable de Logística y Administrador) y las acerca al flujo pedido → ruta → entrega. En `main` hay pantallas, casos de uso y puertos para pedidos, flota, generación de rutas, mapa con filtros, dashboard, reporte de sostenibilidad y administración, **leyendo de la API y de PostgreSQL**, con inicio de sesión, sesiones con expiración y revocación, protección CSRF, límite de intentos y cinco roles con permisos comprobados en el servidor. **Ninguna historia se declara aceptada:** el motor de optimización (US-005 / EN-01) sigue sin implementarse (la propuesta de rutas es una estimación; no se guarda ni se despacha), no hay GPS ni ETA reales, y la validación de despliegue, recuperación y seguridad está pendiente. El objetivo de PMV-2 (pedido → ruta → despacho → entrega) no se da por cumplido. |
| **Cronograma** | El Sprint 2 está en curso. **Ningún Pull Request se fusionó:** la serie de interfaz (#12 a #21) y el PR de conductores (#11) siguen abiertos. Sin embargo, el código de la serie de interfaz ya está en `main`, porque las ramas de Josef (`feature/josef/spr2/map` y `feature/josef/spr2/auth`) partían de ella y entraron a `main` el 09/10 mediante commits directos, sin Pull Request ni revisión de un par técnico. Además, `main` recibió el 06/10 dos commits directos de arquitectura (value objects), tres commits de documentación de Carlos el 09/10 y ocho de Valentino Rojas el 14 y 16/10. La revisión, el cierre formal y la velocidad del sprint quedan pendientes de la reunión. |
| **Costos** | No se reporta ejecución presupuestal en el periodo. Todo lo implementado usa herramientas de código abierto (React, Vite, FastAPI, PostgreSQL/PostGIS, Leaflet y OpenStreetMap), sin licencias ni infraestructura contratada. El servidor público de teselas de OpenStreetMap no tiene costo, pero no está pensado para tráfico de producción. La Dirección del Proyecto confirma cualquier gasto real. |
| **Calidad** | **Ejecución del 29/10/2026 sobre `main` (commit `30969da`):** backend con 225 pruebas aprobadas, 5 omitidas y 36 subpruebas (tras instalar `requirements-postgres.txt`; las omitidas son las de integración con un PostgreSQL real, que no se ejecutaron); frontend con 273 pruebas de Vitest, 9 de Node y 40 de navegador (Playwright, Edge) aprobadas, `oxlint` sin avisos, `tsc` sin errores y compilación de producción completada. *Cifras del 09/10 que se reemplazan:* 169 pruebas de backend, 247 de Vitest y 22 de navegador, medidas sobre `1bf3ee8` (rama de Carlos), que no incluía el trabajo de Josef. No se midió cobertura de código, rendimiento (P95), carga ni accesibilidad certificada: RNF-001, RNF-005 y RNF-007 siguen sin evidencia. |

### **Historias de Usuario y tareas trabajadas en este Sprint**

Se registra el trabajo realizado y su estado real al 29/10/2026. La columna de evidencia conserva los PR originales; el código de todos ya está en `main` (ver «Cronograma»). Las pruebas de integración con PostgreSQL real no se repitieron en esta actualización.

| Historia / tarea | Trabajo realizado | Evidencia | Estado al 29/10/2026 |
| --- | --- | --- | --- |
| **Base de diseño** (transversal) | Sistema de diseño «EcoLogística Lima» (tokens, componentes, íconos), barra superior por rol y componentes compartidos. | PR #12 | Implementado, en `main`; PR sin revisar. |
| **US-003** Pedidos y rutas (Planificador) | Resumen, buscador por pedido, cliente, dirección, distrito y placa, pestañas por estado, lista agrupada, detalle, registro, edición y cancelación. | PR #13 | Implementado sobre la API y PostgreSQL; aceptación pendiente. *(V_1_2_0: «en demo».)* |
| **US-001 / US-002** Flota | Resumen de la flota, lista por estado, etiquetas de bajas emisiones y diálogo de registro y edición con validación visible. | PR #14 | Implementado sobre la API y PostgreSQL; aceptación pendiente. *(V_1_2_0: «con respaldo local».)* |
| **US-005** Generar rutas del día | Configuración, avance por pasos, resultado y regla «No hay vehículos disponibles para generar rutas en este momento»; caso de uso `GenerateRoutes` con puerto `RouteOptimizer`. | PR #15 | **No completada:** la propuesta de la API (`/routes/proposal`) es una estimación por cercanía, capacidad y ventanas; no hay optimizador VRPTW, aprobación, publicación ni aviso al conductor (EN-01 pendiente). |
| **US-004 / EN-05** Interfaz del conductor | «Mi ruta» y «Pedido actual» para móvil con confirmación de entrega y objetivos táctiles de 48 px. | PR #16 | Implementado con la ruta del conductor leída de la API; falta la accesibilidad certificada. Las incidencias existen en la API (`/incidents`). |
| **US-006 / US-007** Mapa | Componente `RouteMap` (Leaflet y OpenStreetMap) con capas, filtros por estado, pedido y búsqueda, selección y detalle; la rama de Josef añade el mapa de Lima con margen de 10 km. | PR #17 y commit `c314f64` | Implementado y leyendo `/map`; las posiciones de la base de pruebas son simuladas. Faltan GPS, ETA y actualización en tiempo real. |
| **US-008** Dashboard | Dashboard por rol con pedidos y CO₂ lado a lado, mapa de solo lectura y pedidos en riesgo. | PR #18 | Implementado sobre `/dashboard/insights`; los factores de emisión y la línea base no están validados con datos operativos. |
| **US-010 / US-011** Reporte de sostenibilidad | Periodos semana, mes y trimestre, gráfico, tablas por distrito y vehículo y exportación a CSV. | PR #19 | Implementado sobre `/reports/sustainability`; falta validar factores y línea base, y medir el rendimiento (P95 1,5 s). |
| **Administración** (sin historia propia en el backlog) | Usuarios y roles, parámetros del algoritmo con puerto `AlgorithmSettings`, integraciones y auditoría. | PR #20 | Alta de usuarios, parámetros y auditoría conectados a la API; las integraciones externas siguen pendientes. |
| **Limpieza de interfaz** | Eliminación de los CSS heredados y prueba automática de reglas de diseño. | PR #21 | Implementado, en `main`; PR sin revisar. |
| **EN-02 / T-01 / T-09** Inicio de sesión y autorización | Cuenta en PostgreSQL con hash, cookie de sesión con expiración y revocación, CSRF, 10 intentos cada 15 minutos, cinco roles con permisos comprobados en el servidor y acceso del conductor a sus propios recursos. | Commits `a07136a`, `c981e8a`, `97b401b` en `main` | Integrado parcial: faltan cabeceras de seguridad, auditoría anonimizada, bloqueo de inyección SQL, Ley N.° 29733 y la revisión de seguridad. Sin Pull Request. *(V_1_2_0: «sin PR».)* |
| **EN-00 / T-02** Persistencia | Adaptadores PostgreSQL de pedidos, flota, conductores, dashboard y portal; migración `001_sessions.sql`; scripts `migrate.py`, `initialize_database.py`, `create_admin.py` y `create_test_db.py`. | Commits `c314f64` a `97b401b` en `main` | Integrado parcial: faltan validar las migraciones en despliegue y la recuperación; no hay evidencia de pruebas con un PostgreSQL real en esta actualización. |
| **Arquitectura del backend** | Value objects y corrección de excepciones del dominio. | Commits `960e63c` y `51b2223` en `main` | Integrado directamente a `main` (06/10). |
| **US-012 / US-013** Conductores (interfaz) | Interfaz del CRUD de conductores sobre la API existente. | PR #11 | PR pendiente de revisión. |

### **Demostración del trabajo completado**

La demostración del Sprint 2 muestra únicamente lo que se puede ejecutar. Los pasos se actualizaron el 29/10/2026 según la guía de inicio de sesión y persistencia de `docs/03 Implementación/`.

1. Backend: configurar `DATABASE_URL` en `.env` y ejecutar `scripts/migrate.py` y `scripts/run_backend.py` (una sola aplicación, también disponible como `manage:app`). El esquema OpenAPI incluye pedidos, vehículos, conductores, dashboard, sesión y portal.
2. Datos: `scripts/create_test_db.py --env-file .env.test` carga un conjunto sintético de siete días; el primer administrador se crea con `scripts/create_admin.py`.
3. Frontend: desde `src/frontend`, `npm run dev` (http://localhost:5173/) con `VITE_API_URL` apuntando a la API. Se ingresa con una cuenta activa; no hay selector de perfiles.
4. Recorrido por rol: Planificador (pedidos, rutas y flota), Conductor (móvil: «Mi ruta» y «Pedido actual»), Responsable de Logística (dashboard y sostenibilidad con CSV), Administrador (usuarios, parámetros, integraciones y auditoría).
5. Suites de pruebas: `npm run test` y `npm run test:ui` en `src/frontend`, y `python -m pytest` en `src/backend`.
6. Documentos del Sprint 2 en `docs/03 Implementación/Sprint 2/`.

### **Riesgos**

| **Riesgo** | **Responsable** | **Mitigación** | **Estado al 29/10/2026** |
| -- | -- | -- | -- |
| Doce Pull Requests abiertos sin revisión (#7, #11 y #12 a #21); el código de la serie de interfaz ya está en `main` por commits directos de las ramas de Josef, por lo que la revisión llega después de la integración. | Equipo del proyecto | Revisar el contenido con un revisor distinto del autor y cerrar los PR con motivo o fusionarlos. | Abierto. |
| Cambios integrados a `main` sin Pull Request ni revisión (mapa, autenticación y PostgreSQL). | Equipo del proyecto | Activar la protección de `main` y revisar retroactivamente el código de seguridad. | Abierto. |
| Los datos son sintéticos (base de pruebas de siete días): una demo convincente podría confundirse con avance operativo. | Responsable de frontend | Indicar en las demostraciones y los informes que los datos y las posiciones son simulados. | Abierto. *(V_1_2_0: «datos de ejemplo en la interfaz»; esa parte ya se retiró.)* |
| Persistencia y autenticación sin validar en despliegue (migraciones, recuperación, concurrencia, revisión de seguridad). | Responsable de backend | Validar con una base nueva y un reinicio, y revisar la sesión, el CSRF y los permisos. | Abierto. *(V_1_2_0: «no existe identidad verificada»; ya existe.)* |
| El módulo de rutas del backend está sin implementar (`generate_routes.py`, `reoptimize_route.py` y `route.py` están vacíos) y el rendimiento de VRPTW / Green VRP no está medido. | Responsable de backend y algoritmo | Implementar primero una versión base con un conjunto de datos de prueba y medir el tiempo antes de optimizar. | Abierto; verificado el 29/10/2026. |

### **Próximos avances**

- ~~Componer una aplicación de API única y conectar el frontend a ella.~~ **Hecho** (`main`).
- ~~Conectar los repositorios a PostgreSQL y acordar las migraciones.~~ **Hecho en parte:** adaptadores y migración de sesiones en `main`; faltan validar el despliegue y la recuperación.
- ~~Integrar el proveedor de autenticación y reemplazar los usuarios genéricos.~~ **Hecho** con sesiones propias, no con OAuth2/JWT; la revisión de seguridad sigue pendiente.
- Diseñar el contrato de datos de GPS, ETA y actualización del mapa, y la fuente operativa de pedidos en riesgo y CO₂ evitado.
- Implementar el motor de optimización, la aprobación y el despacho de rutas.
- Completar EN-02 (cabeceras de seguridad, auditoría anonimizada, bloqueo de inyección y Ley N.° 29733).

### **Notas**

Este informe no declara como aceptadas historias que aún no pasaron la revisión del sprint ni presenta datos sintéticos como operación real. La velocidad del Sprint 2 no se calcula hasta que se decida la aceptación. No se consultó Jira para elaborar este informe; su conciliación con el repositorio queda como acción abierta (ver la [auditoría de coherencia](05%20Auditor%C3%ADa%20de%20coherencia%20del%20proyecto%20V_1_3_0.md)). Josef Ore documentó su parte del sprint en `05 Revisión del Sprint V_2_0_0.md` y `06 Retrospectiva del Sprint V_2_0_0.md` (carpeta `docs/03 Implementación/`).

### **Control de versiones del documento**

| Versión | Fecha | Autor | Descripción del cambio |
|---|---|---|---|
| V_1_0_0 | 09/10/2026 | Tovar Sánchez, Carlos Alberto | Informe de estado del Sprint 2 con el estado real de cada historia, la evidencia de pruebas del 09/10 y los riesgos del periodo. |
| V_1_1_0 | 09/10/2026 | Tovar Sánchez, Carlos Alberto | Se actualizan los enlaces tras unificar la revisión y la retrospectiva del Sprint 2 con las de la rama `feature/josef/spr2/auth`. |
| V_1_2_0 | 09/10/2026 | Tovar Sánchez, Carlos Alberto | Se actualiza el enlace a la auditoría de coherencia tras corregir los documentos del Sprint 1. |
| V_1_3_0 | 29/10/2026 | Tovar Sánchez, Carlos Alberto | Corrige afirmaciones que `main` ya contradecía: la autenticación, la persistencia en PostgreSQL y la API única están integradas; las ramas de Josef están en `main` sin Pull Request; se reemplazan las cifras de pruebas por las del 29/10 sobre `30969da` y se actualizan el estado de cada historia, los riesgos, la demostración y los próximos avances. |

[← Volver al README Principal](../../../README.md)
