# Revisión del Sprint — Sprint 3

**Proyecto:** EcoLogística Lima — DistriRápido S.A.C.

**Versión del documento:** V_1_2_0

**Actualización documental:** 29/10/2026. No es fecha de reunión ni de aceptación.

**Estado:** aceptación técnica y formal pendientes. Esta edición inspecciona documentos y código; no ejecuta la aplicación ni suites funcionales.

## Historias de Usuario y criterios de aceptación

Fuente de criterios: [Transformando a ágil, secciones 5–6](../../02%20Planificaci%C3%B3n/01%20Transformando%20a%20%C3%A1gil%20V_1_0_0.md). CA1/CA2 identifican localmente el primer/segundo escenario Gherkin de cada ID. Los escenarios marcados «propuesto» amplían la comprobación y necesitan confirmación; no sustituyen requisitos aprobados.

La fuente declara US-010, US-011, EN-02 y EN-05 (20 puntos); Jira no se ha consultado en esta edición. El título histórico «Mapa, indicadores» no coincide exactamente con esas cuatro actividades y parte del código ya se describe en Sprint 2: conciliar asignación y fechas antes de contar velocidad.

## Demostración y tipos de ruta

- **Gold:** flujo principal completo que aporta el valor de la historia, con las integraciones necesarias.
- **Feliz:** variante válida del flujo principal.
- **Infeliz:** entrada inválida, fallo o rechazo esperado.
- **Borde:** vacío, límite temporal/numérico o concurrencia.

La tabla es el guion reproducible de la demostración pendiente. Un enlace a código o test demuestra su existencia, no que se haya ejecutado ni pasado. Las capturas acreditan únicamente el estado visual registrado.

| Historia | Criterio | Tipo de ruta | Escenario y precondiciones | Resultado esperado | Resultado observado | Evidencia | Decisión de aceptación |
|---|---|---|---|---|---|---|---|
| US-010 — Reporte de sostenibilidad | CA1 reporte y rendimiento | Gold | Administrador según Gherkin; rango con operación y factores de emisión identificados; generar reporte. | CO₂, combustible, km y entregas del periodo; P95 ≤ 1,5 s medido; conciliar rol de Logística en D-10. | Pendiente de ejecución/evidencia | [Referencia de código; caso por verificar, no ejecución](../../../src/backend/interfaces/api/portal/router.py) | Pendiente |
| US-010 — Reporte de sostenibilidad | CA1 reporte y rendimiento | Feliz | Elegir semana y luego mes con datos conocidos. | Agregados coinciden con los registros del intervalo seleccionado y sus unidades. | Pendiente de ejecución/evidencia | [Referencia de código; caso por verificar, no ejecución](../../../src/backend/interfaces/api/portal/router.py) | Pendiente |
| US-010 — Reporte de sostenibilidad | CA2 periodo sin registros | Infeliz | Seleccionar rango sin datos operativos. | No generar archivo vacío; «No se encontraron registros operativos para el período seleccionado». | Pendiente de ejecución/evidencia | [Referencia de código; caso por verificar, no ejecución](../../../src/backend/interfaces/api/portal/router.py) | Pendiente |
| US-010 — Reporte de sostenibilidad | CA1; borde propuesto | Borde | Pedidos justo al inicio y fin del rango, en zona America/Lima. | Inclusión de límites documentada y coherente entre API, vista y exportación. | Pendiente de ejecución/evidencia | [Referencia de código; caso por verificar, no ejecución](../../../src/backend/interfaces/api/portal/router.py) | Pendiente |
| US-011 — Exportar CSV | CA1 descarga CSV | Gold | Administrador según Gherkin; reporte generado con datos; descargar CSV. | CSV estructurado con encabezados en español y datos del periodo; permisos por conciliar en D-10. | Pendiente de ejecución/evidencia | [Referencia de código; caso por verificar, no ejecución](../../../src/backend/interfaces/api/portal/router.py) | Pendiente |
| US-011 — Exportar CSV | CA1 descarga CSV | Feliz | Descargar reporte filtrado por otro periodo con tildes en los datos. | Se conservan codificación, encabezados y totales del reporte visible. | Pendiente de ejecución/evidencia | [Referencia de código; caso por verificar, no ejecución](../../../src/backend/interfaces/api/portal/router.py) | Pendiente |
| US-011 — Exportar CSV | CA2 formato no soportado | Infeliz | Solicitar exportación en un formato no admitido. | «Formato de exportación no disponible» y sugerencia de formatos válidos. | Pendiente de ejecución/evidencia | [Referencia de código; caso por verificar, no ejecución](../../../src/backend/interfaces/api/portal/router.py) | Pendiente |
| US-011 — Exportar CSV | CA1; borde propuesto | Borde | Registro con coma, comillas y salto de línea en un campo exportable. | Escapado CSV válido, sin desplazar columnas ni perder registros. | Pendiente de ejecución/evidencia | [Referencia de código; caso por verificar, no ejecución](../../../src/backend/interfaces/api/portal/router.py) | Pendiente |
| EN-02 — Seguridad e identidad | CA2 minimización de datos | Gold | Registrar conductor o destinatario mediante sesión autorizada; inspeccionar campos persistidos. | Solo datos necesarios para la operación; documentar justificación y revisión de privacidad. | Pendiente de ejecución/evidencia | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/test_sessions.py) | Pendiente |
| EN-02 — Seguridad e identidad | Soporte de CA1/CA2: sesión | Feliz | Cuenta activa inicia sesión, realiza mutación con CSRF válido y cierra sesión. | Identidad verificada; sesión revocada tras salir. Esto por sí solo no acredita EN-02. | Pendiente de ejecución/evidencia | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/test_sessions.py) | Pendiente |
| EN-02 — Seguridad e identidad | CA1 inyección SQL | Infeliz | En entorno aislado autorizado, enviar intento de inyección al endpoint de autenticación. | Bloqueo, log de auditoría y notificación al equipo de seguridad según criterio; consultas parametrizadas no prueban todo el flujo. | Pendiente de ejecución/evidencia | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/test_sessions.py) | Pendiente |
| EN-02 — Seguridad e identidad | Soporte: expiración/límite | Borde | Sesión al límite de 8 h; también probar intento 10 y 11 dentro de 15 min. | Expiración y limitación coherentes con código; documentar reloj y conteos sin exponer credenciales. | Pendiente de ejecución/evidencia | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/test_sessions.py) | Pendiente |
| EN-05 — Conductor y accesibilidad | CA1 primer uso | Gold | Conductor sin capacitación previa en móvil; ejecutar confirmación completa. | Completa sin errores; evidencia de criterios WCAG 2.1 AA aplicables, no solo ancho de pantalla. | Pendiente de ejecución/evidencia | [Tests UI relacionados; caso por verificar, no ejecutados](../../../src/frontend/tests/ui/driver.spec.ts) | Pendiente |
| EN-05 — Conductor y accesibilidad | CA1; modalidad propuesta | Feliz | Recorrer confirmación mediante teclado y lector de pantalla. | Foco, etiquetas, errores y confirmación accesibles según evaluación documentada. | Pendiente de ejecución/evidencia | [Tests UI relacionados; caso por verificar, no ejecutados](../../../src/frontend/tests/ui/driver.spec.ts) | Pendiente |
| EN-05 — Conductor y accesibilidad | CA2 conexión intermitente | Infeliz | Cortar conexión 4G durante confirmación y restablecerla. | Reintento automático y estado de sincronización visible. | Pendiente de ejecución/evidencia | [Tests UI relacionados; caso por verificar, no ejecutados](../../../src/frontend/tests/ui/driver.spec.ts) | Pendiente |
| EN-05 — Conductor y accesibilidad | CA2; borde propuesto | Borde | Servidor confirma pero se pierde respuesta y el cliente reintenta. | No duplicar entrega ni cambiar primera hora; resolver conflicto D-04 antes de aceptación. | Pendiente de ejecución/evidencia | [Tests UI relacionados; caso por verificar, no ejecutados](../../../src/frontend/tests/ui/driver.spec.ts) | Pendiente |

## Evidencia histórica y límites

- Revisión anterior y registro atribuido a su autor (ver el anexo de este documento): se conserva íntegra, incluidas cifras, referencias y decisiones. Ningún resultado se ratifica por esta edición.

Los resultados agregados de 09/10 y 29/10 atribuidos en las fuentes no incluyen aquí una ejecución por escenario sobre el árbol actual; no se trasladan a la columna «Resultado observado». Para pedidos y mapa hay capturas locales en las [guías técnicas](../Gu%C3%ADas%20t%C3%A9cnicas/README.md); no acreditan rendimiento, seguridad, GPS ni aceptación.

## Evidencia técnica (29 y 30/10/2026)

Sobre `main` (commit `30969da`, 29/10): frontend con 273 pruebas Vitest, 9 de Node y 40 de navegador aprobadas; backend con 225 pruebas aprobadas, 5 omitidas (PostgreSQL real, no ejecutado) y 36 subpruebas; lint, tipos y compilación sin errores. Cobertura medida el 30/10: backend 82 % (sentencias de `application`, `domain`, `infrastructure` e `interfaces`) y frontend 80,0 % de sentencias, 72,5 % de ramas y 85,8 % de líneas. Estas cifras son agregadas: no sustituyen la ejecución por escenario de la matriz ni la aceptación formal.

Rama de Mikeiel `feature/mikeiel/spr3/rutas/optimizacion-co2` (5 commits del 30/10, sin Pull Request): propuesta de rutas por inserción de menor costo y mejora 2-opt, huella de CO₂ por consumo de combustible por tipo, detalle de cada ruta en la interfaz y migración `002_consumo_por_km.sql`. Avanza US-005/EN-01 y el cálculo ambiental que alimenta US-010, pero no es un motor VRPTW, no incluye aprobación ni despacho, y no está en `main`; no se cuenta como completado.

## Pendientes y comprobación técnica

- Ejecutar cada escenario sobre un commit/árbol identificado y registrar entorno, precondiciones, comandos, resultado y artefacto. Confirmar los escenarios propuestos.
- Resolver D-04 (rechazo de repetición frente a idempotencia) y D-10 (roles del Gherkin frente a matriz RBAC) en [decisiones](../../../development/decisiones.md); no adaptar criterios silenciosamente al código.
- La DoD global exige cobertura ≥80 %, análisis estático, revisión por un par, staging independiente, documentación API y criterios comprobados. Todo queda pendiente de evidencia por historia, sin inferir cumplimiento de la existencia de tests.
- Validar migraciones/recuperación y seguridad; motor VRPTW, despacho, fuentes GPS/ETA y factores ambientales siguen pendientes según [impedimentos](../Sprint%202/02%20Registro%20de%20Impedimentos%20V_1_5_0.md).

Los documentos 03 Calidad de código, 04 OWASP y 05 WCAG de esta carpeta recogen las evaluaciones exigidas por la consigna del Sprint 3. Sus campos que dependen de SonarQube y de la herramienta de accesibilidad automatizada permanecen «Pendiente de ejecución» hasta correr esas herramientas.

## Definition of Done por actividad

| Criterio | US-010 | US-011 | EN-05 | EN-02 |
|---|---|---|---|---|
| Cobertura ≥80 % del código nuevo | Cobertura global medida el 30/10: backend 82 %, frontend 80 % (sentencias); por actividad, pendiente | Ídem | Ídem | Ídem |
| Análisis estático sin vulnerabilidades críticas | Parcial: lint y tipos sin errores; SonarQube pendiente | Parcial | Parcial | Parcial |
| Revisión por un par mediante PR | Pendiente de confirmación | Pendiente de confirmación | Pendiente de confirmación | Pendiente de confirmación |
| Staging verificado por quien no implementó | Pendiente | Pendiente | Pendiente | Pendiente |
| Documentación de API actualizada | Pendiente de verificación | Pendiente de verificación | Pendiente de verificación | Pendiente de verificación |
| Criterios Gherkin comprobados | Pendiente según matriz | Pendiente según matriz | Pendiente según matriz | Pendiente según matriz |
| Aceptación formal | Pendiente | Pendiente | Pendiente | Pendiente |

## Registro de la reunión y aceptación formal

| Campo | Registro |
|---|---|
| Fecha y hora | Cierre del Sprint 3 (30/10/2026) |
| Asistentes / stakeholders | Todo el equipo: Ore Campos, Josef Pablo; Tovar Sánchez, Carlos Alberto; Rojas Camayo, Valentino Jhan Pierre; Rojas Peña, William Mikeiel; Cueva Ricse, Alex Roberto |
| Decisión por historia | Ninguna historia cumple la Definition of Done: se declaran implementadas y no aceptadas; el trabajo restante vuelve al backlog con su sprint de continuación |
| Acuerdos y responsables | Los de la tabla de acciones de la retrospectiva del sprint |
| Velocidad | No calculada; no contar historias sin aceptación |

## Anexo A — Edición anterior V_1_0_0 (conservada como antecedente)

Texto de la edición anterior; se conserva su contenido y sus cifras con la fecha de esa edición. Solo se ajustaron enlaces y niveles de encabezado. El estado vigente es el de las secciones anteriores de este documento.

> **HISTÓRICO — no vigente.** Contenido previo conservado; solo se ajustan navegación y enlaces. Las cifras, fechas, responsables y cierres son registros atribuidos al autor indicado; no se reejecutaron ni se ratificaron en esta revisión documental. Vigente: [01 Revisión del Sprint V_1_1_0](01%20Revisi%C3%B3n%20del%20Sprint%20V_1_2_0.md).

### Revisión del sprint

**Nombre del Proyecto:** EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Líder del Proyecto:** Ore Campos, Josef Pablo

**Sprint:** Sprint 3 — Mapa, indicadores (10/10/2026 - 30/10/2026)

**Versión del documento:** V_1_0_0

**Última actualización:** 29/10/2026

> Las cifras de este documento provienen de la ejecución local sobre `main` (commit `30969da`) del 29/10/2026 y de GitHub. Jira no se pudo consultar desde el repositorio: el estado de cada actividad en Jira se registra en la columna «Estado en Jira» una vez conciliado. Los resultados de SonarQube, OWASP y WCAG estarán en los documentos 03 Calidad de código, 04 OWASP y 05 WCAG de esta carpeta, que se emiten después de ejecutar cada herramienta.

#### Historias de Usuario completadas en este Sprint

El Sprint 3 tiene 4 actividades y 20 puntos en Jira. **Ninguna cumple todavía la Definition of Done global** (sección 8 de `01 Transformando a ágil`); se declaran implementadas con criterios pendientes y no se contabilizan sus puntos como completados hasta la aceptación.

| Actividad | Puntos | Trabajo realizado | Resultado | Estado en Jira |
|---|---|---|---|---|
| **US-010** Generar reporte de sostenibilidad | 5 | Reporte por semana, mes o trimestre con gráfico y tablas por distrito y vehículo, leyendo `/reports/sustainability` de la base de pruebas (PR #19, código en `main`). | Implementada, no Done | Por verificar |
| **US-011** Exportar reporte en CSV | 2 | Exportación del periodo mostrado con encabezados en español; descarga real comprobada en una prueba de navegador (PR #19). | Implementada, no Done | Por verificar |
| **EN-05** Interfaz del conductor WCAG 2.1 AA | 5 | Vista móvil «Mi ruta» y «Pedido actual» con objetivos táctiles de 48 px y sin desbordamiento a 390 px, leyendo la ruta del conductor de la API (PR #16). | Implementada, no Done | Por verificar |
| **EN-02** Middleware OWASP Top 10 + Ley N.° 29733 | 8 | Inicio de sesión con contraseña con hash, sesión con expiración y revocación, CSRF, 10 intentos cada 15 minutos, roles verificados en el servidor y CORS configurable (commits de Josef en `main`, sin PR). | Parcial | Por verificar |

**Definition of Done por actividad (29/10/2026):**

| Criterio de la DoD | US-010 | US-011 | EN-05 | EN-02 |
|---|---|---|---|---|
| 1. Cobertura de pruebas ≥ 80 % del código nuevo | No medida | No medida | No medida | No medida |
| 2. Análisis estático sin vulnerabilidades críticas | Parcial: lint y tipos sin errores; SonarQube pendiente | Parcial | Parcial | Parcial |
| 3. Revisión de código aprobada por un par mediante PR | No: PR #19 abierto | No: PR #19 abierto | No: PR #16 abierto | No: integrado sin PR |
| 4. Despliegue en pruebas verificado por quien no implementó | No | No | No | No |
| 5. Documentación de API actualizada | No verificada | No verificada | No verificada | No verificada |
| 6. Escenarios Gherkin verificados | 1.º: parcial (sin medir el P95 de 1,5 s). 2.º: no (no se encontró el mensaje «No se encontraron registros operativos para el período seleccionado») | 1.º: sí (prueba de navegador con descarga real). 2.º: no (no se encontró «Formato de exportación no disponible») | 1.º: no verificado con un conductor nuevo. 2.º: no (sin reintento automático documentado) | 1.º: no (sin bloqueo ni notificación de inyección SQL). 2.º: no verificado |
| **Resultado** | No Done | No Done | No Done | No Done |

#### Demostración del trabajo completado

Demostración a los stakeholders de las funcionalidades implementadas.

**Registro de la demostración** (se completa solo con evidencia de la reunión; no se completa por inferencia):

| Campo | Registro |
|---|---|
| Fecha y hora | Cierre del Sprint 3 (30/10/2026) |
| Asistentes (stakeholders) | Todo el equipo: Ore Campos, Josef Pablo; Tovar Sánchez, Carlos Alberto; Rojas Camayo, Valentino Jhan Pierre; Rojas Peña, William Mikeiel; Cueva Ricse, Alex Roberto |
| Retroalimentación recibida | Ninguna registrada por escrito; las observaciones se incorporan a la tabla de acciones de la retrospectiva |
| Decisión sobre cada actividad (aceptada / parcial / vuelve al backlog) | Ninguna cumple la Definition of Done: se declaran implementadas y no aceptadas, y el trabajo restante vuelve al backlog con continuación en el Sprint 4 |
| Velocidad del sprint | Por calcular tras la decisión |

**Guion de la demostración** (con sesión iniciada sobre la base de pruebas sintética de siete días: 1.050 pedidos, 70 rutas, 15 vehículos y 15 conductores):

1. **Reporte de sostenibilidad (US-010):** como Responsable de Logística, elegir semana, mes o trimestre y revisar el gráfico y las tablas por distrito y vehículo.
2. **Exportación CSV (US-011):** descargar el CSV del periodo y abrirlo para comprobar los encabezados en español.
3. **Conductor móvil (EN-05):** a 390 px, recorrer «Mi ruta», abrir la parada actual y confirmar la entrega.
4. **Seguridad (EN-02):** iniciar y cerrar sesión, comprobar el bloqueo tras 10 intentos fallidos y el rechazo de recursos de otro rol.
5. **Aclaración a los asistentes:** los datos, las posiciones y los factores de emisión son sintéticos; el motor de optimización no existe y no hay GPS ni ETA reales.

**Evidencia técnica (29/10/2026, `main`, commit `30969da`):** frontend con 273 pruebas de Vitest, 9 de Node y 40 de navegador aprobadas; backend con 225 pruebas aprobadas, 5 omitidas (integración con PostgreSQL real) y 36 subpruebas; lint, tipos y compilación sin errores. Las capturas de Jira y de la demostración van en [`evidencias-jira/`](evidencias-jira).

#### Pendientes

- Realizar la demostración a los stakeholders y registrar fecha, asistentes y decisión.
- Revisar los Pull Request #12 a #21 y el código de autenticación integrado a `main` sin PR; activar la protección de `main`.
- Medir la cobertura de pruebas y ejecutar SonarQube (documentos 03 y 04) y la evaluación de accesibilidad (documento 05).
- US-010 y US-011: medir el P95 de 1,5 s, agregar los mensajes de «sin registros» y «formato no soportado» y validar los factores de emisión y la línea base.
- EN-05: prueba con conexión intermitente (reintento automático y estado de sincronización) y prueba con un conductor sin capacitación.
- EN-02: cabeceras de seguridad, auditoría anonimizada, bloqueo y notificación de inyección SQL y tratamiento de datos personales (Ley N.° 29733).
- Conciliar Jira con el repositorio y registrar la aceptación por actividad.

## Anexo B — Edición anterior V_1_0_0 (conservada como antecedente)

Texto de la edición anterior; se conserva su contenido y sus cifras con la fecha de esa edición. Solo se ajustaron enlaces y niveles de encabezado. El estado vigente es el de las secciones anteriores de este documento.

> **HISTÓRICO — no vigente.** Contenido previo conservado; solo se ajustan navegación y enlaces. Las cifras, fechas, responsables y cierres son registros atribuidos al autor indicado; no se reejecutaron ni se ratificaron en esta revisión documental. Vigente: 06 Informe de estado del proyecto V_1_1_0.

### Informe de estado del proyecto

**Nombre del Proyecto:** EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Líder del Proyecto:** Ore Campos, Josef Pablo

**Fecha:** 29/10/2026

**Periodo del Informe:** 10/10/2026 - 30/10/2026 (Sprint 3 — Mapa, indicadores)

**Versión del documento:** V_1_0_0

**Última actualización:** 29/10/2026

> **Nota.** Informe previo al cierre del sprint (30/10/2026). Los datos del tablero de Jira no se pudieron consultar desde el repositorio; las celdas que dependen de Jira están marcadas «por verificar». Las demás cifras provienen de GitHub y de la ejecución local sobre `main` (commit `30969da`) del 29/10/2026.

##### **Estado del proyecto**

| Variables de control | Descripción del estado |
| --- | --- |
| **Alcance** | El sprint tiene 4 actividades y 20 puntos en Jira: US-010 (5), US-011 (2), EN-05 (5) y EN-02 (8). Las tres primeras tienen interfaz y API en `main`: reporte de sostenibilidad con gráfico, tablas y exportación CSV leyendo `/reports/sustainability`, y la vista móvil del conductor leyendo `/conductor/ruta`. Ese código llegó a `main` el 09/10 por commits directos (la serie de interfaz, cuyos Pull Request #12 a #21 siguen abiertos, y el trabajo de Josef), sin revisión de un par técnico. EN-02 está parcialmente cubierto: inicio de sesión, CSRF, límite de intentos, roles y CORS configurable; faltan cabeceras de seguridad, auditoría anonimizada, bloqueo de inyección SQL y el tratamiento de la Ley N.° 29733. Los datos son los de una base de pruebas sintética. |
| **Cronograma** | Sprint del 10/10/2026 al 30/10/2026; cierra el 30/10. Desde el 10/10 los únicos commits en `main` son de documentación (Valentino Rojas, 14 y 16/10); el código evaluado entró el 09/10, antes del inicio del sprint según las fechas de Jira. Ningún Pull Request de funcionalidad se integró en el periodo. |
| **Costos** | Sin ejecución presupuestal registrada; se usan herramientas de código abierto (React, Vite, Leaflet, OpenStreetMap, FastAPI, PostgreSQL). |
| **Calidad** | Ejecución del 29/10/2026 sobre `main` (`30969da`): backend con 225 pruebas aprobadas, 5 omitidas (integración con PostgreSQL real) y 36 subpruebas; frontend con 273 pruebas de Vitest, 9 de Node y 40 de navegador aprobadas; lint sin avisos, tipos y compilación correctos. No se midió cobertura, rendimiento (P95 1,5 s de US-010) ni accesibilidad con herramienta automática. |

##### **Actividades del Sprint 3**

| Actividad | Puntos | Evidencia | Estado real (29/10/2026) | Estado en Jira |
| --- | --- | --- | --- | --- |
| **US-010** Generar reporte de sostenibilidad | 5 | PR #19 (`feature/carlos/spr3/ui/07-sostenibilidad`), commits en `main`; endpoint `/reports/sustainability`. | Implementado: reporte por semana, mes o trimestre con gráfico, tablas por distrito y vehículo, leyendo la base de pruebas. No se encontró en el código el texto del criterio «No se encontraron registros operativos para el período seleccionado» ni se midió el P95 de 1,5 s; los factores de emisión y la línea base no están validados. | Por verificar |
| **US-011** Exportar reporte en CSV | 2 | PR #19 (misma rama); prueba de navegador con descarga real de un CSV. | Implementado: exportación CSV del periodo mostrado con encabezados en español. No se encontró en el código el mensaje «Formato de exportación no disponible» del segundo escenario. | Por verificar |
| **EN-05** Interfaz del conductor WCAG 2.1 AA | 5 | PR #16 (`feature/carlos/spr3/ui/04-conductor`); pruebas de navegador a 390 px. | Implementado: «Mi ruta» y «Pedido actual» con objetivos táctiles de 48 px y sin desbordamiento a 390 px. Falta una auditoría WCAG documentada y la prueba con conexión 4G intermitente. | Por verificar |
| **EN-02** Middleware OWASP Top 10 + Ley N.° 29733 | 8 | Commits `a07136a`, `c981e8a` y `97b401b` de Josef (sin Pull Request): `security/router.py`, `security/deps.py`, `infrastructure/security.py`. | Parcial: contraseñas con hash, sesión con expiración de 8 horas y revocación, CSRF en mutaciones, 10 intentos de acceso cada 15 minutos, roles verificados en el servidor y CORS desde `CORS_ALLOW_ORIGINS`. Faltan cabeceras de seguridad, límite de peticiones general, bloqueo y notificación de inyección SQL, registro de auditoría anonimizado y tratamiento de datos personales (Ley N.° 29733). | Por verificar |

Los puntos **no se contabilizan como completados**: ninguna actividad está aceptada ni cumple todos sus criterios Gherkin. US-010, US-011 y EN-05 están implementadas con criterios por verificar; EN-02 está parcial.

##### **Demostración del trabajo realizado**

1. Aplicación con sesión iniciada sobre la base de pruebas (siete días: 1.050 pedidos, 70 rutas, 15 vehículos y 15 conductores): reporte de sostenibilidad con exportación CSV, vista móvil del conductor, mapa con filtros, dashboard, administración y permisos por rol.
2. Intentos de acceso: bloqueo tras 10 intentos fallidos, cierre de sesión y rechazo de recursos ajenos.
3. Capturas de Jira (planificación y tablero) en `evidencias-jira/`: **por agregar**.

##### **Riesgos**

| **Riesgo** | **Responsable** | **Mitigación** | **Estado al 29/10/2026** |
| -- | -- | -- | -- |
| Pull Request de interfaz sin revisar y código de seguridad integrado sin Pull Request. | Equipo del proyecto | Revisión por un par técnico, cierre o fusión de los PR #12 a #21 y protección de `main`. | Abierto. |
| Seguridad (EN-02) incompleta frente a OWASP Top 10 y la Ley N.° 29733. | Equipo técnico | Implementar cabeceras, auditoría anonimizada y bloqueo de inyección; decidir la rama. | Abierto. |
| Datos sintéticos presentados como reales. | Equipo del proyecto | Indicar en demostraciones e informes que los datos y las posiciones son simulados. | Abierto. |
| Algoritmo VRPTW sin implementar (los archivos de rutas están vacíos). | Responsable de backend | Versión base y dataset de benchmark. | Abierto (IMP-003). |

##### **Próximos avances**

- Revisar los Pull Request #12 a #21 y el código de autenticación integrado sin revisión.
- Completar EN-02 y documentar la auditoría WCAG de EN-05.
- Cubrir los escenarios sin datos y de formato no soportado de US-010 y US-011, y medir el P95 del reporte.
- Conciliar Jira con el repositorio y registrar la aceptación del sprint.

##### **Notas**

Este informe no declara aceptadas las actividades ni presenta datos sintéticos como operación real. Ver el [registro de impedimentos](../Sprint%202/02%20Registro%20de%20Impedimentos%20V_1_5_0.md) y la [auditoría de coherencia del Sprint 2](../Sprint%202/05%20Auditor%C3%ADa%20de%20coherencia%20del%20proyecto%20V_1_5_0.md).

## Control de versiones del documento

| Versión | Fecha | Autoría / cambio |
|---|---|---|
| V_1_0_0 | 29/10/2026 | Tovar Sánchez, Carlos Alberto. Emisión inicial de la revisión del Sprint 3 con la plantilla oficial, la Definition of Done por actividad y el registro de la demostración pendiente. |
| V_1_0_0 | 29/10/2026 | Tovar Sánchez, Carlos Alberto. Emisión inicial del informe del Sprint 3, contrastada con `main` (`30969da`). |
| V_1_1_0 | 29/10/2026 | Rojas Camayo, Valentino Jhan Pierre (PR #25). Actualización documental; pendiente de revisión del equipo. Matriz por criterio y cuatro rutas; resultados pendientes y separación entre verificación técnica y aceptación formal. |
| V_1_2_0 | 30/10/2026 | Tovar Sánchez, Carlos Alberto. Documento único vigente: se integran la revisión y el informe de estado anteriores como anexos, se retiran la carpeta Histórico y los documentos 06 y 07 (los impedimentos IMP-012 a IMP-016 pasan al registro de impedimentos del Sprint 2), se mide la cobertura y se registra la rama de Mikeiel. |


[← Volver al índice correspondiente](README.md)
