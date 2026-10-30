# CRUD de pedidos — Valentino

Fecha de verificación: 1 de octubre de 2026. Rama exclusiva:
`feature/valentino/spr2/m_pedidos/crud`. Base heredada de Carlos:
`34bdc410751fa9e695084e2f59e273f9134964b4`.

## Estado de entrega

Incremento local implementado y probado. Incluye registro, listado paginado,
detalle, edición y cancelación lógica. No es una integración operativa con
identidad verificada ni almacenamiento durable. No se crearon ni ejecutaron
migraciones ni se conectó ninguna base de datos. El usuario autorizó posteriormente
la publicación del incremento en su rama exclusiva, sin PR ni acciones Jira.

La API normal falla cerrada con 401. El frontend sin `VITE_API_URL` muestra una
demostración explícita con datos ficticios en memoria. La demostración se reinicia
al recargar y es independiente de la API. Los principales falsos del backend y
los bypass de protección existen exclusivamente en pruebas aisladas.

## Trazabilidad

| Fuente | Criterio | Implementación / límite |
|---|---|---|
| RF-002, ruta Gold; EP-02 / US-003 de Planificación | Registrar dirección, ventana y peso; identificador único; disponible para ruteo | UUID servidor; PENDIENTE; sin conductor; CRUD con repositorio en memoria de pruebas |
| RF-002, ruta Infeliz; US-003 | Rechazar una dirección fuera de cobertura | Se rechazan distritos fuera de San Juan de Lurigancho, El Agustino, Santa Anita y Ate. La validación geográfica de la dirección y coordenadas siguen PENDIENTES |
| RF-002, ruta Feliz; US-004 | Confirmar entrega y primera hora del servidor | Contrato de Carlos preservado; regresión ejecutada |
| Documento 08, RBAC; ampliación CRUD del líder | Crear, leer, editar y eliminar según rol | ADMIN/OPERADOR gestionan; AUDITOR/RESPONSABLE_LOGISTICA leen; conductor utiliza exclusivamente sus rutas existentes |
| RN-002 | Cancelaciones afectan planificación | Transición lógica disponible; no se implementó reoptimización ni despacho |
| RN-007; EN-02 | Restringir acceso y minimizar exposición | Denegación predeterminada, DTO permitidos, parámetros SQL y errores sin payload. Identidad, cifrado y controles de despliegue pendientes |
| RN-009 / RNF-005 | Accesibilidad | Labels, estados de texto, mensajes accesibles, teclado y diálogo nativo; pruebas automatizadas de componentes y cuatro vistas a 390 px, sin certificación WCAG |
| Documento 11; EN-00 | PostgreSQL compartido | Adaptador preparado e inactivo; esquema, migración y prueba real pendientes por decisión del usuario |

US-003 corresponde a **Registrar pedido de entrega** y US-004 a **Confirmar
entrega** en `docs/02 Planificación/01 Transformando a ágil V_1_0_0.md`.
Los identificadores ELODRSPDSC-17/ELODRSPDSC-18 fueron proporcionados por el
usuario; no se verificó Jira. La revisión del Sprint usa una numeración diferente
para conductores y rutas. Se registra la discrepancia sin renumerar documentos.

US-004 de planificación pide rechazar la confirmación repetida. El código heredado
de Carlos devuelve la entrega original de forma idempotente. Se conserva ese
contrato, incluida la primera hora. El documento de stack formaliza FastAPI +
React + PostgreSQL, aunque README/C4 aún tienen referencias anteriores.

## Decisiones aprobadas en esta conversación

El usuario aprobó el diagnóstico, políticas y cambios compartidos, y después
indicó: no dispone de PostgreSQL, no realizar migraciones y avanzar dejando
identidad, cobertura y coordenadas explícitamente pendientes.

| Política | Conducta aplicada |
|---|---|
| Alta | UUID generado por servidor; PENDIENTE; conductor nulo; confirmación nula; versión 1 |
| Edición | Solo PENDIENTE y sin conductor; destinatario, dirección, distrito, ventana, peso e instrucciones |
| Eliminación académica | Cancelación lógica, preservando historial. No existe DELETE físico |
| Cancelación | Solo PENDIENTE y sin conductor; confirmación en interfaz y comprobación transaccional |
| Concurrencia | Versión optimista y transacción; edición/cancelación obsoleta devuelve 409 |
| Confirmación | EN_CAMINO → ENTREGADO; aumenta versión; repetir no cambia hora ni versión |
| Ventanas nuevas | Fecha y hora ISO 8601 con offset, segundos y hasta seis decimales de segundo; fin posterior al inicio |
| Horario visible | America/Lima. El formulario interpreta datetime-local explícitamente como UTC-5, sin usar la zona del equipo |
| Compatibilidad temporal | Las ventanas heredadas como 10:00 siguen válidas para consulta/confirmación. La gestión las muestra sin inventar fecha; al editarlas se requiere una ventana canónica |
| Destinatario | Texto obligatorio, hasta 200 caracteres |
| Dirección / instrucciones | Dirección obligatoria hasta 500; instrucciones opcionales hasta 1000 |
| Peso | Número estricto, positivo, finito, hasta dos decimales; máximo 99999999.99 por DECIMAL(10,2). No representa una capacidad vehicular aprobada |
| Distrito | Uno de los cuatro distritos documentados. No equivale a geocodificación ni prueba de cobertura de una dirección |

No se implementó asignación ni transición a EN_CAMINO: corresponde al contrato
futuro del módulo responsable. Un proceso que cambie la asignación debe respetar
la transacción y aumentar la versión. No se crea un conductor ficticio.

## Permisos

| Operación | ADMIN | OPERADOR | AUDITOR | RESPONSABLE_LOGISTICA | CONDUCTOR |
|---|---|---|---|---|---|
| Gestión: listado/detalle/permisos | Sí | Sí | Sí | Sí | No |
| Registro/edición/cancelación | Sí | Sí | No | No | No |
| Consulta del conductor | No | No | No | No | Solo pedido asignado |
| Confirmación del conductor | No | No | No | No | Solo asignado, EN_CAMINO o repetición ENTREGADO |
| Eliminación física | No implementada | No implementada | No | No | No |

El rol de logística existe en el Documento 08, pero su código no existe en el DDL
de usuarios. `RESPONSABLE_LOGISTICA` es el identificador reservado de este contrato;
su mapeo a claims reales necesita validación al integrar identidad. ADMIN,
OPERADOR, CONDUCTOR y AUDITOR corresponden a los nombres del DDL documentado.
No se introduce un rol CLIENTE.

La contradicción entre CRUD de operador y eliminación física reservada a ADMIN
se resolvió para este incremento mediante cancelación lógica aprobada. El DTO de
gestión omite la identidad del conductor y expone solamente `assigned`. El equipo
debe revisar qué campos personales requieren redacción para auditor/logística
antes de activar un proveedor real. No hay un contrato de segmentación por
organización o zona; no se inventa uno.

## Arquitectura y archivos

Se reutiliza una sola entidad Order. Dominio y aplicación no importan frameworks,
ORM, Psycopg ni servicios concretos. `ManagementRepository` es un puerto
complementario que conserva transaction/get/save y agrega add/list. No se amplía
OrdersPort del frontend del conductor.

| Clasificación | Archivo desde la raíz | Responsabilidad |
|---|---|---|
| Compartido Carlos, modificado | src/backend/domain/entities/order.py | Conductor nullable y versión; transición/hora/idempotencia conservadas |
| CRUD, nuevo | src/backend/domain/order_management.py | Validación y reglas de edición/cancelación |
| CRUD, nuevo | src/backend/domain/ports/order_management.py | Puerto complementario y generador de IDs |
| CRUD, nuevo | src/backend/application/use_cases/manage_orders.py | Permisos y casos de uso |
| CRUD, completado | src/backend/application/use_cases/register_order.py | Entrada de registro usada por API |
| CRUD, nuevo | src/backend/infrastructure/order_ids.py | UUID servidor |
| Compartido Carlos, modificado | src/backend/infrastructure/persistence/memory_orders.py | Bloqueo, rollback, alta sin colisión y listado |
| CRUD/integración futura, nuevo | src/backend/infrastructure/persistence/postgres_orders.py | Adaptador PostgreSQL preparado, inactivo |
| CRUD, nuevo | src/backend/interfaces/api/orders/management.py | DTO, rutas y errores de gestión |
| Compartido Carlos, modificado | src/backend/manage.py | Un repositorio inyectado para ambos módulos; errores 422 sin reflejar entrada |
| CRUD, nuevo | src/backend/requirements-postgres.txt | Dependencia opcional, no instalada |
| CRUD, nuevo | src/backend/tests/test_manage_orders.py | Reglas, permisos, conflictos y concurrencia en memoria |
| CRUD, nuevo | src/backend/tests/test_management_api.py | API, seguridad negativa y repositorio compartido |
| CRUD, nuevo | src/backend/tests/test_postgres_adapter.py | Mapeo/SQL y protocolo de transacciones con dobles, no integración PostgreSQL |
| CRUD, nuevo | src/frontend/src/domain/managedOrder.ts | DTO, puerto, reglas y hora Lima |
| CRUD, nuevo | src/frontend/src/application/manageOrders.ts | Casos de uso inyectados |
| CRUD, nuevo | src/frontend/src/infrastructure/httpManagement.ts | HTTP, validación JSON, permisos y errores |
| CRUD, nuevo | src/frontend/src/infrastructure/demoManagement.ts | Demostración ficticia en memoria |
| CRUD, nuevo | src/frontend/src/interfaces/OrderManagementView.tsx | Listado, filtros, detalle y diálogo |
| CRUD, nuevo | src/frontend/src/interfaces/OrderForm.tsx | Formulario reutilizado de registro/edición |
| CRUD, nuevo | src/frontend/src/interfaces/orderManagement.css | Estilos bajo .management y enlace de navegación |
| Compartido Carlos, modificado | src/frontend/src/App.tsx | Composición y navegación; conserva query pedido |
| Compartido, modificado | src/frontend/index.html | Título/descripcion para ambas vistas |
| Compartido, modificado | src/frontend/vite.config.ts | Proxy local /api → 127.0.0.1:8000 |
| Compartido, modificado | src/frontend/package.json | Scripts test y test:ui; Playwright como dependencia de desarrollo |
| Compartido, modificado | src/frontend/package-lock.json | Versión bloqueada de Playwright; conserva versiones anteriores |
| CRUD, nuevo | src/frontend/playwright.config.ts | Servidor local de pruebas, Edge, escritorio y viewport 390 × 844 |
| CRUD, nuevo | src/frontend/tsconfig.ui.json | Comprobación de tipos de configuración y pruebas de interfaz |
| CRUD, nuevo | src/frontend/tests/ui/components.spec.ts | Comportamiento de formulario y gestión usando campos/botones reales |
| CRUD, nuevo | src/frontend/tests/ui/mobile.spec.ts | Límites de controles, tabla, mensajes y diálogo a 390 px |
| CRUD, nuevo | src/frontend/tests/ui/fixtures.ts | Respuestas HTTP ficticias aisladas y captura opcional de evidencia |
| CRUD, nuevo | src/frontend/tests/ui/demo.html y demo.tsx | Montaje de los componentes reales con demo explícita, solo en servidor de pruebas |
| CRUD, nuevo | src/frontend/tests/setup.cjs | Transpilación en memoria con TypeScript existente |
| CRUD, nuevo | src/frontend/tests/management.test.cjs | node:test para casos de uso y adaptadores |
| CRUD, nuevo | src/frontend/.env.example | Configuración pública segura |
| CRUD, nuevo | docs/03 Implementación/CRUD de pedidos.md | Esta entrega, decisiones y evidencia verificada |
| CRUD, nuevo | docs/03 Implementación/evidencias-crud-pedidos/*.png | Siete capturas solicitadas con datos ficticios |

Las pruebas heredadas, OrderRepository, DriverOrders, router del conductor,
OrdersPort, HttpOrders, DemoOrders, DriverOrderView y estilos anteriores no se
reescribieron. La respuesta del conductor conserva sus campos y agrega `version`.
El cambio de confirm_delivery se limita al incremento de versión necesario para
detectar un formulario anterior a una entrega.

## Contrato API

| Método | Ruta | Entrada | Respuesta exitosa |
|---|---|---|---|
| GET | /api/pedidos/permisos | Sesión verificada | 200: can_write, derivado en servidor |
| POST | /api/pedidos | CreateOrderBody | 201: OrderRead |
| GET | /api/pedidos | limit, offset, status, district | 200: items, limit, offset, has_more |
| GET | /api/pedidos/{id} | Identificador | 200: OrderRead |
| PUT | /api/pedidos/{id} | Datos completos + expected_version | 200: OrderRead actualizado |
| POST | /api/pedidos/{id}/cancelacion | expected_version | 200: OrderRead CANCELADO |

CreateOrderBody: customer, address, district, window_start, window_end, weight_kg,
instructions opcional. UpdateOrderBody agrega expected_version y requiere todos
los datos del formulario. No se usa PATCH, por lo que no hay ambigüedad entre
campo omitido y null. Se rechazan campos extra, incluido id, driver_id, role,
status, confirmed_at y version. Los tipos numéricos no aceptan strings o booleanos.

OrderRead incluye los campos de negocio, id, status, confirmed_at, assigned y
version. No devuelve driver_id. El listado ordena por ID, sin orden SQL recibido
del cliente; limit 1–100 (20 predeterminado), offset 0–100000. Los filtros se
validan antes de consultar; no se implementa búsqueda adicional.

Errores: 401 sin identidad integrada; 403 sin permiso o protección de mutación;
404 inexistente; 409 versión/estado/asignación/ID duplicado; 422 datos inválidos.
El conductor conserva 404 para pedido ajeno y las dos rutas heredadas:
GET /api/conductor/pedidos/{id} y POST /api/conductor/pedidos/{id}/confirmacion.

## Identidad, protección y configuración pendiente

`create_app(repository=None, authenticate=authentication_required,
protect_mutation=mutation_protection_required)` compone ambos módulos con la misma
instancia de repositorio. No existe configuración que habilite un usuario falso
en ejecución normal, ni confianza en cabeceras X-Role/X-User.

El proveedor futuro debe validar identidad y devolver Principal para conductor
(driver_id verificado) o ManagementPrincipal para gestión (subject_id y role
verificados). Cambiar una query o un enlace del frontend no autoriza operaciones.

Las mutaciones de gestión tienen una dependencia adicional que falla cerrada
con 403 incluso al inyectar solo autenticación. El integrador debe suministrar
protección real para su mecanismo. Para cookies: validar token ligado a sesión y
origen permitido, además de configuración coherente de sesión. El adaptador HTTP
puede enviar X-CSRF-Token desde un meta csrf-token emitido por el proveedor; no
genera ni verifica por sí solo el token. Esta parte NO está integrada.

La protección de cookies de la confirmación heredada sigue pendiente con Carlos;
su router no fue cambiado. No activar cookies reales hasta resolver ambas rutas.
El proxy Vite evita configurar CORS para la prueba local, pero no sustituye
autenticación ni CSRF. No se añadieron comodines CORS ni un login fuera de alcance.

Los errores de validación no reflejan el payload ni detalles SQL/credenciales.
Los componentes renderizan texto, sin dangerouslySetInnerHTML. Las consultas
del adaptador son parametrizadas. No se registran cuerpos completos de pedidos.
Faltan controles de infraestructura, auditoría formal, cifrado y política de
datos del equipo. No se declara cumplimiento integral de la Ley 29733.

Se impiden envíos simultáneos del formulario con una referencia en memoria y
botón deshabilitado. No hay reintento automático de creación ni idempotencia
durable entre solicitudes: si se pierde la respuesta, consultar el listado antes
de reenviar. Los IDs únicos no deduplican dos solicitudes válidas independientes.

## PostgreSQL preparado, sin migraciones

No se usa SQLite, localStorage ni archivos JSON como persistencia final. La
memoria es exclusivamente un adaptador local/de pruebas, vacío por defecto en API.

PostgresOrderRepository abre una conexión por transacción y mantiene el contexto
por hilo; get dentro de una mutación usa SELECT FOR UPDATE. save comprueba versión
anterior y actualiza la fila existente; add rechaza colisiones sin sobrescribir.
Los filtros e IDs se envían como parámetros. Un fallo abandona la transacción,
limpia el contexto y cierra la conexión. La implementación está probada con dobles,
pero rollback durable y concurrencia real NO están verificados.

La fábrica postgres_repository(dsn) importa Psycopg únicamente al activarla;
importar el módulo no conecta ni crea tablas. La dependencia opcional está
separada en requirements-postgres.txt y no fue instalada. No se usa un ORM.

El adaptador apunta a la misma tabla **pedidos** del documento académico. Requiere
coordinar este contrato de columnas antes de activarlo:

| Columna | Contrato requerido para el adaptador |
|---|---|
| pedido_id | UUID, clave primaria |
| conductor_id | UUID nullable; relación y fuente de asignación por acordar |
| cliente_nombre | Texto hasta 200 |
| direccion_entrega | Texto hasta 500 |
| distrito | Uno de los distritos del contrato |
| ventana_inicio / ventana_fin | TIMESTAMPTZ, fin posterior al inicio |
| peso_kg | DECIMAL(10,2), positivo y finito |
| instrucciones | Texto, vacío permitido, hasta 1000 |
| estado | PENDIENTE / EN_CAMINO / ENTREGADO / CANCELADO |
| confirmed_at | TIMESTAMPTZ nullable; coherencia con entrega |
| version | Entero positivo, aumentado en cada cambio |

Esto es un contrato de integración, **no una migración ni afirmación de esquema
existente**. El DDL académico tiene TIME, exige coordenadas y carece de algunas
columnas anteriores. No se reemplazó ni corrigió unilateralmente. Si se aplica ese
DDL literalmente, el adaptador todavía no es compatible. Antes de integrar nube,
el equipo debe resolver campos temporales, coordenadas, relaciones, constraints,
índices y herramienta de migraciones. No se inventa geocodificación ni claves
foráneas con módulos no implementados.

No hay comandos para crear o limpiar bases. Para la futura prueba real, utilizar
exclusivamente PostgreSQL local aislado, una base con nombre explícito de prueba,
guard que rechace destinos remotos/compartidos, datos ficticios y conexiones
independientes. Durabilidad tras nueva instancia, rollback, constraints y carreras
deben verificarse entonces. No ejecutar TRUNCATE genérico ni migraciones de este
incremento: no se proporcionaron.

## Ejecución local en PowerShell

Desde la raíz del repositorio:

```powershell
Set-Location .\src\backend
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m unittest discover -s tests -v
.\.venv\Scripts\python.exe -m uvicorn manage:app --reload --host 127.0.0.1
```

El entorno virtual ya fue creado e instalado durante esta implementación; para
reutilizarlo omitir el comando de creación. No hace falta activar scripts de
PowerShell ni modificar ExecutionPolicy. El servidor normal responde 401 en las
rutas protegidas; eso es esperado hasta integrar identidad.

En otra terminal, desde la raíz:

```powershell
Set-Location .\src\frontend
npm ci
npm run build
npm run lint
npm run test
npm run dev -- --host 127.0.0.1
```

Abrir http://127.0.0.1:5173/?vista=pedidos para la gestión demo y
http://127.0.0.1:5173/?pedido=PED-0024 para la vista heredada. Query pedido tiene
prioridad para conservar enlaces existentes. Al navegar con recarga, la demo se
reinicia, como indica su aviso visible.

Para probar HTTP local, copiar .env.example a .env.local en src/frontend y
mantener `VITE_API_URL=` (cadena vacía, mismo origen). Reiniciar Vite. El proxy
envía /api a 127.0.0.1:8000 y la interfaz muestra la denegación real, sin fallback
a demo. Para volver a demo, retirar VITE_API_URL del archivo local y reiniciar.
No agregar secretos a VITE_. No activar PostgreSQL mientras falte su contrato.

## Evidencia inicial verificada

| Comando / verificación | Resultado del 1 de octubre de 2026 |
|---|---|
| .venv\Scripts\python.exe -B -m unittest discover -s tests -v | 42 aprobadas; 0 fallidas; 0 omitidas |
| Regresión original de Carlos | Las 11 pruebas originales siguen aprobadas, sin modificar sus expectativas |
| npm ci con lockfile existente | Instalación correcta; sin cambiar versiones ni lockfile |
| npm run build | Correcto |
| npm run lint | Correcto, sin avisos |
| npm run test | 9 aprobadas; 0 fallidas; 0 omitidas |
| API en TestClient | CRUD, permisos por operación, 401/403/404/409/422, paginación, campos protegidos, NaN/infinito y cabeceras no confiables |
| Concurrencia en memoria | Dos escritores: uno obtiene conflicto; entrega frente a cancelación preserva entrega/hora |
| PostgreSQL unitario | 8 pruebas con dobles de conexión; NO prueban durabilidad real |
| Navegador, demo | Registro; rechazo de ventana invertida sin perder formulario; precarga/edición; Escape y foco de diálogo; cancelación conserva datos; filtros sin coincidencias |
| Navegador, XSS | Texto con apariencia de script se mostró como texto, sin abrir diálogo JavaScript |
| Navegador, Carlos | /?pedido=PED-0024, diálogo, confirmación, hora Lima y botón deshabilitado después de entregar |
| Navegador, API local real | Modo HTTP con URL vacía y proxy: muestra sesión requerida, sin fallback demo |
| Vista estrecha de navegador, revisión inicial | Tabla desplaza horizontalmente dentro de su región a ~614 px. La comprobación posterior a 390 px está registrada abajo |
| PostgreSQL real / cookies reales / esquema nube | NO EJECUTADO; no existen contratos ni base autorizada |
| Auditoría formal, carga, certificación WCAG y análisis de vulnerabilidades | NO EJECUTADOS; no se sustituyen por build/lint |

Antes de la publicación inicial se repitieron las 42 pruebas backend, lint, build y las 9
pruebas frontend, sin fallos ni omisiones. Las dependencias backend se comprobaron
con `.venv\Scripts\python.exe -m pip install --no-index -r requirements.txt`:
todas estaban instaladas. Se ejecutó `npm ci --offline --cache .npm-cache
--no-audit --no-fund` usando el lockfile existente. El primer intento falló con
EPERM porque el servidor Vite mantenía ocupado un archivo nativo; tras detener
ese servidor, el segundo intento terminó correctamente. No cambió package-lock.
La revisión de navegador anterior corresponde a la implementación de hoy;
no se repitió durante la publicación. PostgreSQL real y autenticación real
continúan pendientes.

Entorno de implementación: Windows/PowerShell, Python 3.14.7 en .venv, FastAPI 0.142.2,
Uvicorn 0.54.0, HTTPX 0.28.1, Pydantic 2.13.5. Node 24.21.0, npm 11.19.0,
React/React DOM 19.3.0, TypeScript 6.0.3, Vite 8.3.1 y Oxlint 1.86.0.
requirements.txt conserva sus rangos originales; la instalación aislada resolvió
versiones dentro de ellos. Starlette emite un aviso de deprecación de HTTPX en
TestClient; no se añadió otra dependencia ni se alteraron requisitos para ocultarlo.

Se midieron líneas backend con `trace` de Python: dominio de gestión 97.3%, casos
de gestión 98.1% y adaptador PostgreSQL preparado 92.1% en la medición de pruebas
unitarias. Los archivos .cover quedan en .test-deps/coverage excluido de Git.
La medición parcial no certifica integración ni cobertura global del frontend.
Node V8 también se ejecutó sobre casos de uso/adaptadores transpilados; los
componentes React no están instrumentados en esa medición. No se declara la DoD
completa de cobertura global, peer review y staging.

## Componentes, móvil y capturas verificadas

Verificación final de esta ampliación: **1 de octubre de 2026, 13:24:00 UTC-5
(America/Lima)**. Commit de código evaluado:
[`5c5c684a2daa5d30b7693f61712b00e4f630c8e2`](https://github.com/JosefOreC/ALPHA_PROJECT/commit/5c5c684a2daa5d30b7693f61712b00e4f630c8e2).
Las capturas y esta actualización documental se adjuntan en un commit posterior;
no modifican ese código evaluado.

Se revisaron las herramientas existentes antes de instalar: solo había node:test
y TypeScript para reglas/adaptadores. Se presentó una configuración mínima y se
añadió **@playwright/test 1.63.0** como dependencia de desarrollo, con lockfile.
React, Vite y las dependencias anteriores conservan sus versiones. Se utiliza
**Microsoft Edge 154.0.4258.48**, instalado localmente, en modo headless; no se
descargó otro navegador. Node 24.21.0 y npm 11.19.0 permanecen iguales.

Las ocho pruebas de escritorio montan los componentes React reales. Siete usan
la aplicación en modo HTTP con respuestas interceptadas y ficticias; una usa el
montaje explícito de demostración. Las dos pruebas móviles usan ese mismo
componente con DemoManagement. La entrada tests/ui/demo.html está separada del
index.html del producto y no forma parte del build publicado. No hay bypass de
autenticación en el backend ni integración nueva de identidad.

Se verificó mediante campos, botones y resultados visibles: registro con mensaje
de éxito; campos obligatorios y ventana inválida sin solicitud HTTP y conservando
texto; precarga y edición con versión; Volver sin cancelar y confirmación que
cambia a CANCELADO; ausencia de acciones de escritura para solo lectura; error
401 visible sin fallback demo; fallo 503 al guardar que conserva el formulario.
La demostración también recorre registro, edición y cancelación.

El perfil móvil fija **390 × 844 px** y comprueba que window.innerWidth sea 390.
Se revisaron visualmente las cuatro capturas móviles. Las pruebas comprueban los
límites horizontales de controles y que scrollWidth de la página no exceda
clientWidth; la tabla sí admite desplazamiento dentro de su propia región. El
diálogo cabe en el viewport y ambos botones funcionan. También se prueban texto
largo en campos y un mensaje de error sin espacios.

Se encontró un desbordamiento de 3540 px provocado por ese mensaje largo. La
única corrección productiva fue **overflow-wrap:anywhere** en
.management .message, dentro de orderManagement.css. App.css e index.css de
Carlos no cambiaron. Un fallo inicial de cancelación era un selector de prueba
que confundía éxito y carga; se precisó el selector sin cambiar la cancelación.
La primera ejecución quedó esperando al cerrar su servidor bajo el entorno
restringido; se detuvo y las ejecuciones siguientes finalizaron correctamente.

### Comandos y salida resumida del commit evaluado

| Directorio | Comando ejecutado | Salida / resultado |
|---|---|---|
| src/backend | .venv\Scripts\python.exe -B -m unittest discover -s tests -v | Ran 42 tests in 0.852s; OK; 0 fallidas y 0 omitidas |
| src/frontend | npm ci --offline --cache .npm-cache --no-audit --no-fund | added 30 packages in 2s; lockfile respetado |
| src/frontend | npm run test | tests 9; pass 9; fail 0; skipped 0 |
| src/frontend | npm run lint | oxlint; salida exitosa, sin avisos |
| src/frontend | npm run build | tsc -b y Vite; 29 módulos; built in 476ms |
| src/frontend | npm run test:ui | tsc -p tsconfig.ui.json y Playwright; 10 passed (10.0s); 0 fallidas, 0 omitidas, 0 reintentos |

Las 42 pruebas backend incluyen las 11 heredadas de Carlos. Usan memoria y
TestClient; las ocho de PostgreSQL usan dobles de conexión. **PostgreSQL real,
sesión verificada y persistencia durable siguen sin ejecutarse/integrarse**.
El aviso de deprecación de Starlette sigue presente; Playwright/Node emiten un
aviso sobre FORCE_COLOR y NO_COLOR, sin afectar las pruebas. No se declara
certificación WCAG, cobertura global de componentes, carga ni staging.

### Capturas adjuntas

Todas contienen datos ficticios. La demostración no tiene sesión ni persistencia
durable; el aviso se conserva en las vistas y en esta documentación. Registro,
edición y cancelación muestran el mismo pedido ficticio de escritorio; el peso
cambia de 2.5 a 3.75 kg y después el estado cambia a Cancelado. Las imágenes de
listado, formulario y detalle son capturas de página completa de 390 px de ancho;
el diálogo es una captura del viewport 390 × 844, con la página detrás desplazada.

| Evidencia | Captura |
|---|---|
| Registro exitoso | [registro.png](evidencias-crud-pedidos/registro.png) |
| Edición guardada | [edicion.png](evidencias-crud-pedidos/edicion.png) |
| Cancelación confirmada | [cancelacion.png](evidencias-crud-pedidos/cancelacion.png) |
| Listado a 390 px | [movil-listado.png](evidencias-crud-pedidos/movil-listado.png) |
| Formulario a 390 px | [movil-formulario.png](evidencias-crud-pedidos/movil-formulario.png) |
| Detalle a 390 px | [movil-detalle.png](evidencias-crud-pedidos/movil-detalle.png) |
| Diálogo a 390 px | [movil-dialogo.png](evidencias-crud-pedidos/movil-dialogo.png) |

![Diálogo de cancelación a 390 px con datos ficticios](evidencias-crud-pedidos/movil-dialogo.png)

Para reproducir las pruebas desde src/frontend con Edge instalado:

```powershell
npm ci
npm run test
npm run lint
npm run build
npm run test:ui
```

Playwright inicia y cierra su propio Vite en 127.0.0.1:5178; si el puerto está
ocupado, falla en lugar de reutilizar un servidor ajeno. Se puede seleccionar
Chrome instalado mediante $env:PLAYWRIGHT_CHANNEL = 'chrome'. No requiere backend
para las pruebas UI. La configuración sigue la documentación oficial de
[servidor de pruebas](https://playwright.dev/docs/test-webserver) y
[navegadores](https://playwright.dev/docs/browsers).

La generación de las siete capturas es opcional; las pruebas habituales dejan
solo resultados transitorios en .test-deps, excluido de Git. Para regenerar la
evidencia intencionalmente desde src/frontend:

```powershell
$env:CRUD_EVIDENCE_DIR = Join-Path (Resolve-Path '..\..') 'docs\03 Implementación\evidencias-crud-pedidos'
npm run test:ui
Remove-Item Env:CRUD_EVIDENCE_DIR
```

No se adjuntan reportes HTML, trazas, vídeos, dependencias, builds ni cachés. Las
siete PNG solicitadas suman aproximadamente 383 KiB. Solo se publican archivos
de prueba, configuración, estilos del CRUD y esta evidencia del módulo.

## Revisión y publicación autorizada

El usuario autorizó guardar y publicar los cambios mediante el documento
instrucciones_publicar_cambios_crud_pedidos.md. La publicación se limita a
origin/feature/valentino/spr2/m_pedidos/crud, con archivos concretos revisados.
Secretos, .venv, node_modules, dist, cachés y cobertura quedan fuera de Git.
.env.example contiene únicamente configuración pública vacía y comentarios.
Los documentos académicos aprobados y Confirmacion de pedidos.md no se
sobrescribieron. No se crea PR ni se modifica Jira.

Distribución de commits de la publicación inicial autorizada:

1. **feat: implementar reglas y casos de gestión de pedidos**
   - src/backend/domain/entities/order.py
   - src/backend/domain/order_management.py
   - src/backend/domain/ports/order_management.py
   - src/backend/application/use_cases/manage_orders.py
   - src/backend/application/use_cases/register_order.py
   - src/backend/infrastructure/order_ids.py
   - src/backend/infrastructure/persistence/memory_orders.py
   - src/backend/tests/test_manage_orders.py
2. **feat: integrar API de pedidos y preparar persistencia PostgreSQL**
   - src/backend/interfaces/api/orders/management.py
   - src/backend/manage.py
   - src/backend/infrastructure/persistence/postgres_orders.py
   - src/backend/requirements-postgres.txt
   - src/backend/tests/test_management_api.py
   - src/backend/tests/test_postgres_adapter.py
3. **feat: añadir vistas de gestión de pedidos y documentar entrega**
   - src/frontend/src/domain/managedOrder.ts
   - src/frontend/src/application/manageOrders.ts
   - src/frontend/src/infrastructure/httpManagement.ts
   - src/frontend/src/infrastructure/demoManagement.ts
   - src/frontend/src/interfaces/OrderManagementView.tsx
   - src/frontend/src/interfaces/OrderForm.tsx
   - src/frontend/src/interfaces/orderManagement.css
   - src/frontend/src/App.tsx
   - src/frontend/index.html
   - src/frontend/vite.config.ts
   - src/frontend/package.json
   - src/frontend/tests/setup.cjs
   - src/frontend/tests/management.test.cjs
   - src/frontend/.env.example
   - docs/03 Implementación/CRUD de pedidos.md

El único destino de push autorizado es
origin/feature/valentino/spr2/m_pedidos/crud. La rama destino de PR y los revisores
todavía necesitan confirmación del líder/usuario. No se presupone main ni la rama
de Carlos.

## Pendientes para el equipo

- Proveedor de identidad, claims y segmentación por objeto si corresponde.
- Protección de cookies/CSRF de gestión y confirmación del conductor.
- Cobertura geográfica verificable y fuente de coordenadas.
- Esquema PostgreSQL acordado, constraints, relaciones y migración futura.
- Pruebas reales de persistencia, rollback y concurrencia con sesiones independientes.
- Política de datos personales visibles para auditor/logística y controles RN-007.
- Instrumentación de cobertura global de componentes, contraste formal, carga,
  revisión por pares y staging. Las pruebas de componentes y la revisión a 390 px
  ya están ejecutadas y documentadas arriba.
- Si el flujo requiere reintentos de registro: idempotencia durable aprobada y
  almacenamiento compartido de claves; no basta deshabilitar el botón.

Se cumple el incremento local aprobado; los criterios operativos que dependen de
estos puntos permanecen pendientes.
