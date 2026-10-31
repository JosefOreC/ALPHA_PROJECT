# Revisión del sprint

**Nombre del Proyecto:** EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Líder del Proyecto:** Ore Campos, Josef Pablo

**Sprint:** Sprint 3 (10/10/2026 - 30/10/2026)

**Versión del documento:** V_1_6_0

**Actualización documental:** 30/10/2026.

**Estado:** **CERRADO Y ACEPTADO.** Se completó el alcance comprometido del Sprint 3 —US-010, US-011, EN-02 y EN-05 (20 puntos)— y se aceptó con observaciones no bloqueantes. Las pruebas automatizadas registradas fueron satisfactorias y SonarQube Community Build reporta 0 vulnerabilidades y 0 Security Hotspots, con Quality Gate aprobado. La evaluación OWASP Top 10 (2025) cubre las diez categorías: 0 vulnerabilidades confirmadas, 4 sin hallazgos y 6 con advertencias (A02, A03, A04, A05, A06 y A09), con las correcciones aplicadas y las acciones pendientes en seguimiento. El PMV-3 completo (mapa, indicadores y tráfico) no se declara terminado: continúa en el Sprint 4.

## Historias de Usuario completadas en este Sprint

Fuente de criterios: [Transformando a ágil, secciones 5–6](../../02%20Planificaci%C3%B3n/01%20Transformando%20a%20%C3%A1gil%20V_1_0_0.md). CA1/CA2 identifican localmente el primer/segundo escenario Gherkin de cada ID. Los escenarios marcados «propuesto» amplían la comprobación y necesitan confirmación; no sustituyen requisitos aprobados.

La fuente declara US-010, US-011, EN-02 y EN-05 (20 puntos) como alcance comprometido. El título histórico «Mapa, indicadores» corresponde al PMV-3: de ese alcance, este sprint cierra las cuatro actividades declaradas; el mapa, el dashboard y el tráfico (US-006 a US-009 y EN-04) no se declaran terminados y quedan para la planificación del Sprint 4. La conciliación con Jira y la continuidad con el Sprint 2 se registran en IMP-015 y en el registro de impedimentos.

### Definition of Done por actividad

| Criterio | US-010 | US-011 | EN-05 | EN-02 |
|---|---|---|---|---|
| Cobertura ≥80 % del código nuevo | Cumple: 93,5 % del código nuevo; como referencia, 80,4 % del código completo. Medición local: backend 97 % y frontend 95,9 % | Ídem | Ídem | Ídem |
| Análisis estático sin vulnerabilidades críticas | Cumple: SonarQube Community Build con 0 vulnerabilidades y 0 Security Hotspots; Quality Gate aprobado. Se aplicaron las correcciones de dependencias (`vite` 8.3.5, `undici` 8.12.3) y de construcción de SQL (`psycopg.sql`, commit `bcc11e5`); el endurecimiento restante (cabeceras de seguridad, cookie `Secure` y EN-02) figura como acción del Sprint 4 en el documento 04. El análisis de SonarQube es limitado y se complementa con inspección manual y auditorías de dependencias. | Ídem | Ídem | Ídem |
| Revisión por un par mediante PR | Aceptado con observación: revisión por par del PR #19 pendiente (IMP-012) | Aceptado con observación: revisión por par del PR #19 pendiente (IMP-012) | Aceptado con observación: revisión por par del PR #16 pendiente (IMP-012) | Aceptado con observación: revisión complementaria pendiente (IMP-013) |
| Staging verificado por quien no implementó | Aceptado con observación: validación independiente en staging pendiente (IMP-012) | Aceptado con observación: validación independiente en staging pendiente (IMP-012) | Aceptado con observación: validación independiente en staging pendiente (IMP-012) | Cumple |
| Documentación de API actualizada | Cumple: documentación OpenAPI disponible; revisión específica como mejora menor | Ídem | Ídem | Ídem |
| Criterios Gherkin comprobados | Aceptado con observación: evidencia manual pendiente (IMP-014) | Aceptado con observación: evidencia manual pendiente (IMP-014) | Aceptado con observación: evidencia manual pendiente (IMP-014) | Aceptado con observación: evidencia manual pendiente (IMP-014) |
| Aceptación formal | Aceptada con observaciones | Aceptada con observaciones | Aceptada con observaciones | Aceptada con observaciones |

## Demostración del trabajo completado

Demostración a los stakeholders de las funcionalidades implementadas.

- **Gold:** flujo principal completo que aporta el valor de la historia, con las integraciones necesarias.
- **Feliz:** variante válida del flujo principal.
- **Infeliz:** entrada inválida, fallo o rechazo esperado.
- **Borde:** vacío, límite temporal/numérico o concurrencia.

La tabla resume los escenarios considerados para la aceptación. Las verificaciones automáticas disponibles (sesiones y flujo del conductor) se ejecutaron el 30/10/2026 y constan en la evidencia técnica; los escenarios sin prueba automatizada se indican en la propia tabla. La ejecución manual en el entorno de demostración se registra como observación de seguimiento (IMP-014) y no se presenta como ejecutada.

| Historia | Criterio | Tipo de ruta | Escenario y precondiciones | Resultado esperado | Resultado observado | Evidencia | Decisión de aceptación |
|---|---|---|---|---|---|---|---|
| US-010 — Reporte de sostenibilidad | CA1 reporte y rendimiento | Gold | Administrador según Gherkin; rango con operación y factores de emisión identificados; generar reporte. | CO₂, combustible, km y entregas del periodo; P95 ≤ 1,5 s medido; conciliar rol de Logística en D-10. | Sin prueba automatizada asociada; el escenario no se ejecutó | [Referencia de código; caso por verificar, no ejecución](../../../src/backend/interfaces/api/portal/router.py) | Aceptado con observación menor: completar evidencia manual del escenario |
| US-010 — Reporte de sostenibilidad | CA1 reporte y rendimiento | Feliz | Elegir semana y luego mes con datos conocidos. | Agregados coinciden con los registros del intervalo seleccionado y sus unidades. | Sin prueba automatizada asociada; el escenario no se ejecutó | [Referencia de código; caso por verificar, no ejecución](../../../src/backend/interfaces/api/portal/router.py) | Aceptado con observación: evidencia manual en IMP-014 |
| US-010 — Reporte de sostenibilidad | CA2 periodo sin registros | Infeliz | Seleccionar rango sin datos operativos. | No generar archivo vacío; «No se encontraron registros operativos para el período seleccionado». | Sin prueba automatizada asociada; el escenario no se ejecutó | [Referencia de código; caso por verificar, no ejecución](../../../src/backend/interfaces/api/portal/router.py) | Aceptado con observación: evidencia manual en IMP-014 |
| US-010 — Reporte de sostenibilidad | CA1; borde propuesto | Borde | Pedidos justo al inicio y fin del rango, en zona America/Lima. | Inclusión de límites documentada y coherente entre API, vista y exportación. | Sin prueba automatizada asociada; el escenario no se ejecutó | [Referencia de código; caso por verificar, no ejecución](../../../src/backend/interfaces/api/portal/router.py) | Aceptado con observación: evidencia manual en IMP-014 |
| US-011 — Exportar CSV | CA1 descarga CSV | Gold | Administrador según Gherkin; reporte generado con datos; descargar CSV. | CSV estructurado con encabezados en español y datos del periodo; permisos por conciliar en D-10. | Sin prueba automatizada asociada; el escenario no se ejecutó | [Referencia de código; caso por verificar, no ejecución](../../../src/backend/interfaces/api/portal/router.py) | Aceptado con observación: evidencia manual en IMP-014 |
| US-011 — Exportar CSV | CA1 descarga CSV | Feliz | Descargar reporte filtrado por otro periodo con tildes en los datos. | Se conservan codificación, encabezados y totales del reporte visible. | Sin prueba automatizada asociada; el escenario no se ejecutó | [Referencia de código; caso por verificar, no ejecución](../../../src/backend/interfaces/api/portal/router.py) | Aceptado con observación: evidencia manual en IMP-014 |
| US-011 — Exportar CSV | CA2 formato no soportado | Infeliz | Solicitar exportación en un formato no admitido. | «Formato de exportación no disponible» y sugerencia de formatos válidos. | Sin prueba automatizada asociada; el escenario no se ejecutó | [Referencia de código; caso por verificar, no ejecución](../../../src/backend/interfaces/api/portal/router.py) | Aceptado con observación: evidencia manual en IMP-014 |
| US-011 — Exportar CSV | CA1; borde propuesto | Borde | Registro con coma, comillas y salto de línea en un campo exportable. | Escapado CSV válido, sin desplazar columnas ni perder registros. | Sin prueba automatizada asociada; el escenario no se ejecutó | [Referencia de código; caso por verificar, no ejecución](../../../src/backend/interfaces/api/portal/router.py) | Aceptado con observación: evidencia manual en IMP-014 |
| EN-02 — Seguridad e identidad | CA2 minimización de datos | Gold | Registrar conductor o destinatario mediante sesión autorizada; inspeccionar campos persistidos. | Solo datos necesarios para la operación; documentar justificación y revisión de privacidad. | Prueba automatizada asociada aprobada (test_sessions.py, 6 pruebas, 30/10/2026); el escenario no se ejecutó manualmente | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/test_sessions.py) | Aceptado con observación: evidencia manual en IMP-014 |
| EN-02 — Seguridad e identidad | Soporte de CA1/CA2: sesión | Feliz | Cuenta activa inicia sesión, realiza mutación con CSRF válido y cierra sesión. | Identidad verificada; sesión revocada tras salir. Esto por sí solo no acredita EN-02. | Prueba automatizada asociada aprobada (test_sessions.py, 6 pruebas, 30/10/2026); el escenario no se ejecutó manualmente | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/test_sessions.py) | Aceptado con observación: evidencia manual en IMP-014 |
| EN-02 — Seguridad e identidad | CA1 inyección SQL | Infeliz | En entorno aislado autorizado, enviar intento de inyección al endpoint de autenticación. | Bloqueo, log de auditoría y notificación al equipo de seguridad según criterio; consultas parametrizadas no prueban todo el flujo. | Prueba automatizada asociada aprobada (test_sessions.py, 6 pruebas, 30/10/2026); el escenario específico no se ejecutó manualmente | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/test_sessions.py) | Aceptado con observación: evidencia manual en IMP-014 |
| EN-02 — Seguridad e identidad | Soporte: expiración/límite | Borde | Sesión al límite de 8 h; también probar intento 10 y 11 dentro de 15 min. | Expiración y limitación coherentes con código; documentar reloj y conteos sin exponer credenciales. | Prueba automatizada asociada aprobada (test_sessions.py, 6 pruebas, 30/10/2026); el escenario no se ejecutó manualmente | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/test_sessions.py) | Aceptado con observación: evidencia manual en IMP-014 |
| EN-05 — Conductor y accesibilidad | CA1 primer uso | Gold | Conductor sin capacitación previa en móvil; ejecutar confirmación completa. | Completa sin errores; evidencia de criterios WCAG 2.1 AA aplicables, no solo ancho de pantalla. | Prueba automatizada asociada aprobada (driver.spec.ts, 3 pruebas, 30/10/2026); el escenario no se ejecutó manualmente | [Tests UI relacionados; caso por verificar, no ejecutados](../../../src/frontend/tests/ui/driver.spec.ts) | Aceptado con observación: evidencia manual en IMP-014 |
| EN-05 — Conductor y accesibilidad | CA1; modalidad propuesta | Feliz | Recorrer confirmación mediante teclado y lector de pantalla. | Foco, etiquetas, errores y confirmación accesibles según evaluación documentada. | Prueba automatizada asociada aprobada (driver.spec.ts, 3 pruebas, 30/10/2026); el escenario no se ejecutó manualmente | [Tests UI relacionados; caso por verificar, no ejecutados](../../../src/frontend/tests/ui/driver.spec.ts) | Aceptado con observación menor: completar revisión manual de accesibilidad |
| EN-05 — Conductor y accesibilidad | CA2 conexión intermitente | Infeliz | Cortar conexión 4G durante confirmación y restablecerla. | Reintento automático y estado de sincronización visible. | Prueba automatizada asociada aprobada (driver.spec.ts, 3 pruebas, 30/10/2026); el escenario no se ejecutó manualmente | [Tests UI relacionados; caso por verificar, no ejecutados](../../../src/frontend/tests/ui/driver.spec.ts) | Aceptado con observación: evidencia manual en IMP-014 |
| EN-05 — Conductor y accesibilidad | CA2; borde propuesto | Borde | Servidor confirma pero se pierde respuesta y el cliente reintenta. | No duplicar entrega ni cambiar primera hora; resolver conflicto D-04 antes de aceptación. | Prueba automatizada asociada aprobada (driver.spec.ts, 3 pruebas, 30/10/2026); el escenario no se ejecutó manualmente | [Tests UI relacionados; caso por verificar, no ejecutados](../../../src/frontend/tests/ui/driver.spec.ts) | Aceptado con observación: evidencia manual en IMP-014 |

### Evidencia técnica (29 y 30/10/2026)

Sobre `main` (commit `6ba77a6`, 30/10; la inspección de seguridad del documento 04 corresponde a `29ca820`, las correcciones de dependencias y SQL se integran en `bcc11e5` y la evaluación WCAG corresponde a `0844c7a`, PR #28): frontend con 432 pruebas Vitest, 9 de Node y 40 de navegador aprobadas; backend con 368 pruebas aprobadas, 5 omitidas (PostgreSQL real, no ejecutado) y 36 subpruebas; lint, tipos y compilación sin errores. Cobertura local: backend 97 % y frontend 95,9 % de sentencias (90,2 % de ramas y 97,6 % de líneas); SonarQube Community Build reporta 80,4 % del código completo y 93,5 % del código nuevo. El análisis de seguridad de SonarQube es limitado; sus 0 vulnerabilidades y 0 Security Hotspots se complementan con la inspección manual y las auditorías de dependencias. Estas cifras son agregadas: no sustituyen la ejecución por escenario de la matriz ni la aceptación formal.

La rama de Mikeiel (`feature/mikeiel/spr3/rutas/optimizacion-co2`) ya está en `main` desde el 30/10: propuesta de rutas por inserción de menor costo con mejora 2-opt, huella de CO₂ por consumo de combustible, detalle de cada ruta en la interfaz y migración `002_consumo_por_km.sql`. Avanza US-005/EN-01 y el cálculo ambiental de US-010; no es un solucionador VRPTW exacto y no incluye aprobación ni despacho. Medición del 30/10 con datos sintéticos (10 corridas de 150 pedidos y 15 vehículos): mediana 3,5 s y máximo 6,6 s.

### Registro de la reunión y aceptación formal

| Campo | Registro |
|---|---|
| Asistentes / stakeholders | Todo el equipo: Ore Campos, Josef Pablo; Tovar Sánchez, Carlos Alberto; Rojas Camayo, Valentino Jhan Pierre; Rojas Peña, William Mikeiel; Cueva Ricse, Alex Roberto |
| Decisión por historia | Las historias del Sprint 3 se aceptan con observaciones no bloqueantes. Las condiciones de evidencia (revisión por pares, validación independiente y comprobaciones manuales) quedan registradas en IMP-012, IMP-013 e IMP-014, con seguimiento en el Sprint 4 |
| Acuerdos y responsables | Los de la tabla de acciones de la retrospectiva del sprint |
| Velocidad | 20 puntos comprometidos, con aceptación formal registrada y observaciones no bloqueantes; la serie histórica se actualiza en la planificación del Sprint 4 |

## Observaciones puntuales y acciones de mejora

- Completar y conservar la evidencia manual de los escenarios seleccionados, indicando commit, entorno, precondiciones y resultado.
- Mantener actualizadas las decisiones D-04 (rechazo de repetición frente a idempotencia) y D-10 (roles del Gherkin frente a matriz RBAC) en [decisiones](../../../development/decisiones.md).
- Cerrar el registro de revisión por pares y conservar la evidencia de validación independiente en staging. Estas actividades quedan como observaciones menores de mejora.
- Continuar la validación de migraciones y recuperación. La evolución del solucionador VRPTW, la aprobación y despacho de rutas, las fuentes GPS/ETA y los factores ambientales se mantienen en el registro de [impedimentos](../Sprint%202/02%20Registro%20de%20Impedimentos%20V_1_6_0.md).
- En seguridad, el reporte OWASP 2025 no registra vulnerabilidades confirmadas: A01, A07, A08 y A10 quedan sin hallazgos, y A02, A03, A04, A05, A06 y A09 con advertencias, con las correcciones de dependencias y SQL ya aplicadas y las acciones de cookie `Secure`, cabeceras de seguridad y EN-02 planificadas para el Sprint 4.

Los documentos 03 Calidad de código, 04 OWASP y 05 WCAG de esta carpeta recogen las evaluaciones exigidas por la consigna del Sprint 3. El documento 04 evalúa las diez categorías OWASP 2025 con 0 vulnerabilidades confirmadas: 4 sin hallazgos y 6 con advertencias de endurecimiento (A02, A03, A04, A05, A06 y A09). SonarQube Community Build reporta 0 vulnerabilidades y 0 Security Hotspots, con Quality Gate aprobado; debido al aviso «Limited security analysis», el resultado se complementa con la inspección manual y las auditorías de dependencias. La accesibilidad se evaluó con axe-core y Lighthouse sobre páginas de prueba; la revisión manual con lector de pantalla queda como comprobación complementaria.

## Control de versiones del documento

| Versión | Fecha | Autoría / cambio |
|---|---|---|
| V_1_0_0 | 29/10/2026 | Tovar Sánchez, Carlos Alberto. Emisión inicial de la revisión del Sprint 3 sobre `main` (`30969da`): plantilla oficial, Definition of Done por actividad y registro de la demostración pendiente. |
| V_1_1_0 | 29/10/2026 | Rojas Camayo, Valentino Jhan Pierre (PR #25). Actualización documental; pendiente de revisión del equipo. Matriz por criterio y cuatro rutas; resultados pendientes y separación entre verificación técnica y aceptación formal. |
| V_1_2_0 | 30/10/2026 | Tovar Sánchez, Carlos Alberto. Documento único vigente: se retira la carpeta Histórico y el documento 06 (los impedimentos IMP-012 a IMP-016 pasan al registro de impedimentos del Sprint 2), se mide la cobertura y se registra la rama de Mikeiel. |
| V_1_3_0 | 30/10/2026 | Tovar Sánchez, Carlos Alberto. Se actualiza el estado de seguridad con las correcciones implementadas y los resultados del reporte OWASP 2025: 8 categorías limpias y 2 bajo revisión. Esta cifra se sustituyó en V_1_6_0 por el resultado vigente: 4 sin hallazgos y 6 con advertencias. |
| V_1_4_0 | 30/10/2026 | Tovar Sánchez, Carlos Alberto. Se actualiza el cierre del Sprint 3 y se organizan las comprobaciones complementarias como acciones de seguimiento. |
| V_1_5_0 | 30/10/2026 | Tovar Sánchez, Carlos Alberto. Se establece el estado general del Sprint 3 como aceptado y se dejan observaciones puntuales no bloqueantes para seguimiento. |
| V_1_6_0 | 30/10/2026 | Tovar Sánchez, Carlos Alberto. Corrección de coherencia del cierre: el estado se alinea con el documento 04 (diez categorías evaluadas, 0 vulnerabilidades confirmadas, 4 sin hallazgos y 6 con advertencias), se precisa el alcance (PMV-3 frente a los 20 puntos comprometidos), la aceptación se registra como «con observaciones» y se vincula a IMP-012, IMP-013 e IMP-014, se ajustan las condiciones de la DoD y se unifican las referencias de commit. |

[← Volver al índice correspondiente](README.md)
