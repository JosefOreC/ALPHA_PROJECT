# Estado real y brechas de integración

**Actualización 09/10/2026 — mapa visual:** límites de navegación urbana de Lima, geometrías viales demo, camiones independientes, perfiles por vista y reintentos implementados. Las evidencias están en [Mapa visual de Lima](../docs/03%20Implementación/Mapa%20visual%20de%20Lima.md). La integración HTTP/GPS/ETA y la aceptación formal siguen pendientes; el inventario siguiente conserva el diagnóstico del 08/10/2026.

Corte: **08/10/2026**; lectura de documentación, archivos y referencias Git locales de `feature/josef/spr2/map`, commit `1bf3ee8`. No se ejecutaron pruebas del producto para este diagnóstico ni se consultaron remoto/Jira en vivo. Las pruebas históricas se mantienen como evidencia del commit que documentan.

## Cómo interpretar el estado

- **Implementado parcial:** existe código de un flujo, faltan integración o aceptación.
- **Demo:** usa adaptadores de ejemplo o memoria; puede ser útil para validar UX.
- **Pendiente:** no hay implementación funcional identificada o falta comprobación.
- **Aceptado:** criterios, DoD, PR y revisión del PMV acreditados para un commit. No se declara ningún PMV aceptado en este corte.

## Inventario por módulo

| Área | Evidencia en el repositorio | Estado observado | Brecha para entregar |
|---|---|---|---|
| UI y navegación | `src/frontend/src/App.tsx`, `shared/ui`, `features/dashboard`, `interfaces` | Pantallas y composición presentes | Roles procedentes de identidad; API común; verificar diseño y navegación de todos los roles. |
| Flota RF-001 | `interfaces/api/vehicles/router.py`, `infrastructure/dependencies.py`, `FleetView.tsx` | API y UI parciales; repositorio en memoria | PostgreSQL, identidad/RBAC y vínculo consistente con conductor/ruta. |
| Pedidos RF-002 | `manage.py`, `ManageOrders`, `httpManagement.ts`, `postgres_orders.py` | CRUD y confirmación parciales; adaptador SQL preparado | Autenticación predeterminada 401; protección de mutaciones; migraciones y pruebas PostgreSQL real; coordenadas/asignación. |
| Conductores RF-007 | Router de conductores, casos de uso y repositorio en memoria | Backend parcial | Persistencia y permisos; UI de administración de perfiles; vínculo y desactivación con rutas activas. La vista móvil de ruta no sustituye gestión de perfiles. |
| Rutas RF-003 | `generateRoutes.ts`, `demoRoutePlanning.ts`, `RoutePlanningView.tsx` | UI y puerto con propuesta ficticia | Motor real, contratos con pedidos individuales/coordenadas, API, persistencia, aprobación y despacho. |
| Backend de rutas | `application/use_cases/generate_routes.py`, `reoptimize_route.py`, `domain/entities/route.py` | Archivos vacíos | Entidades, puertos, casos de uso y adaptadores; las carpetas `optimization`, `maps`, `traffic`, API de rutas/reportes son esqueletos. |
| Mapa RF-004 | `RouteMap.tsx`, `LeafletCanvas.tsx`, `mapData.ts`, `demoMapData.ts` | Leaflet/OSM y fuente demo | En modo API se usa `UnavailableMapData`; faltan fuente HTTP, rutas/posición/ETA, actualización y permisos por objeto. |
| Dashboard RF-005 | `features/dashboard`, router y `dashboard/deps.py` | Gateway HTTP; backend con datos en memoria | Extraer datos persistentes de la operación; CO₂ evitado y pedidos en riesgo son demo. |
| Sostenibilidad RF-006 | `SustainabilityView.tsx`, `getSustainabilityReport.ts`, `demoSustainability.ts` | Reporte/CSV sobre demo | API, cálculo y factores trazables, fechas/unidades, rendimiento y conciliación con dashboard. |
| Administración | `AdminView.tsx`, `demoAdmin.ts` | Usuarios, parámetros e integraciones demo | Backend de identidad/configuración, autorización y auditoría; acordar mínimos necesarios sin ampliar el alcance. |
| Calidad | `src/backend/tests`, Vitest, Node y Playwright en frontend | Suites existentes | Ejecutarlas sobre cada candidato; medir cobertura, integración real, seguridad, accesibilidad, carga y staging. |
| Infraestructura | Configuración local y diseño C4 | Sin pipeline/despliegue productivo identificado | Entorno reproducible, migraciones, CI, staging, observabilidad y recuperación. |

## Tres composiciones de backend

| Entrada | Módulos conectados actualmente | Límite |
|---|---|---|
| `manage:app` | Gestión y confirmación de pedidos | Identidad y protección de mutaciones pendientes; memoria por defecto. |
| `interfaces.api.main:app` | Vehículos, conductores y dashboard | No incluye pedidos; CORS abierto en esta composición y controles de identidad pendientes. |
| `interfaces.api.dashboard.app:app` | Dashboard aislado de desarrollo | No es la aplicación integrada. |

T-01 debe establecer una composición única usando los routers y puertos existentes. Mantener el aislamiento de pruebas, evitar duplicar entidades y compartir repositorios en gestión/confirmación. Un único proceso levantado hoy no demuestra el flujo completo.

En frontend, `VITE_API_URL` controla demo/HTTP de varios módulos, pero flota y dashboard conservan sus gateways propios. Acordar base URL y proxy común; no suponer que una variable activa todos los módulos reales.

## Límites que deben permanecer visibles

- El CRUD conserva cancelación lógica, versión optimista y confirmación idempotente con primera hora. El criterio histórico de US-004 sobre repetición discrepa con esta decisión documentada.
- Validar un distrito permitido no geocodifica una dirección. La ubicación y las restricciones viales necesitan validación independiente.
- `MapRoute.done_until` representa avance sobre una geometría. No constituye telemetría del vehículo.
- `PlanningScope` contiene conteos; el motor real necesita los datos de cada pedido, vehículo y conductor. Debe evolucionar el contrato detrás del puerto.
- La aprobación en UI de una propuesta demo no acredita persistencia, asignación ni despacho.
- Las pruebas del adaptador PostgreSQL descritas en CRUD usan dobles de conexión; no acreditan rollback/concurrencia de una BD real.
- No hay evidencia de cobertura ≥80 %, P95, SLA, failover ni certificación de accesibilidad para este corte.

## Recuperación propuesta

Primero conciliar fuentes y registrar la base de integración. Después cerrar T-01–T-04 y las brechas de PMV-1/PMV-2. Reutilizar mapas, dashboard y reportes existentes al conectar PMV-3. Los ítems se mantienen en revisión de aceptación hasta reunir evidencia; no se asigna un porcentaje de avance por cantidad de archivos.
