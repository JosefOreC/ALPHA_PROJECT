# Revisión del sprint

**Nombre del Proyecto:** EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Líder del Proyecto:** Ore Campos, Josef Pablo

**Sprint:** Sprint 3 (10/10/2026 - 30/10/2026)

**Versión del documento:** V_1_2_0

**Actualización documental:** 29/10/2026. No es fecha de reunión ni de aceptación.

**Estado:** ninguna actividad cumple la Definition of Done. Las pruebas automatizadas asociadas se ejecutaron el 29 y 30/10/2026; los escenarios no se ejecutaron manualmente.

## Historias de Usuario completadas en este Sprint

Fuente de criterios: [Transformando a ágil, secciones 5–6](../../02%20Planificaci%C3%B3n/01%20Transformando%20a%20%C3%A1gil%20V_1_0_0.md). CA1/CA2 identifican localmente el primer/segundo escenario Gherkin de cada ID. Los escenarios marcados «propuesto» amplían la comprobación y necesitan confirmación; no sustituyen requisitos aprobados.

La fuente declara US-010, US-011, EN-02 y EN-05 (20 puntos); Jira no se ha consultado en esta edición. El título histórico «Mapa, indicadores» no coincide exactamente con esas cuatro actividades y parte del código ya se describe en Sprint 2: conciliar asignación y fechas antes de contar velocidad.

### Definition of Done por actividad

| Criterio | US-010 | US-011 | EN-05 | EN-02 |
|---|---|---|---|---|
| Cobertura ≥80 % del código nuevo | Cumple: SonarQube 80,4 % del código completo y 93,5 % del código nuevo; medición local backend 97 % y frontend 95,9 % | Ídem | Ídem | Ídem |
| Análisis estático sin vulnerabilidades críticas | Cumple: SonarQube con 0 vulnerabilidades y 0 hotspots; lint y tipos sin errores | Ídem | Ídem | Ídem |
| Revisión por un par mediante PR | No cumple: PR #19 abierto | No cumple: PR #19 abierto | No cumple: PR #16 abierto | No cumple: integrado a `main` sin Pull Request |
| Staging verificado por quien no implementó | No cumple: sin verificación independiente | Ídem | Ídem | Ídem |
| Documentación de API actualizada | Parcial: OpenAPI automático de FastAPI, sin verificación específica | Ídem | Ídem | Ídem |
| Criterios Gherkin comprobados | Parcial: ver la matriz de rutas | Parcial: ver la matriz de rutas | Parcial: ver la matriz de rutas | Parcial: ver la matriz de rutas |
| Aceptación formal | No aceptada (DoD incompleta) | No aceptada (DoD incompleta) | No aceptada (DoD incompleta) | No aceptada (DoD incompleta) |

## Demostración del trabajo completado

Demostración a los stakeholders de las funcionalidades implementadas.

- **Gold:** flujo principal completo que aporta el valor de la historia, con las integraciones necesarias.
- **Feliz:** variante válida del flujo principal.
- **Infeliz:** entrada inválida, fallo o rechazo esperado.
- **Borde:** vacío, límite temporal/numérico o concurrencia.

La tabla es el guion reproducible de la demostración. Un enlace a código o test demuestra su existencia, no que se haya ejecutado ni pasado. Las capturas acreditan únicamente el estado visual registrado.

| Historia | Criterio | Tipo de ruta | Escenario y precondiciones | Resultado esperado | Resultado observado | Evidencia | Decisión de aceptación |
|---|---|---|---|---|---|---|---|
| US-010 — Reporte de sostenibilidad | CA1 reporte y rendimiento | Gold | Administrador según Gherkin; rango con operación y factores de emisión identificados; generar reporte. | CO₂, combustible, km y entregas del periodo; P95 ≤ 1,5 s medido; conciliar rol de Logística en D-10. | Sin prueba automatizada asociada; el escenario no se ejecutó | [Referencia de código; caso por verificar, no ejecución](../../../src/backend/interfaces/api/portal/router.py) | No aceptado: sin evidencia ejecutada |
| US-010 — Reporte de sostenibilidad | CA1 reporte y rendimiento | Feliz | Elegir semana y luego mes con datos conocidos. | Agregados coinciden con los registros del intervalo seleccionado y sus unidades. | Sin prueba automatizada asociada; el escenario no se ejecutó | [Referencia de código; caso por verificar, no ejecución](../../../src/backend/interfaces/api/portal/router.py) | No aceptado: sin evidencia ejecutada |
| US-010 — Reporte de sostenibilidad | CA2 periodo sin registros | Infeliz | Seleccionar rango sin datos operativos. | No generar archivo vacío; «No se encontraron registros operativos para el período seleccionado». | Sin prueba automatizada asociada; el escenario no se ejecutó | [Referencia de código; caso por verificar, no ejecución](../../../src/backend/interfaces/api/portal/router.py) | No aceptado: sin evidencia ejecutada |
| US-010 — Reporte de sostenibilidad | CA1; borde propuesto | Borde | Pedidos justo al inicio y fin del rango, en zona America/Lima. | Inclusión de límites documentada y coherente entre API, vista y exportación. | Sin prueba automatizada asociada; el escenario no se ejecutó | [Referencia de código; caso por verificar, no ejecución](../../../src/backend/interfaces/api/portal/router.py) | No aceptado: sin evidencia ejecutada |
| US-011 — Exportar CSV | CA1 descarga CSV | Gold | Administrador según Gherkin; reporte generado con datos; descargar CSV. | CSV estructurado con encabezados en español y datos del periodo; permisos por conciliar en D-10. | Sin prueba automatizada asociada; el escenario no se ejecutó | [Referencia de código; caso por verificar, no ejecución](../../../src/backend/interfaces/api/portal/router.py) | No aceptado: sin evidencia ejecutada |
| US-011 — Exportar CSV | CA1 descarga CSV | Feliz | Descargar reporte filtrado por otro periodo con tildes en los datos. | Se conservan codificación, encabezados y totales del reporte visible. | Sin prueba automatizada asociada; el escenario no se ejecutó | [Referencia de código; caso por verificar, no ejecución](../../../src/backend/interfaces/api/portal/router.py) | No aceptado: sin evidencia ejecutada |
| US-011 — Exportar CSV | CA2 formato no soportado | Infeliz | Solicitar exportación en un formato no admitido. | «Formato de exportación no disponible» y sugerencia de formatos válidos. | Sin prueba automatizada asociada; el escenario no se ejecutó | [Referencia de código; caso por verificar, no ejecución](../../../src/backend/interfaces/api/portal/router.py) | No aceptado: sin evidencia ejecutada |
| US-011 — Exportar CSV | CA1; borde propuesto | Borde | Registro con coma, comillas y salto de línea en un campo exportable. | Escapado CSV válido, sin desplazar columnas ni perder registros. | Sin prueba automatizada asociada; el escenario no se ejecutó | [Referencia de código; caso por verificar, no ejecución](../../../src/backend/interfaces/api/portal/router.py) | No aceptado: sin evidencia ejecutada |
| EN-02 — Seguridad e identidad | CA2 minimización de datos | Gold | Registrar conductor o destinatario mediante sesión autorizada; inspeccionar campos persistidos. | Solo datos necesarios para la operación; documentar justificación y revisión de privacidad. | Prueba automatizada asociada aprobada (test_sessions.py, 6 pruebas, 30/10/2026); el escenario no se ejecutó manualmente | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/test_sessions.py) | Parcial: falta ejecución manual y revisión de un par |
| EN-02 — Seguridad e identidad | Soporte de CA1/CA2: sesión | Feliz | Cuenta activa inicia sesión, realiza mutación con CSRF válido y cierra sesión. | Identidad verificada; sesión revocada tras salir. Esto por sí solo no acredita EN-02. | Prueba automatizada asociada aprobada (test_sessions.py, 6 pruebas, 30/10/2026); el escenario no se ejecutó manualmente | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/test_sessions.py) | Parcial: falta ejecución manual y revisión de un par |
| EN-02 — Seguridad e identidad | CA1 inyección SQL | Infeliz | En entorno aislado autorizado, enviar intento de inyección al endpoint de autenticación. | Bloqueo, log de auditoría y notificación al equipo de seguridad según criterio; consultas parametrizadas no prueban todo el flujo. | Prueba automatizada asociada aprobada (test_sessions.py, 6 pruebas, 30/10/2026); el escenario no se ejecutó manualmente | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/test_sessions.py) | Parcial: falta ejecución manual y revisión de un par |
| EN-02 — Seguridad e identidad | Soporte: expiración/límite | Borde | Sesión al límite de 8 h; también probar intento 10 y 11 dentro de 15 min. | Expiración y limitación coherentes con código; documentar reloj y conteos sin exponer credenciales. | Prueba automatizada asociada aprobada (test_sessions.py, 6 pruebas, 30/10/2026); el escenario no se ejecutó manualmente | [Tests relacionados; caso por verificar, no ejecutados](../../../src/backend/tests/test_sessions.py) | Parcial: falta ejecución manual y revisión de un par |
| EN-05 — Conductor y accesibilidad | CA1 primer uso | Gold | Conductor sin capacitación previa en móvil; ejecutar confirmación completa. | Completa sin errores; evidencia de criterios WCAG 2.1 AA aplicables, no solo ancho de pantalla. | Prueba automatizada asociada aprobada (driver.spec.ts, 3 pruebas, 30/10/2026); el escenario no se ejecutó manualmente | [Tests UI relacionados; caso por verificar, no ejecutados](../../../src/frontend/tests/ui/driver.spec.ts) | Parcial: falta ejecución manual y revisión de un par |
| EN-05 — Conductor y accesibilidad | CA1; modalidad propuesta | Feliz | Recorrer confirmación mediante teclado y lector de pantalla. | Foco, etiquetas, errores y confirmación accesibles según evaluación documentada. | Prueba automatizada asociada aprobada (driver.spec.ts, 3 pruebas, 30/10/2026); el escenario no se ejecutó manualmente | [Tests UI relacionados; caso por verificar, no ejecutados](../../../src/frontend/tests/ui/driver.spec.ts) | Parcial: falta ejecución manual y revisión de un par |
| EN-05 — Conductor y accesibilidad | CA2 conexión intermitente | Infeliz | Cortar conexión 4G durante confirmación y restablecerla. | Reintento automático y estado de sincronización visible. | Prueba automatizada asociada aprobada (driver.spec.ts, 3 pruebas, 30/10/2026); el escenario no se ejecutó manualmente | [Tests UI relacionados; caso por verificar, no ejecutados](../../../src/frontend/tests/ui/driver.spec.ts) | Parcial: falta ejecución manual y revisión de un par |
| EN-05 — Conductor y accesibilidad | CA2; borde propuesto | Borde | Servidor confirma pero se pierde respuesta y el cliente reintenta. | No duplicar entrega ni cambiar primera hora; resolver conflicto D-04 antes de aceptación. | Prueba automatizada asociada aprobada (driver.spec.ts, 3 pruebas, 30/10/2026); el escenario no se ejecutó manualmente | [Tests UI relacionados; caso por verificar, no ejecutados](../../../src/frontend/tests/ui/driver.spec.ts) | Parcial: falta ejecución manual y revisión de un par |

### Evidencia técnica (29 y 30/10/2026)

Sobre `main` (commit `6ba77a6`, 30/10): frontend con 432 pruebas Vitest, 9 de Node y 40 de navegador aprobadas; backend con 368 pruebas aprobadas, 5 omitidas (PostgreSQL real, no ejecutado) y 36 subpruebas; lint, tipos y compilación sin errores. Cobertura local: backend 97 % y frontend 95,9 % de sentencias (90,2 % de ramas y 97,6 % de líneas); SonarQube Community Build reporta 80,4 % del código completo y 93,5 % del código nuevo. Estas cifras son agregadas: no sustituyen la ejecución por escenario de la matriz ni la aceptación formal.

La rama de Mikeiel (`feature/mikeiel/spr3/rutas/optimizacion-co2`) ya está en `main` desde el 30/10: propuesta de rutas por inserción de menor costo con mejora 2-opt, huella de CO₂ por consumo de combustible, detalle de cada ruta en la interfaz y migración `002_consumo_por_km.sql`. Avanza US-005/EN-01 y el cálculo ambiental de US-010; no es un solucionador VRPTW exacto y no incluye aprobación ni despacho. Medición del 30/10 con datos sintéticos (10 corridas de 150 pedidos y 15 vehículos): mediana 3,5 s y máximo 6,6 s.

### Registro de la reunión y aceptación formal

| Campo | Registro |
|---|---|
| Asistentes / stakeholders | Todo el equipo: Ore Campos, Josef Pablo; Tovar Sánchez, Carlos Alberto; Rojas Camayo, Valentino Jhan Pierre; Rojas Peña, William Mikeiel; Cueva Ricse, Alex Roberto |
| Decisión por historia | Ninguna historia cumple la Definition of Done: se declaran implementadas y no aceptadas; el trabajo restante vuelve al backlog con su sprint de continuación |
| Acuerdos y responsables | Los de la tabla de acciones de la retrospectiva del sprint |
| Velocidad | No calculada; no contar historias sin aceptación |

## Pendientes

- Ejecutar manualmente cada escenario sobre un commit identificado y registrar entorno, precondiciones, comandos, resultado y artefacto; hoy solo hay pruebas automatizadas asociadas.
- Resolver D-04 (rechazo de repetición frente a idempotencia) y D-10 (roles del Gherkin frente a matriz RBAC) en [decisiones](../../../development/decisiones.md); no adaptar criterios silenciosamente al código.
- La DoD global exige cobertura ≥80 %, análisis estático, revisión por un par, staging independiente, documentación API y criterios comprobados. Todo queda pendiente de evidencia por historia, sin inferir cumplimiento de la existencia de tests.
- Validar migraciones/recuperación y seguridad; solucionador VRPTW exacto (hoy hay una heurística), aprobación y despacho de rutas, fuentes GPS/ETA y factores ambientales siguen pendientes según [impedimentos](../Sprint%202/02%20Registro%20de%20Impedimentos%20V_1_5_0.md).

Los documentos 03 Calidad de código, 04 OWASP y 05 WCAG de esta carpeta recogen las evaluaciones exigidas por la consigna del Sprint 3. El equipo ejecutó SonarQube (configuración en la rama de Alex); sus resultados se incorporan a los documentos 03 y 04 cuando se registren las capturas. La accesibilidad se evaluó con axe-core sobre páginas de prueba; faltan Lighthouse y la revisión manual.

## Control de versiones del documento

| Versión | Fecha | Autoría / cambio |
|---|---|---|
| V_1_0_0 | 29/10/2026 | Tovar Sánchez, Carlos Alberto. Emisión inicial de la revisión del Sprint 3 con la plantilla oficial, la Definition of Done por actividad y el registro de la demostración pendiente. |
| V_1_0_0 | 29/10/2026 | Tovar Sánchez, Carlos Alberto. Emisión inicial del informe del Sprint 3, contrastada con `main` (`30969da`). |
| V_1_1_0 | 29/10/2026 | Rojas Camayo, Valentino Jhan Pierre (PR #25). Actualización documental; pendiente de revisión del equipo. Matriz por criterio y cuatro rutas; resultados pendientes y separación entre verificación técnica y aceptación formal. |
| V_1_2_0 | 30/10/2026 | Tovar Sánchez, Carlos Alberto. Documento único vigente: se retiran la carpeta Histórico y los documentos 06 y 07 (los impedimentos IMP-012 a IMP-016 pasan al registro de impedimentos del Sprint 2), se mide la cobertura y se registra la rama de Mikeiel. |


[← Volver al índice correspondiente](README.md)
