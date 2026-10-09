# Criterios de preparación, aceptación y entrega

Las metas provienen de los documentos RF/RNF, reglas de negocio y [DoD de Planificación](../docs/02%20Planificación/01%20Transformando%20a%20ágil%20V_1_0_0.md). Esta guía organiza su verificación; no declara cumplimiento normativo ni resultados de pruebas no ejecutadas.

## Definition of Ready (DoR) propuesta

Antes de comprometer una historia en un sprint:

- ID US/EN y RF/RNF/RN de origen identificados; PMV, dueño y rama registrados.
- Criterios positivos, alternativos y de error escritos; datos de prueba disponibles.
- Dependencias, puertos/DTO, autorización por rol/objeto y efectos sobre estados acordados.
- Migraciones/configuración y modo demo/real definidos, cuando corresponda.
- Estimación del trabajo restante y capacidad comprobadas; ninguna decisión pendiente invalida la aceptación.

Un spike de investigación puede entrar con una pregunta, límite de esfuerzo y decisión esperada; su cierre produce una conclusión verificable, no una historia funcional Done.

## Definition of Done (DoD)

Se conserva el DoD global existente para todas las US/EN:

1. Cobertura unitaria ≥80 % sobre código nuevo o modificado, con reporte y alcance explícitos.
2. Análisis estático sin vulnerabilidades críticas antes del merge.
3. Peer review aprobado por al menos un par técnico mediante PR.
4. Despliegue ejecutable en staging/pruebas, verificado por alguien distinto del implementador.
5. API/documentación actualizadas, incluidos contratos y configuración necesaria.
6. Criterios Gherkin verificados manualmente o mediante pruebas automatizadas.

Para los flujos de este roadmap se añade evidencia de integración sobre datos compartidos, casos de error y arquitectura hexagonal. Repositorios demo/dobles se permiten en pruebas aisladas; la aceptación operacional requiere persistencia/identidad reales del ambiente de pruebas. No sustituir un fallo de API por datos demo sin indicación explícita.

No hay script de cobertura ni análisis de seguridad identificado en los scripts frontend actuales. T-08 debe configurarlos; pasar `npm run test` o `npm run lint` por sí solo no acredita esos criterios. Si una obligación no puede medirse, queda pendiente; una reducción formal de alcance debe quedar en el acta y en D-09.

## Matriz de comprobaciones

| Área / fuente | Verificación requerida | Evidencia / momento |
|---|---|---|
| Gestión RF-001/002/007 | Alta/listado/edición/cancelación, unicidad, ventanas válidas, vínculos y persistencia tras reinicio | Integración PostgreSQL y demo PMV-1/2. |
| Identidad/RBAC, RN-007 y EN-02 | 401 sin sesión; rol no permitido; conductor solo ruta/pedidos propios; protección de mutaciones; sesión no tomada de IDs/roles del cliente | Pruebas negativas por endpoint desde PMV-1; cierre transversal en PMV-3. |
| Concurrencia US-004 y T-02/04 | Dos confirmaciones conservan primera hora; versión obsoleta rechazada; rollback real; no doble asignación | Sesiones independientes de BD y API, PMV-2. |
| Rutas RN-003–005 | Cada pedido se asigna una vez; capacidad y ventanas; conductor/vehículo disponibles; zonas y restricciones parametrizadas; inviables explicados | Dataset y validador independiente del resultado, PMV-2/4. |
| Motor RNF-001 / RN-001 | ≤45 s P95 para 150 pedidos/15 vehículos; timeout visible y UI disponible | Benchmark reproducible desde PMV-2, cierre PMV-4. |
| Reoptimización RNF-004 / RN-002 | Objetivo <30 s desde evento válido; aviso; avance preservado; ausencia de alternativa consistente | Medir cómputo y tiempo integral evento/aviso; PMV-4. El RNF permite ≤30 s y RN-002 es más estricto. |
| Mapa RF-004 | Datos del día, posición/ETA con origen/tiempo; filtros/selección; fuente caida ofrece lista; permisos | Contrato/API y pruebas UI PMV-3. |
| Dashboard RF-005 | Entregados/pendientes, cumplimiento, km y CO₂ concilian; filtros actualizan todas las métricas; cero sin operación | Fixtures calculadas e integración PMV-3. |
| Reportes RF-006 | ≤1.5 s P95; rango sin datos explícito; kg/litros/km/entregas y CSV consistentes | Benchmark API/flujo y archivo revisado PMV-3. |
| Sostenibilidad RN-003 / RNF-008 tentativo | Factores/fuente/versión/unidades y línea base; ahorro calculado sobre escenario comparable | Método acordado D-07, T-06 y revisión de resultados; no inventar meta porcentual. |
| Accesibilidad RNF-005 / RN-009 / EN-05 | WCAG 2.1 AA, foco/teclado/etiquetas; contraste fuente ≥4.5:1 texto normal y ≥3:1 grande; móviles con objetivos de 48 px del diseño | Auditoría manual y automatizada, claro/oscuro y 390 × 844; revisión con conductor. |
| Conectividad EN-05 | Reintento, errores y estado de sincronización; sin pérdida ni duplicación; datos pendientes protegidos si se almacenan localmente | Desconectar/reconectar durante confirmación, PMV-4. |
| Disponibilidad RNF-003 / RN-006 / EN-03 | SLA ≥99.5 % en 05:00–22:00 Lima; RTO ≤30 s; RPO ≤5 s | Monitoreo con intervalo y cálculo; simulación de fallo/recuperación PMV-4. Una demo no acredita SLA anual. |
| Escalabilidad RNF-006 / RN-008 / EN-06 | 1,000 pedidos/día y 50 vehículos; comparación de degradación ≤20 % tras aclarar baseline/carga | Ensayo y entorno documentados, PMV-4. No confundir pedidos diarios con un único cálculo 150/15. |
| Seguridad/datos RNF-002 / RN-007 | Revisar controles del proyecto: OWASP, cifrado en reposo/tránsito, logs sin datos personales y mínimos por rol | Análisis, configuración y pruebas; validación específica D-09. No inferir cumplimiento por mencionar estándares. |
| Mantenibilidad / arquitectura | Domain sin React/FastAPI/BD; aplicación usa puertos; adaptadores externos aislados; entidades compartidas sin duplicación | Tests de arquitectura existentes, revisión de PR y contratos. |

## Comandos existentes para verificación

Usar el entorno del proyecto con dependencias ya instaladas. Estos comandos se documentan para los cambios de producto; no se han ejecutado en esta tarea de documentación.

Desde `src/backend`:

```powershell
python -m pytest
```

`pytest.ini` configura `pythonpath = .` y `testpaths = tests`. Las pruebas unittest del CRUD también pueden verificarse con `python -m unittest discover -s tests -v`; este comando no sustituye la suite completa ni las pruebas de integración real pendientes.

Desde `src/frontend`:

```powershell
npm run test
npm run lint
npm run build
npm run test:ui
```

`test` ejecuta Vitest y las pruebas Node; `test:ui` comprueba tipos y ejecuta Playwright. El navegador de la configuración debe estar disponible. Revisar scripts/configuración actuales al reproducir evidencias históricas; sus cantidades de pruebas no describen automáticamente el HEAD actual.

T-08 debe agregar los pasos que faltan: cobertura, seguridad, BD real, benchmarks y despliegue/rollback de staging. Conservar sus resultados por commit y entorno, incluyendo pruebas omitidas y limitaciones.

## Gates de PMV y release

Cada PMV requiere: alcance y matriz RF actualizados, DoD de historias aceptadas, demo integral del incremento, PR de integración aprobado, staging reproducible y evidencia trazable. Los RF completos se cuentan según D-02; RF parciales permanecen abiertos.

Antes del release final:

- [ ] RF-001–007 evaluados; mínimo 5 completos bajo el método propuesto y objetivo 7/7.
- [ ] Optimización, reoptimización, mapa, indicadores y reportes comprometidos demostrados, aunque se alcance el mínimo RF antes.
- [ ] Mediciones de rendimiento, carga y recuperación; seguridad, accesibilidad y pendientes explícitos.
- [ ] Instalación desde checkout limpio, migraciones, configuración y datos sintéticos documentados sin secretos.
- [ ] Manual de usuario, administrador, API y documentación técnica disponibles.
- [ ] Review y aceptación identifican commit, PR, entorno, evaluador y limitaciones.
- [ ] Tag/release desde commit aceptado; plan de recuperación y continuidad del siguiente sprint.

Evidencia mínima: comando, fecha, commit, entorno/hardware, dataset, resultado esperado/observado y enlace al informe. Los benchmarks registran muestras, warmup, P95, factibilidad y si la medición incluye API/BD/proveedor externo; el número de muestras y la carga se acuerdan antes de medir. Las capturas usan datos sintéticos y no sustituyen pruebas funcionales.
