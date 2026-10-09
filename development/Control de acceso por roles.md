# Control de acceso por roles

Fecha: 09/10/2026. Implementación de autorización para los módulos existentes; EN-02 sigue parcial hasta integrar identidad real, auditoría y validación de seguridad.

## Fuente de permisos

La sección 4 de [Usuarios V_1_0_0](../01%20Inicio/08.%20Usuarios%20V_1_0_0.md) define los permisos. Se conserva su matriz cuando difiere de las descripciones generales o del diseño visual. El Docente Evaluador (ROL-06) revisa entregables y no se incorpora como usuario de producción.

| Código | Identificador | Comportamiento aplicado |
|---|---|---|
| ROL-01 | `admin` / `ADMIN` | Administración de usuarios y parámetros; CRUD de flota, pedidos y conductores; consulta de rutas, mapa y dashboard; consulta/exportación de auditoría. No genera rutas ni exporta sostenibilidad. |
| ROL-02 | `planner` / `OPERADOR` | CRUD de operación; ejecución de rutas; consulta de parámetros; mapa, dashboard e informes con exportación. Sin gestión de usuarios ni auditoría. |
| ROL-03 | `driver` / `CONDUCTOR` | Su ruta, mapa, perfil y confirmación de sus entregas; creación de sus incidencias. Consulta de flota y pedidos conforme a la matriz, sin editarlos. |
| ROL-04 | `logistics` / `RESPONSABLE_LOGISTICA` | Consulta de operación, rutas, mapa y dashboard; informes con exportación. Sin CRUD, parámetros, usuarios ni auditoría. |
| ROL-05 | `auditor` / `AUDITOR` | Consulta de flota, pedidos, conductores, parámetros, entregas, incidencias e informes; exportación de informes. Auditoría de solo lectura, sin mapa, dashboard, generación ni exportación de auditoría. |

`src/shared/rbac.json` es el contrato ejecutable: cada permiso expresa alcance `all` o `own`; su ausencia deniega la operación. React lo importa y Python usa una versión generada sin acceder al sistema de archivos desde el dominio. Para cambiar permisos, actualizar el JSON junto con la decisión documental, ejecutar desde la raíz `.venv\Scripts\python.exe scripts/generate-rbac.py` y correr las suites. La prueba de paridad detecta divergencias entre ambos lenguajes.

## Interfaz

`App.tsx` requiere sesión antes de montar módulos, comprueba acceso al resolver URLs e historial y usa la identidad de sesión en todas las cabeceras. Los servicios de aplicación comprueban permisos antes de llamar a adaptadores. Las vistas ocultan controles de escritura, ejecución y exportación según el perfil; parámetros se muestran deshabilitados para consulta. El auditor consulta pedidos sin cargar el mapa. El conductor filtra su mapa por vehículo verificado; sin asignación no se habilitan recursos propios.

En modo demo (`VITE_API_URL` sin definir) la barra muestra un selector de cinco cuentas ficticias. `sessionStorage` guarda únicamente el identificador de esa cuenta demo. En modo HTTP (`VITE_API_URL` definida, incluida la cadena vacía para usar proxy) el selector desaparece y esa preferencia se ignora: la identidad procede de `GET /api/session`. No se admiten roles en parámetros de URL, almacenamiento ni cabeceras del navegador.

Conductores, incidencias y auditoría tienen entradas de navegación autorizadas y aviso de interfaz pendiente. Esta entrega no implementa sus nuevas pantallas ni APIs ausentes de rutas, configuración, informes o auditoría.

## API e integración de identidad pendiente

`manage:app` e `interfaces.api.main:app` usan la misma composición: sesión, pedidos, confirmación, vehículos, conductores y dashboard. La entrada aislada de dashboard también exige permiso. `/` y `/health` permanecen públicos. Las lecturas protegidas devuelven 401 sin identidad; los permisos insuficientes devuelven 403. El conductor solo consulta su perfil y confirma sus pedidos; un recurso ajeno devuelve 404 sin revelar su existencia.

El proveedor de autenticación **todavía no está implementado**. La API predeterminada rechaza el acceso protegido hasta que se conecte un proveedor que valide una sesión y resuelva datos desde el servidor. No hay formulario funcional de login, contraseñas demo en producción ni tokens inventados. El contrato de integración es:

1. Validar credenciales/sesión, vigencia y estado del usuario en el servidor; resolver rol, `driver_id` y placa desde datos confiables. Nunca copiar claims sin verificar ni valores de `X-Role` o del cuerpo de petición.
2. Establecer `request.state.identity = Identity(subject_id, name, role, driver_id, plate)` tras esa validación. `GET /api/session` devuelve esos datos normalizando el rol y sus permisos.
3. En operaciones de escritura validar la protección correspondiente al mecanismo de sesión. Solo después establecer `request.state.mutation_verified = True`. El cliente manda cookies con `credentials: include` y, si existe, el token de `meta[name="csrf-token"]` en `X-CSRF-Token`; la mera presencia de esa cabecera no autoriza una mutación.
4. Proveer `request.state.revoke_session` como callback síncrono que revoque la sesión persistida. `DELETE /api/session` exige identidad y protección de mutaciones; devuelve 503 si no hay callback. El proveedor debe gestionar la expiración de su cookie/credencial; el cliente mantiene la sesión visible si el cierre falla.

`create_app(authenticate=..., protect_mutation=...)` permite inyectar proveedores confiables y dobles en pruebas. No exponer estos overrides a configuración de peticiones ni desplegar los dobles de pruebas. CORS acepta orígenes explícitos mediante `CORS_ALLOW_ORIGINS` (por defecto localhost/127.0.0.1:5173); no permite `*` con credenciales.

La autorización HTTP es la frontera de seguridad: ocultar botones no la sustituye. Para futuros endpoints, declarar el permiso de la misma política, exigir protección en mutaciones y filtrar recursos cuando el alcance sea `own`. Los recursos propios no pueden resolverse usando un `driver_id` suministrado por el cliente.

## Verificación

Desde `src/backend`: `..\..\.venv\Scripts\python.exe -m pytest -q -p no:cacheprovider`.

Desde `src/frontend`: `npm.cmd test`, `npm.cmd run build`, `npm.cmd run lint` y `npm.cmd run test:ui`.

La suite cubre matriz y paridad, accesos por rol a la API integrada, rechazo de identidades falsificadas, aislamiento del conductor, mutaciones sin verificación, rechazo de roles desconocidos, servicios de solo lectura y navegación real del producto mediante sesiones HTTP simuladas. Las pruebas de navegador no acreditan autenticación productiva: el proveedor y su revocación deben verificarse con integración real al incorporarlos.

Resultado sobre el árbol de trabajo del 09/10/2026: **193 pruebas backend y 36 subtests**, **264 pruebas Vitest**, **9 pruebas Node** y **35 pruebas Playwright**, todas aprobadas. Build TypeScript/Vite y lint también aprobados. Permanecen avisos de tamaño de bundles cartográficos y de deprecación de Starlette TestClient; no se declara aceptación de PMV ni validación del proveedor productivo.
