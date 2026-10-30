# Revisión del Sprint — Sprint 1

**Proyecto:** EcoLogística Lima — DistriRápido S.A.C.

**Versión del documento:** V_1_3_0

**Actualización documental:** 29/10/2026. No es fecha de reunión ni de aceptación.

**Estado:** aceptación técnica y formal pendientes. Esta edición inspecciona documentos y código; no ejecuta la aplicación ni suites funcionales.

## Historias de Usuario y criterios de aceptación

Fuente de criterios: [Transformando a ágil, secciones 5–6](../../02%20Planificaci%C3%B3n/01%20Transformando%20a%20%C3%A1gil%20V_1_0_0.md). CA1/CA2 identifican localmente el primer/segundo escenario Gherkin de cada ID. Los escenarios marcados «propuesto» amplían la comprobación y necesitan confirmación; no sustituyen requisitos aprobados.

Alcance histórico: US-001, US-002, US-003, US-004 y US-012; US-008 fue trabajo adicional; EN-00 quedó pendiente. US-013 se incluye como extensión observada de conductores, sin atribuirle compromiso ni puntos completados. La implementación posterior de sesiones y PostgreSQL no demuestra lo ejecutado al cierre del Sprint 1.

## Demostración y tipos de ruta

- **Gold:** flujo principal completo que aporta el valor de la historia, con las integraciones necesarias.
- **Feliz:** variante válida del flujo principal.
- **Infeliz:** entrada inválida, fallo o rechazo esperado.
- **Borde:** vacío, límite temporal/numérico o concurrencia.

La tabla es el guion reproducible de la demostración pendiente. Un enlace a código o test demuestra su existencia, no que se haya ejecutado ni pasado. Las capturas acreditan únicamente el estado visual registrado.

| Historia | Criterio | Tipo de ruta | Escenario y precondiciones | Resultado esperado | Resultado observado | Evidencia | Decisión de aceptación |
|---|---|---|---|---|---|---|---|
| US-001 — Registrar vehículo | CA1 registro válido | Gold | Administrador autenticado; placa nueva, capacidad positiva y combustible admitido; registrar y volver a consultar. | Vehículo activo persistido, placa y capacidad coinciden y se confirma el alta. | Pendiente de ejecución/evidencia | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/test_vehicle_api.py) | Pendiente |
| US-001 — Registrar vehículo | CA1 registro válido | Feliz | Operador autorizado registra otra placa válida con combustible distinto del primer caso. | Registro asociado a la flota y visible en listado; comprobar permisos según D-10. | Pendiente de ejecución/evidencia | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/test_vehicle_api.py) | Pendiente |
| US-001 — Registrar vehículo | CA2 placa duplicada | Infeliz | La placa ya existe; enviar un segundo registro con esa misma placa. | Rechazo con «La placa ingresada ya se encuentra registrada en el sistema»; no duplicar. | Pendiente de ejecución/evidencia | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/test_vehicle_api.py) | Pendiente |
| US-001 — Registrar vehículo | CA1; borde propuesto | Borde | Enviar capacidad cero y después la menor capacidad positiva admitida por el contrato. | Cero rechazado y mínimo válido admitido; confirmar el mínimo con el equipo antes de aceptar. | Pendiente de ejecución/evidencia | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/test_vehicle_api.py) | Pendiente |
| US-002 — Consultar vehículos disponibles | CA1 listado actualizado | Gold | Operador autenticado; hay vehículos activos e inactivos; consultar disponibilidad del día. | Listado actualizado con estado y disponibilidad; consultar no modifica registros. | Pendiente de ejecución/evidencia | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/test_vehicle_use_cases.py) | Pendiente |
| US-002 — Consultar vehículos disponibles | CA1 listado actualizado | Feliz | Cambiar un vehículo a disponible desde la gestión autorizada y volver a consultar. | La consulta refleja el nuevo estado sin datos de otra sesión. | Pendiente de ejecución/evidencia | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/test_vehicle_use_cases.py) | Pendiente |
| US-002 — Consultar vehículos disponibles | CA1; fallo propuesto | Infeliz | Base de datos inaccesible al consultar la flota. | Error explícito; no presentar una flota inventada como resultado. | Pendiente de ejecución/evidencia | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/test_vehicle_use_cases.py) | Pendiente |
| US-002 — Consultar vehículos disponibles | CA2 sin activos | Borde | Todos los vehículos están inactivos o no existen vehículos. | Lista vacía y «No hay vehículos activos registrados». | Pendiente de ejecución/evidencia | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/test_vehicle_use_cases.py) | Pendiente |
| US-003 — Registrar pedido | CA1 alta disponible para ruteo | Gold | Operador autenticado; dirección en Ate, ventana válida y peso positivo; registrar pedido. | ID único y pedido disponible para ruteo, conservando dirección, peso y ventana. | Pendiente de ejecución/evidencia | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/test_manage_orders.py); [captura histórica de registro](../evidencias-crud-pedidos/registro.png), solo evidencia visual | Pendiente |
| US-003 — Registrar pedido | CA1 alta disponible para ruteo | Feliz | Registrar un segundo pedido válido en Santa Anita con otra ventana horaria. | ID diferente; ambos pedidos disponibles, sin sobrescritura. | Pendiente de ejecución/evidencia | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/test_manage_orders.py) | Pendiente |
| US-003 — Registrar pedido | CA2 fuera de cobertura | Infeliz | Usar una dirección fuera del área operativa configurada. | Rechazo con «La dirección indicada está fuera del área de cobertura operativa». | Pendiente de ejecución/evidencia | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/test_manage_orders.py) | Pendiente |
| US-003 — Registrar pedido | CA1; borde propuesto | Borde | Enviar ventana con fin igual al inicio y repetir con fin posterior mínimo admitido. | Confirmar regla de igualdad y precisión; rechazar ventana no válida sin crear un pedido incompleto. | Pendiente de ejecución/evidencia | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/test_manage_orders.py) | Pendiente |
| US-004 — Confirmar entrega | CA1 confirmación exitosa | Gold | Conductor autenticado y vinculado al pedido EN_CAMINO de su ruta; confirmar entrega. | Estado ENTREGADO y primera hora de confirmación registrada. | Pendiente de ejecución/evidencia | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/test_confirm_delivery.py) | Pendiente |
| US-004 — Confirmar entrega | CA1 confirmación exitosa | Feliz | Confirmar otra parada propia EN_CAMINO y volver a consultar la lista de la ruta. | Avance actualizado y hora de cada entrega conservada. | Pendiente de ejecución/evidencia | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/test_confirm_delivery.py) | Pendiente |
| US-004 — Confirmar entrega | CA2 pedido ya entregado; D-04 | Infeliz | Confirmar de nuevo un pedido ENTREGADO. | El Gherkin exige rechazo y «Este pedido ya fue registrado como entregado»; el contrato idempotente descrito en D-04 requiere conciliación, sin cambiar aquí el criterio. | Pendiente de ejecución/evidencia | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/test_confirm_delivery.py) | Pendiente |
| US-004 — Confirmar entrega | CA1/CA2; borde propuesto | Borde | Dos confirmaciones concurrentes del mismo pedido propio EN_CAMINO. | Una sola transición y primera hora estable; respuesta al duplicado por acordar en D-04. | Pendiente de ejecución/evidencia | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/test_confirm_delivery.py) | Pendiente |
| US-008 — Dashboard operativo | CA1 datos del día | Gold | Administrador u Operador según Gherkin, con operación del día; abrir dashboard. | Entregados/pendientes, cumplimiento de ventanas, km y CO₂ del mismo periodo; conciliar roles con D-10. | Pendiente de ejecución/evidencia | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/interfaces/test_dashboard_api.py) | Pendiente |
| US-008 — Dashboard operativo | CA1 datos del día | Feliz | Confirmar entrega y refrescar indicadores del mismo día. | Conteos actualizados y consistentes con pedidos; no sumar entregas de otro día. | Pendiente de ejecución/evidencia | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/interfaces/test_dashboard_api.py) | Pendiente |
| US-008 — Dashboard operativo | CA1; fallo propuesto | Infeliz | API de indicadores devuelve error de conexión. | Error visible; no reemplazar métricas por ejemplos o ceros que simulen éxito. | Pendiente de ejecución/evidencia | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/interfaces/test_dashboard_api.py) | Pendiente |
| US-008 — Dashboard operativo | CA2 sin rutas | Borde | No existen datos operativos del día. | Valores cero y «No se han generado rutas para la jornada actual». | Pendiente de ejecución/evidencia | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/interfaces/test_dashboard_api.py) | Pendiente |
| US-012 — Registrar conductor | CA1 perfil y vínculo | Gold | Administrador; DNI y licencia nuevos, vehículo existente disponible; registrar conductor. | Perfil creado, vinculado al vehículo y disponible para asignación. | Pendiente de ejecución/evidencia | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/test_driver_api.py) | Pendiente |
| US-012 — Registrar conductor | CA1 perfil y vínculo | Feliz | Registrar otro conductor con DNI distinto y otro vehículo válido. | Vínculos independientes y perfiles consultables. | Pendiente de ejecución/evidencia | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/test_driver_api.py) | Pendiente |
| US-012 — Registrar conductor | CA2 DNI duplicado | Infeliz | Crear conductor con DNI que ya pertenece a otro perfil. | Rechazo con «El DNI ingresado ya corresponde a un conductor registrado». | Pendiente de ejecución/evidencia | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/test_driver_api.py) | Pendiente |
| US-012 — Registrar conductor | CA1; borde propuesto | Borde | DNI con cero inicial y longitud admitida; vehículo válido. | Se conserva el identificador completo sin conversión numérica; validar longitud con contrato. | Pendiente de ejecución/evidencia | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/test_driver_api.py) | Pendiente |
| US-013 — Activar/desactivar conductor | CA1 desactivación | Gold | Administrador y conductor disponible sin ruta en curso; desactivar. | Inactivo, fuera de asignaciones futuras y con historial conservado. | Pendiente de ejecución/evidencia | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/test_driver_use_cases.py) | Pendiente |
| US-013 — Activar/desactivar conductor | CA1; extensión de título | Feliz | Reactivar conductor inactivo sin conflicto de asignación. | Perfil disponible y mismo historial; criterio de reactivación por confirmar. | Pendiente de ejecución/evidencia | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/test_driver_use_cases.py) | Pendiente |
| US-013 — Activar/desactivar conductor | CA2 ruta activa | Infeliz | Conductor con ruta en curso; solicitar desactivación. | Bloqueo con «No es posible desactivar: el conductor tiene una ruta en curso». | Pendiente de ejecución/evidencia | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/test_driver_use_cases.py) | Pendiente |
| US-013 — Activar/desactivar conductor | CA1/CA2; borde propuesto | Borde | Finalizar última ruta y solicitar desactivación simultáneamente. | Estado consistente; no desactivar mientras siga activa la ruta. | Pendiente de ejecución/evidencia | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/test_driver_use_cases.py) | Pendiente |
| EN-00 — Esquema PostgreSQL | CA1 esquema desplegado | Gold | Base exclusiva de desarrollo con PostGIS; modelo revisado; ejecutar inicialización y migración. | Tablas Usuario, Conductor, Vehículo, Pedido, Ruta, Tramo, Zona_Restringida, Reporte e Incidencia relacionadas. | Pendiente de ejecución/evidencia | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/test_postgres_views.py) | Pendiente |
| EN-00 — Esquema PostgreSQL | CA1; repetición propuesta | Feliz | Reaplicar migración soportada sobre esquema compatible. | No perder datos ni duplicar objetos; registrar comandos y versión de migración. | Pendiente de ejecución/evidencia | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/test_postgres_views.py) | Pendiente |
| EN-00 — Esquema PostgreSQL | CA2 migración incompatible | Infeliz | Ambiente aislado con migración previa incompatible. | Reversión automática y log detallado del conflicto, según criterio original. | Pendiente de ejecución/evidencia | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/test_postgres_views.py) | Pendiente |
| EN-00 — Esquema PostgreSQL | CA1/CA2; borde propuesto | Borde | Interrumpir una migración dentro de la transacción en una base desechable. | No dejar esquema parcialmente aplicado; verificar recuperación antes de validar despliegue. | Pendiente de ejecución/evidencia | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/test_postgres_views.py) | Pendiente |

## Evidencia histórica y límites

- [Revisión anterior y registro atribuido a su autor](Hist%C3%B3rico/03%20Revisi%C3%B3n%20del%20Sprint%20V_1_2_0.md): se conserva íntegra, incluidas cifras, referencias y decisiones. Ningún resultado se ratifica por esta edición.

Los resultados agregados de 09/10 y 29/10 atribuidos en las fuentes no incluyen aquí una ejecución por escenario sobre el árbol actual; no se trasladan a la columna «Resultado observado». Para pedidos y mapa hay capturas locales en las [guías técnicas](../Gu%C3%ADas%20t%C3%A9cnicas/README.md); no acreditan rendimiento, seguridad, GPS ni aceptación.

## Pendientes y comprobación técnica

- Ejecutar cada escenario sobre un commit/árbol identificado y registrar entorno, precondiciones, comandos, resultado y artefacto. Confirmar los escenarios propuestos.
- Resolver D-04 (rechazo de repetición frente a idempotencia) y D-10 (roles del Gherkin frente a matriz RBAC) en [decisiones](../../../development/decisiones.md); no adaptar criterios silenciosamente al código.
- La DoD global exige cobertura ≥80 %, análisis estático, revisión por un par, staging independiente, documentación API y criterios comprobados. Todo queda pendiente de evidencia por historia, sin inferir cumplimiento de la existencia de tests.
- Validar migraciones/recuperación y seguridad; motor VRPTW, despacho, fuentes GPS/ETA y factores ambientales siguen pendientes según [impedimentos](02%20Registro%20de%20Impedimentos%20V_1_3_0.md).

## Registro de la reunión y aceptación formal

| Campo | Registro |
|---|---|
| Fecha y hora | Fecha por confirmar |
| Asistentes / stakeholders | Por confirmar con evidencia |
| Decisión por historia | Pendiente; registrar aceptada, parcial o retorno al backlog con criterio y evidencia |
| Acuerdos y responsables | Pendientes de acta o registro atribuido |
| Velocidad | No calculada; no contar historias sin aceptación |

La fuente V_1_2_0 consigna «30/09/2026» y «Todos», aunque también indica ausencia de datos de reunión. Se conservan como anotaciones históricas, sin tratarlas como acta verificada; falta hora, identificación de asistentes y decisiones.


## Control de versiones del documento

| Versión | Fecha | Autoría / cambio |
|---|---|---|
| V_1_2_0 y antecedentes | Fechas en la fuente | Autoría y registro completos en [fuente histórica](Hist%C3%B3rico/03%20Revisi%C3%B3n%20del%20Sprint%20V_1_2_0.md). |
| V_1_3_0 | 29/10/2026 | Actualización documental; pendiente de revisión del equipo. Matriz por criterio y cuatro rutas; resultados pendientes y separación entre verificación técnica y aceptación formal. |


[← Volver al índice correspondiente](README.md)
