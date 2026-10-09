# Informe de estado del proyecto — Sprint 2

**Nombre del Proyecto:** EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Líder del Proyecto:** Ore Campos, Josef Pablo

**Fecha:** 09/10/2026

**Periodo del Informe:** 05/10/2026 - 09/10/2026 (corte parcial del Sprint 2)

**Versión del documento:** V_1_2_0

> Las fechas oficiales de inicio y cierre del Sprint 2 se confirman en la reunión de revisión. Este informe resume lo comprobable en el repositorio al corte del 09/10/2026 y no sustituye la aceptación del sprint.

### **Estado del proyecto**

| Variables de control | Descripción del estado |
| --- | --- |
| **Alcance** | El Sprint 2 convierte los módulos construidos en el Sprint 1 en interfaces utilizables por rol (Planificador, Conductor, Responsable de Logística y Administrador) y las acerca al flujo pedido → ruta → entrega. Al corte hay pantallas, casos de uso y puertos para pedidos, flota, generación de rutas, mapa, dashboard, reporte de sostenibilidad y administración. **Ninguna historia se declara aceptada:** el motor de optimización (US-005 / EN-01), la persistencia en PostgreSQL y la autenticación real siguen pendientes, por lo que el objetivo de PMV-2 (pedido → ruta → despacho → entrega) no se da por cumplido. |
| **Cronograma** | El Sprint 2 está en curso. Durante el periodo no se integró ningún Pull Request a `main`: la serie de interfaz (#12 a #21) y el PR de conductores (#11) siguen abiertos y esperan revisión por un par técnico. En `main` solo entraron dos commits directos de arquitectura (value objects, 06/10). La revisión, el cierre formal y la velocidad del sprint quedan pendientes de la reunión. |
| **Costos** | No se reporta ejecución presupuestal en el periodo. Todo lo implementado usa herramientas de código abierto (React, Vite, FastAPI, Leaflet y OpenStreetMap), sin licencias ni infraestructura contratada. El servidor público de teselas de OpenStreetMap no tiene costo, pero no está pensado para tráfico de producción. La Dirección del Proyecto confirma cualquier gasto real. |
| **Calidad** | Ejecución del 09/10/2026 sobre el commit `1bf3ee8` de la rama `feature/carlos/spr2/m_pedidos/confirmacion`: backend con 169 pruebas y 36 subpruebas aprobadas (1 advertencia de deprecación de `httpx`); frontend con 247 pruebas de Vitest, 9 de Node y 22 pruebas de navegador (Playwright, Edge) aprobadas, `oxlint` sin avisos, `tsc` sin errores y compilación de producción completada. No se midió cobertura de código, rendimiento (P95), carga ni accesibilidad certificada: esos criterios (RNF-001, RNF-005 y RNF-007) siguen sin evidencia. |

### **Historias de Usuario y tareas trabajadas en este Sprint**

Se registra el trabajo realizado y su estado real. «Implementado en demo» significa que la pantalla y el caso de uso funcionan, pero con adaptadores de ejemplo y no con datos persistentes de la operación.

| Historia / tarea | Trabajo realizado | Evidencia | Estado al corte |
| --- | --- | --- | --- |
| **Base de diseño** (transversal) | Sistema de diseño «EcoLogística Lima» (tokens, componentes, íconos), barra superior por rol y componentes compartidos. | PR #12 | Implementado; pendiente de revisión. |
| **US-003** Pedidos y rutas (Planificador) | Resumen, buscador por pedido, cliente, dirección, distrito y placa, pestañas por estado, lista agrupada, detalle, registro, edición y cancelación. | PR #13 | Implementado en demo; pendiente de revisión. |
| **US-001 / US-002** Flota | Resumen de la flota, lista por estado, etiquetas de bajas emisiones y diálogo de registro y edición con validación visible. | PR #14 | Implementado sobre la API de vehículos, con respaldo local; pendiente de revisión. |
| **US-005** Generar rutas del día | Configuración, avance por pasos, resultado y regla «No hay vehículos disponibles para generar rutas en este momento»; caso de uso `GenerateRoutes` con puerto `RouteOptimizer`. | PR #15 | **No completada:** el optimizador es un adaptador de ejemplo (EN-01 pendiente). |
| **US-004 / EN-05** Interfaz del conductor | «Mi ruta» y «Pedido actual» para móvil con confirmación de entrega y objetivos táctiles de 48 px. | PR #16 | Implementado en demo; falta Incidencias y la ruta real. |
| **US-006 / US-007** Mapa | Componente `RouteMap` (Leaflet y OpenStreetMap) con capas, pines por estado, selección y aviso con lista si el mapa no carga. | PR #17 y rama `feature/josef/spr2/map` | Incremento visual con datos de ejemplo; falta fuente operativa, posición y ETA. |
| **US-008** Dashboard | Dashboard por rol con pedidos y CO₂ lado a lado, mapa de solo lectura y pedidos en riesgo. | PR #18 | Implementado; CO₂ evitado y pedidos en riesgo son datos de ejemplo. |
| **US-010 / US-011** Reporte de sostenibilidad | Periodos semana, mes y trimestre, gráfico, tablas por distrito y vehículo y exportación a CSV. | PR #19 | Implementado en demo; falta fuente de datos real. |
| **Administración** (sin historia propia en el backlog) | Usuarios y roles, parámetros del algoritmo con puerto `AlgorithmSettings` e integraciones. | PR #20 | Implementado en demo; usuarios e integraciones de solo lectura. |
| **Limpieza de interfaz** | Eliminación de los CSS heredados y prueba automática de reglas de diseño. | PR #21 | Implementado; pendiente de revisión. |
| **EN-02 / EN-00** Roles y base de pruebas | Autorización por roles compartida entre frontend y backend y generador de base de pruebas PostgreSQL/PostGIS. | Ramas `feature/josef/spr2/auth` y `feature/josef/spr2/map` (sin PR) | Implementado parcial; sin PR ni revisión. |
| **Arquitectura del backend** | Value objects y corrección de excepciones del dominio. | Commits `960e63c` y `51b2223` en `main` | Integrado directamente a `main` (06/10). |
| **US-012 / US-013** Conductores (interfaz) | Interfaz del CRUD de conductores sobre la API existente. | PR #11 | Pendiente de revisión. |

### **Demostración del trabajo completado**

La demostración del Sprint 2 muestra únicamente lo que se puede ejecutar:

1. Backend: desde `src/backend`, `uvicorn interfaces.api.main:app --port 8000`. Al corte, el esquema OpenAPI (`/openapi.json`) responde HTTP 200 con 10 rutas (vehículos, conductores, dashboard, `/health` y `/`). Los pedidos se exponen en otra aplicación (`manage:app`).
2. Frontend: desde `src/frontend`, `npm run dev` (http://localhost:5173/). Sin `VITE_API_URL` la interfaz corre en modo demostración y lo indica en la barra superior.
3. Recorrido por rol en modo demostración:
   - Planificador: `/?vista=pedidos`, `/?vista=rutas` y `/?vista=flota`.
   - Conductor (móvil): `/?vista=mi-ruta` y `/?vista=conductor`.
   - Responsable de Logística: `/` (dashboard) y `/?vista=sostenibilidad`, con exportación del CSV del periodo.
   - Administrador: `/?vista=admin`, con edición y guardado de los parámetros del algoritmo.
4. Suites de pruebas: `npm run test` y `npm run test:ui` en `src/frontend`, y `python -m pytest` en `src/backend`.
5. Documentos del Sprint 2 en `docs/03 Implementación/Sprint 2/`.

### **Riesgos**

| **Riesgo** | **Responsable** | **Mitigación** |
| -- | -- | -- |
| Doce Pull Requests abiertos sin revisión (#7, #11 y #12 a #21); los diez de la serie de interfaz están apilados, de modo que cada uno depende del anterior. | Equipo del proyecto | Revisar y fusionar en orden desde #12, con un revisor distinto del autor, y rehacer la base de cada PR después de cada fusión. |
| Los datos de CO₂ evitado, pedidos en riesgo, reporte, parámetros, usuarios, integraciones y mapa son de ejemplo; una demo convincente podría confundirse con avance operativo. | Responsable de frontend | Mantener el aviso «Modo demo» visible y no marcar como completadas las historias que dependen de esos datos. |
| Las rutas de la API no incluyen pedidos y la autenticación devuelve 401 por defecto: no existe una aplicación única ni identidad verificada. | Responsable de backend | Componer una sola aplicación con los routers existentes e integrar el proveedor de autenticación antes de abrir el acceso por rol. |
| El módulo de rutas del backend está sin implementar (`generate_routes.py`, `reoptimize_route.py` y `route.py` están vacíos) y el rendimiento de VRPTW / Green VRP no está medido. | Responsable de backend y algoritmo | Implementar primero una versión base con un conjunto de datos de prueba y medir el tiempo antes de optimizar. |

### **Próximos avances**

- Componer una aplicación de API única (pedidos, vehículos, conductores y dashboard) y conectar el frontend a ella.
- Conectar los repositorios a PostgreSQL y acordar las migraciones.
- Integrar el proveedor de autenticación y reemplazar los usuarios genéricos de cada rol.
- Diseñar el contrato de datos del mapa (rutas, coordenadas, posición y ETA) y la fuente operativa de pedidos en riesgo y CO₂ evitado.
- Diseñar y construir la pantalla de Incidencias del conductor.

### **Notas**

Este informe no declara como implementadas funcionalidades que solo existen con datos de ejemplo ni como aceptadas historias que aún no pasaron la revisión del sprint. La velocidad del Sprint 2 no se calcula hasta que se decida la aceptación. No se consultó Jira para elaborar este informe; su conciliación con el repositorio queda como acción abierta (ver la [auditoría de coherencia](05%20Auditor%C3%ADa%20de%20coherencia%20del%20proyecto%20V_1_2_0.md)).

### **Control de versiones del documento**

| Versión | Fecha | Autor | Descripción del cambio |
|---|---|---|---|
| V_1_0_0 | 09/10/2026 | Tovar Sánchez, Carlos Alberto | Informe de estado del Sprint 2 con el estado real de cada historia, la evidencia de pruebas del 09/10 y los riesgos del periodo. |
| V_1_1_0 | 09/10/2026 | Tovar Sánchez, Carlos Alberto | Se actualizan los enlaces tras unificar la revisión y la retrospectiva del Sprint 2 con las de la rama `feature/josef/spr2/auth`. |
| V_1_2_0 | 09/10/2026 | Tovar Sánchez, Carlos Alberto | Se actualiza el enlace a la auditoría de coherencia tras corregir los documentos del Sprint 1. |

[← Volver al README Principal](../../../README.md)
