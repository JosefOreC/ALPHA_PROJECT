# Revisión del sprint

**Nombre del Proyecto:** EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Líder del Proyecto:** Ore Campos, Josef Pablo

**Sprint:** Sprint 3 (10/10/2026 - 30/10/2026)

**Versión del documento:** V_1_7_0

**Actualización documental:** 11/11/2026.

**Estado:** **CERRADO; ACEPTADO CON OBSERVACIONES POR EL DIRECTOR DEL PROYECTO (Ore Campos, Josef Pablo, 11/11/2026). La definición de terminado no está completa y el representante del cliente no respalda todavía la aceptación** (sesión de revisión del 11/11/2026, ver «Registro de la reunión»). Se implementó el alcance comprometido del Sprint 3 —US-010, US-011, EN-02 y EN-05 (20 puntos)—. Faltan tres condiciones de la definición de terminado: revisión por par (IMP-012), validación independiente en preproducción (IMP-012; EN-02 sí la cumple) y comprobación de los criterios Gherkin (IMP-014). Por eso los 20 puntos se registran como provisionales hasta cerrar esos impedimentos. Las pruebas automatizadas registradas fueron satisfactorias y SonarQube Community Build reporta 0 vulnerabilidades y 0 puntos de revisión de seguridad, con control de calidad aprobado. La evaluación OWASP Top 10 (2025) cubre las diez categorías: 0 vulnerabilidades confirmadas. Al cierre (30/10) quedaron 4 categorías sin hallazgos y 6 con advertencias; en el seguimiento del 11/11/2026 se corrigieron A02 y A03, pendientes de un nuevo análisis SonarQube. El PMV-3 completo (mapa, indicadores y tráfico) no se declara terminado: continúa en el Sprint 4.

## Historias de Usuario completadas en este Sprint

Fuente de criterios: [Transformando a ágil, secciones 5–6](../../02%20Planificaci%C3%B3n/01%20Transformando%20a%20%C3%A1gil%20V_1_0_0.md). CA1/CA2 identifican localmente el primer/segundo escenario Gherkin de cada ID. Los escenarios marcados «propuesto» amplían la comprobación y necesitan confirmación; no sustituyen requisitos aprobados.

La fuente declara US-010, US-011, EN-02 y EN-05 (20 puntos) como alcance comprometido. El título histórico «Mapa, indicadores» corresponde al PMV-3: de ese alcance, este sprint cierra las cuatro actividades declaradas; el mapa, el dashboard y el tráfico (US-006 a US-009 y EN-04) no se declaran terminados y quedan para la planificación del Sprint 4. La conciliación con Jira y la continuidad con el Sprint 2 se registran en IMP-015 y en el registro de impedimentos.

### definición de terminado por actividad

| Criterio | US-010 | US-011 | EN-05 | EN-02 |
|---|---|---|---|---|
| Cobertura ≥80 % del código nuevo | Cumple según SonarQube Community Build: 93,5 % de cobertura del código nuevo o modificado, calculada sobre 153 líneas nuevas a cubrir; el mínimo del 80 % aplica a ese conjunto. Referencia separada: 80,4 % del código completo. La ejecución local registró 97 % de sentencias del servidor y 95,9 % de sentencias de la interfaz web; otra medición local de Python registra 97,6 % en líneas y 90,2 % en ramas. En la ejecución de integración continua de la solicitud de integración n.º 38 se obtuvieron 94,61 % en líneas y 93,09 % en ramas, ambos sobre el mínimo del 90 %. Son métricas de herramientas y denominadores distintos; no se sustituyen entre sí. | Ídem | Ídem | Ídem |
| Análisis estático sin vulnerabilidades críticas | Cumple dentro del alcance observado: SonarQube Community Build informó 0 vulnerabilidades y 0 puntos de revisión de seguridad, con el control de calidad aprobado; la captura no identifica la rama ni el registro de cambio. Las correcciones de dependencias (`vite` 8.3.5, `undici` 8.12.3) y de construcción de SQL (`psycopg.sql`) se integraron el 30/10/2026 a las 14:17 (hora de Lima). La ejecución posterior de la solicitud de integración n.º 38 pasó las pruebas, la comprobación de cobertura, la compilación y la auditoría complementaria sobre una base que ya contenía esos cambios; SonarCloud no produjo un resultado de control de calidad porque el análisis automático estaba habilitado en paralelo. El análisis Community Build es limitado. Seguimiento del 11/11/2026: la cookie `Secure` por defecto y las cabeceras de seguridad ya están corregidas en el código, con pruebas; EN-02 continúa en el Sprint 4 (documento 04, sección 3). | Ídem | Ídem | Ídem |
| Revisión por un par mediante solicitud de integración | Aceptado con observación: revisión por par de la solicitud de integración n.º 19 pendiente (IMP-012) | Aceptado con observación: revisión por par de la solicitud de integración n.º 19 pendiente (IMP-012) | Aceptado con observación: revisión por par de la solicitud de integración n.º 16 pendiente (IMP-012) | Aceptado con observación: revisión complementaria pendiente (IMP-013) |
| entorno de preproducción verificado por quien no implementó | Aceptado con observación: validación independiente en entorno de preproducción pendiente (IMP-012) | Aceptado con observación: validación independiente en entorno de preproducción pendiente (IMP-012) | Aceptado con observación: validación independiente en entorno de preproducción pendiente (IMP-012) | Cumple |
| Documentación de API actualizada | Cumple: documentación OpenAPI disponible; revisión específica como mejora menor | Ídem | Ídem | Ídem |
| Criterios Gherkin comprobados | Aceptado con observación: evidencia manual pendiente (IMP-014) | Aceptado con observación: evidencia manual pendiente (IMP-014) | Aceptado con observación: evidencia manual pendiente (IMP-014) | Aceptado con observación: evidencia manual pendiente (IMP-014) |
| Aceptación formal | Aceptada con observaciones; DoD incompleta | Aceptada con observaciones; DoD incompleta | Aceptada con observaciones; DoD incompleta | Aceptada con observaciones; DoD incompleta |

**Resumen de la definición de terminado:** de seis condiciones previas a la aceptación, cada actividad cumple tres (cobertura, análisis estático y documentación de API) y EN-02 cumple además la validación en preproducción. Las demás siguen abiertas en IMP-012 e IMP-014.

## Demostración del trabajo completado

Demostración a las partes interesadas de las funcionalidades implementadas.

- **Principal:** flujo principal completo que aporta el valor de la historia, con las integraciones necesarias.
- **Feliz:** variante válida del flujo principal.
- **Infeliz:** entrada inválida, fallo o rechazo esperado.
- **Borde:** vacío, límite temporal/numérico o concurrencia.

La tabla resume los escenarios considerados para la aceptación. Las verificaciones automáticas disponibles (sesiones y flujo del conductor) se ejecutaron el 30/10/2026 y constan en la evidencia técnica; los escenarios sin prueba automatizada se indican en la propia tabla. La ejecución manual en el entorno de demostración se registra como observación de seguimiento (IMP-014) y no se presenta como ejecutada.

| Historia | Criterio | Tipo de ruta | Escenario y precondiciones | Resultado esperado | Resultado observado | Evidencia | Decisión de aceptación |
|---|---|---|---|---|---|---|---|
| US-010 — Reporte de sostenibilidad | CA1 reporte y rendimiento | Principal | Administrador según Gherkin; rango con operación y factores de emisión identificados; generar reporte. | CO₂, combustible, km y entregas del periodo; P95 ≤ 1,5 s medido; conciliar rol de Logística en D-10. | Sin prueba automatizada asociada; el escenario no se ejecutó | [Referencia de código; caso por verificar, no ejecución](../../../src/backend/interfaces/api/portal/router.py) | Aceptado con observación menor: completar evidencia manual del escenario |
| US-010 — Reporte de sostenibilidad | CA1 reporte y rendimiento | Feliz | Elegir semana y luego mes con datos conocidos. | Agregados coinciden con los registros del intervalo seleccionado y sus unidades. | Sin prueba automatizada asociada; el escenario no se ejecutó | [Referencia de código; caso por verificar, no ejecución](../../../src/backend/interfaces/api/portal/router.py) | Aceptado con observación: evidencia manual en IMP-014 |
| US-010 — Reporte de sostenibilidad | CA2 periodo sin registros | Infeliz | Seleccionar rango sin datos operativos. | No generar archivo vacío; «No se encontraron registros operativos para el período seleccionado». | Sin prueba automatizada asociada; el escenario no se ejecutó | [Referencia de código; caso por verificar, no ejecución](../../../src/backend/interfaces/api/portal/router.py) | Aceptado con observación: evidencia manual en IMP-014 |
| US-010 — Reporte de sostenibilidad | CA1; borde propuesto | Borde | Pedidos justo al inicio y fin del rango, en zona America/Lima. | Inclusión de límites documentada y coherente entre API, vista y exportación. | Sin prueba automatizada asociada; el escenario no se ejecutó | [Referencia de código; caso por verificar, no ejecución](../../../src/backend/interfaces/api/portal/router.py) | Aceptado con observación: evidencia manual en IMP-014 |
| US-011 — Exportar CSV | CA1 descarga CSV | Principal | Administrador según Gherkin; reporte generado con datos; descargar CSV. | CSV estructurado con encabezados en español y datos del periodo; permisos por conciliar en D-10. | Sin prueba automatizada asociada; el escenario no se ejecutó | [Referencia de código; caso por verificar, no ejecución](../../../src/backend/interfaces/api/portal/router.py) | Aceptado con observación: evidencia manual en IMP-014 |
| US-011 — Exportar CSV | CA1 descarga CSV | Feliz | Descargar reporte filtrado por otro periodo con tildes en los datos. | Se conservan codificación, encabezados y totales del reporte visible. | Sin prueba automatizada asociada; el escenario no se ejecutó | [Referencia de código; caso por verificar, no ejecución](../../../src/backend/interfaces/api/portal/router.py) | Aceptado con observación: evidencia manual en IMP-014 |
| US-011 — Exportar CSV | CA2 formato no soportado | Infeliz | Solicitar exportación en un formato no admitido. | «Formato de exportación no disponible» y sugerencia de formatos válidos. | Sin prueba automatizada asociada; el escenario no se ejecutó | [Referencia de código; caso por verificar, no ejecución](../../../src/backend/interfaces/api/portal/router.py) | Aceptado con observación: evidencia manual en IMP-014 |
| US-011 — Exportar CSV | CA1; borde propuesto | Borde | Registro con coma, comillas y salto de línea en un campo exportable. | Escapado CSV válido, sin desplazar columnas ni perder registros. | Sin prueba automatizada asociada; el escenario no se ejecutó | [Referencia de código; caso por verificar, no ejecución](../../../src/backend/interfaces/api/portal/router.py) | Aceptado con observación: evidencia manual en IMP-014 |
| EN-02 — Seguridad e identidad | CA2 minimización de datos | Principal | Registrar conductor o destinatario mediante sesión autorizada; inspeccionar campos persistidos. | Solo datos necesarios para la operación; documentar justificación y revisión de privacidad. | Prueba automatizada asociada aprobada (test_sessions.py, 6 pruebas, 30/10/2026); el escenario no se ejecutó manualmente | [pruebas relacionadas; caso por verificar, escenario no ejecutado](../../../src/backend/tests/test_sessions.py) | Aceptado con observación: evidencia manual en IMP-014 |
| EN-02 — Seguridad e identidad | Soporte de CA1/CA2: sesión | Feliz | Cuenta activa inicia sesión, realiza mutación con CSRF válido y cierra sesión. | Identidad verificada; sesión revocada tras salir. Esto por sí solo no acredita EN-02. | Prueba automatizada asociada aprobada (test_sessions.py, 6 pruebas, 30/10/2026); el escenario no se ejecutó manualmente | [pruebas relacionadas; caso por verificar, escenario no ejecutado](../../../src/backend/tests/test_sessions.py) | Aceptado con observación: evidencia manual en IMP-014 |
| EN-02 — Seguridad e identidad | CA1 inyección SQL | Infeliz | En entorno aislado autorizado, enviar intento de inyección al endpoint de autenticación. | Bloqueo, log de auditoría y notificación al equipo de seguridad según criterio; consultas parametrizadas no prueban todo el flujo. | Prueba automatizada asociada aprobada (test_sessions.py, 6 pruebas, 30/10/2026); el escenario específico no se ejecutó manualmente | [pruebas relacionadas; caso por verificar, escenario no ejecutado](../../../src/backend/tests/test_sessions.py) | Aceptado con observación: evidencia manual en IMP-014 |
| EN-02 — Seguridad e identidad | Soporte: expiración/límite | Borde | Sesión al límite de 8 h; también probar intento 10 y 11 dentro de 15 min. | Expiración y limitación coherentes con código; documentar reloj y conteos sin exponer credenciales. | Prueba automatizada asociada aprobada (test_sessions.py, 6 pruebas, 30/10/2026); el escenario no se ejecutó manualmente | [pruebas relacionadas; caso por verificar, escenario no ejecutado](../../../src/backend/tests/test_sessions.py) | Aceptado con observación: evidencia manual en IMP-014 |
| EN-05 — Conductor y accesibilidad | CA1 primer uso | Principal | Conductor sin capacitación previa en móvil; ejecutar confirmación completa. | Completa sin errores; evidencia de criterios WCAG 2.1 AA aplicables, no solo ancho de pantalla. | Prueba automatizada asociada aprobada (driver.spec.ts, 3 pruebas, 30/10/2026); el escenario no se ejecutó manualmente | [pruebas de interfaz relacionadas; caso por verificar, escenario no ejecutado](../../../src/frontend/tests/ui/driver.spec.ts) | Aceptado con observación: evidencia manual en IMP-014 |
| EN-05 — Conductor y accesibilidad | CA1; modalidad propuesta | Feliz | Recorrer confirmación mediante teclado y lector de pantalla. | Foco, etiquetas, errores y confirmación accesibles según evaluación documentada. | Prueba automatizada asociada aprobada (driver.spec.ts, 3 pruebas, 30/10/2026); el escenario no se ejecutó manualmente | [pruebas de interfaz relacionadas; caso por verificar, escenario no ejecutado](../../../src/frontend/tests/ui/driver.spec.ts) | Aceptado con observación menor: completar revisión manual de accesibilidad |
| EN-05 — Conductor y accesibilidad | CA2 conexión intermitente | Infeliz | Cortar conexión 4G durante confirmación y restablecerla. | Reintento automático y estado de sincronización visible. | Prueba automatizada asociada aprobada (driver.spec.ts, 3 pruebas, 30/10/2026); el escenario no se ejecutó manualmente | [pruebas de interfaz relacionadas; caso por verificar, escenario no ejecutado](../../../src/frontend/tests/ui/driver.spec.ts) | Aceptado con observación: evidencia manual en IMP-014 |
| EN-05 — Conductor y accesibilidad | CA2; borde propuesto | Borde | Servidor confirma pero se pierde respuesta y el cliente reintenta. | No duplicar entrega ni cambiar primera hora; resolver conflicto D-04 antes de aceptación. | Prueba automatizada asociada aprobada (driver.spec.ts, 3 pruebas, 30/10/2026); el escenario no se ejecutó manualmente | [pruebas de interfaz relacionadas; caso por verificar, escenario no ejecutado](../../../src/frontend/tests/ui/driver.spec.ts) | Aceptado con observación: evidencia manual en IMP-014 |

### Evidencia técnica (29 y 30/10/2026)

La ejecución de pruebas registrada sobre `main` el 30/10/2026 a las 12:45 (hora de Lima) aprobó 432 pruebas Vitest, 9 de Node y 40 de navegador en interfaz web; en servidor aprobó 368 pruebas y 36 subpruebas, con 5 omitidas porque requerían PostgreSQL real. análisis de estilo, tipos y compilación terminaron sin errores. Esa ejecución precede a las correcciones de seguridad integradas el mismo día a las 14:17 y a los cambios de accesibilidad cuyo registro de cambio se creó a las 13:27; por ello no se presenta como una repetición de pruebas posterior a esos cambios.

En cobertura, la ejecución local registró 97 % de sentencias en servidor y 95,9 % de sentencias en interfaz web; otra medición local de Python registra 97,6 % de líneas y 90,2 % de ramas. El archivo `src/backend/coverage.xml` versionado es otro artefacto: registra 45,64 % (2.255/4.941 líneas), incluye paquetes de pruebas y no incluye cobertura de ramas; no permite reproducir las cifras locales anteriores. SonarQube Community Build informa 80,4 % del código completo y 93,5 % código nuevo o modificado; su captura del 30/10 no muestra rama ni registro de cambio, por lo que esas métricas no se atribuyen a la ejecución de `main` de las 12:45. La inspección manual de seguridad corresponde al estado de `main` observado el 30/10 a las 12:00; las correcciones de dependencias y SQL se integraron después, a las 14:17. Estas cifras no sustituyen la ejecución por escenario de la matriz ni la aceptación formal.

En una ejecución separada del solicitud de integración n.º 38, iniciada el 30/10/2026 a las 14:42, la comprobación Python de integración continua obtuvo 94,61 % en líneas y 93,09 % en ramas; también terminaron correctamente las pruebas, la compilación interfaz web y la auditoría complementaria. La base del PR ya incluía las correcciones de seguridad integradas a `main` a las 14:17. El único paso fallido fue SonarCloud, debido a la configuración simultánea de análisis automático y análisis de integración continua; por tanto, el ejecución no proporciona un control de calidad de SonarCloud posterior a las correcciones.

La rama de Mikeiel (`feature/mikeiel/spr3/rutas/optimizacion-co2`) ya está en `main` desde el 30/10: propuesta de rutas por inserción de menor costo con mejora 2-opt, huella de CO₂ por consumo de combustible, detalle de cada ruta en la interfaz y migración `002_consumo_por_km.sql`. Avanza US-005/EN-01 y el cálculo ambiental de US-010; no es un solucionador VRPTW exacto y no incluye aprobación ni despacho. Medición del 30/10 con datos sintéticos (10 corridas de 150 pedidos y 15 vehículos): mediana 3,5 s y máximo 6,6 s.

### Registro de la reunión y aceptación formal

| Campo | Registro |
|---|---|
| Fecha de la reunión | 11/11/2026: sesión breve de revisión con parte del equipo y el representante del cliente. No hubo reunión de revisión registrada antes de esa fecha; el 30/10/2026 es solo la fecha de actualización documental. |
| Asistentes / partes interesadas | Sesión del 11/11/2026: representante del cliente (DistriRápido S.A.C.) e por el equipo, Ore Campos, Josef Pablo (director del proyecto) y Cueva Ricse, Alex Roberto. Equipo del sprint: Ore Campos, Josef Pablo; Tovar Sánchez, Carlos Alberto; Rojas Camayo, Valentino Jhan Pierre; Rojas Peña, William Mikeiel; Cueva Ricse, Alex Roberto |
| Comentarios de las partes interesadas | Representante del cliente, 11/11/2026: «La documentación permite entender qué se desarrolló y presenta con bastante transparencia las limitaciones de las mediciones; sin embargo, me cuesta respaldar el cierre del Sprint 3 como “aceptado” mientras varios escenarios de US-010, US-011 y EN-05 figuran como no ejecutados, faltan la demostración manual y una fecha de reunión, y siguen pendientes revisiones por pares y validación independiente. Solicito que se aclare quién aceptó formalmente cada historia y con qué evidencia, y que IMP-012, IMP-013 e IMP-014 tengan responsables, fechas y condiciones de cierre confirmadas. También mantendría diferenciadas las métricas de SonarQube y las de CI: la ejecución de SonarCloud no produjo un Quality Gate, y la revisión OWASP señala advertencias pendientes aunque no confirme vulnerabilidades; por eso, antes de presentar la seguridad como validada, necesitamos el análisis posterior a las correcciones y completar las comprobaciones manuales. En accesibilidad, quisiera ver la evidencia de teclado y lector de pantalla que la evaluación reconoce como no realizada, además de la justificación verificable de la alternativa equivalente para los marcadores del mapa.» |
| Decisión por historia | El equipo acepta las historias del Sprint 3 con observaciones; el representante del cliente no respalda esa aceptación hasta atender sus observaciones (sección siguiente). Las condiciones de evidencia (revisión por pares, validación independiente y comprobaciones manuales) quedan registradas en IMP-012, IMP-013 e IMP-014, con seguimiento en el Sprint 4 |
| Acuerdos y responsables | Los de la tabla de acciones de la retrospectiva del sprint |
| Velocidad | 20 puntos comprometidos y provisionales. Se confirman en la planificación del Sprint 4 cuando se cierren IMP-012 e IMP-014; antes de eso no se suman a la serie histórica |

### Aceptación por historia y evidencia

| Historia | Quién aceptó formalmente | Evidencia disponible | Evidencia faltante para la aceptación del cliente |
|---|---|---|---|
| US-010 — Reporte de sostenibilidad | Ore Campos, Josef Pablo (director del proyecto), 11/11/2026, con observaciones | Código del endpoint; cobertura del código nuevo (SonarQube) y de CI | 4 escenarios de la matriz sin ejecutar; medición P95; revisión por par (n.º 19); validación en preproducción |
| US-011 — Exportar CSV | Ore Campos, Josef Pablo (director del proyecto), 11/11/2026, con observaciones | Código del endpoint; cobertura del código nuevo (SonarQube) y de CI | 4 escenarios sin ejecutar; revisión por par (n.º 19); validación en preproducción |
| EN-02 — Seguridad e identidad | Ore Campos, Josef Pablo (director del proyecto), 11/11/2026, con observaciones | `test_sessions.py` y `test_security_headers.py` aprobadas; documento 04 con correcciones del 11/11/2026 | Bloqueo, registro y notificación de inyección SQL; minimización de datos; nuevo análisis SonarQube; revisión complementaria |
| EN-05 — Conductor y accesibilidad | Ore Campos, Josef Pablo (director del proyecto), 11/11/2026, con observaciones | `driver.spec.ts` y `accesibilidad.spec.ts` aprobadas; axe-core y Lighthouse (documento 05) | Recorrido manual con teclado y lector de pantalla; escenario de conexión intermitente; revisión por par (n.º 16); validación en preproducción |

La aceptación del director del proyecto es con observaciones. El representante del cliente no la respalda todavía; la aceptación plena requiere la evidencia de la última columna.

### Respuesta a las observaciones del cliente

| Observación | Respuesta del equipo | Estado |
|---|---|---|
| Escenarios no ejecutados y falta de demostración manual | Se ejecutarán y registrarán los 16 escenarios con resultado observado y evidencia (IMP-014) | Pendiente |
| Falta fecha de reunión | Se registra la sesión del 11/11/2026 en este documento | Atendida |
| Revisión por pares y validación independiente | Revisión de las solicitudes n.º 16 y n.º 19 por un integrante distinto del autor, y validación en preproducción (IMP-012) | Pendiente |
| Quién aceptó cada historia y con qué evidencia | Tabla «Aceptación por historia y evidencia»: Ore Campos, Josef Pablo aceptó las cuatro historias con observaciones el 11/11/2026 | Atendida |
| IMP-012, IMP-013 e IMP-014 con responsables, fechas y condiciones de cierre | Tabla «Condiciones de cierre de los impedimentos», con responsable, fecha compromiso 11/11/2026 y condición de cierre | Atendida |
| Diferenciar métricas de SonarQube y de CI | La sección «Evidencia técnica» y el documento 04 las presentan por separado; SonarCloud no produjo control de calidad en la solicitud n.º 38 | Atendida |
| Análisis de seguridad posterior a las correcciones | Correcciones aplicadas el 11/11/2026 y verificadas con pruebas, Bandit, `pip-audit` y `npm audit`; falta el nuevo análisis SonarQube. La seguridad no se presenta como validada | Pendiente |
| Evidencia de teclado y lector de pantalla | Recorrido manual pendiente (documento 05, criterios 2.1.1 y 4.1.2); responsable: Cueva Ricse, Alex Roberto | Pendiente |
| Justificación de la alternativa equivalente de los marcadores del mapa | La prueba automatizada [`accesibilidad.spec.ts`](../../../src/frontend/tests/ui/accesibilidad.spec.ts) comprueba que cada pin tiene su equivalente en la lista de pedidos y camiones (documento 05, criterio 2.5.8); falta la comprobación manual | Parcial |

### Condiciones de cierre de los impedimentos

| Impedimento | Responsable | Fecha compromiso de cierre | Condición de cierre |
|---|---|---|---|
| IMP-012 — Revisión independiente | Ore Campos, Josef Pablo | 11/11/2026 | Solicitudes n.º 16 y n.º 19 con al menos una revisión aprobada de un integrante distinto del autor, y validación en preproducción registrada por quien no implementó |
| IMP-013 — Seguridad de EN-02 | Rojas Peña, William Mikeiel | 11/11/2026 | Bloqueo, registro y notificación de inyección SQL implementados y probados; minimización de datos revisada; nuevo análisis SonarQube con rama y commit identificados |
| IMP-014 — Evidencia de escenarios | Rojas Peña, William Mikeiel | 11/11/2026 | Los 16 escenarios de la matriz con resultado observado, evidencia y commit; medición P95 de US-010 |

Los responsables provienen de la tabla de acciones de la retrospectiva. La fecha es un compromiso: cada impedimento se marca cerrado solo cuando su condición se cumple y queda la evidencia enlazada; si no se cumple ese día, se reprograma con nueva fecha.

## Pendientes reales

| Pendiente | Historia o actividad | Responsable | Sprint de destino | Registro |
|---|---|---|---|---|
| Ejecutar y documentar los 16 escenarios de la matriz con resultado observado y evidencia | US-010, US-011, EN-02, EN-05 | Rojas Peña, William Mikeiel | Sprint 4 | IMP-014 |
| Revisión por par de las solicitudes de integración n.º 16 y n.º 19 (abiertas y sin revisiones al 11/11/2026) | US-010, US-011, EN-05 | Ore Campos, Josef Pablo | Sprint 4 | IMP-012 |
| Validación independiente en preproducción | US-010, US-011, EN-05 | Ore Campos, Josef Pablo | Sprint 4 | IMP-012 |
| Bloqueo, registro y notificación de inyección SQL; auditoría anonimizada; minimización de datos | EN-02 | Rojas Peña, William Mikeiel | Sprint 4 | IMP-013 |
| Recorrido manual con teclado y lector de pantalla | EN-05 | Cueva Ricse, Alex Roberto (desarrollador de EN-05; para contar como validación independiente, otro integrante debe repetir la comprobación, IMP-012) | Sprint 4 | Documento 05 |
| Nuevo análisis SonarQube tras las correcciones del 11/11/2026 | EN-02 | Tovar Sánchez, Carlos Alberto | Sprint 4 | Documento 04 |
| Decidir rechazo de repetición frente a idempotencia | EN-05 (US-004) | Equipo | Sprint 4 | D-04 |
| Conciliar roles del Gherkin con la matriz RBAC | US-010, US-011 | Equipo | Sprint 4 | D-10 |
| Mapa, dashboard y tráfico del PMV-3 | US-006 a US-009, EN-04 | Equipo | Sprint 4 | Planificación |
| Conciliar Jira con el backlog | Cierre del Sprint 3 | Ore Campos, Josef Pablo | Sprint 4 | IMP-015 |

Los responsables provienen de la tabla de acciones de la retrospectiva. La fecha es un compromiso: cada impedimento se marca cerrado solo cuando su condición se cumple y queda la evidencia enlazada; si no se cumple ese día, se reprograma con nueva fecha.

## Observaciones puntuales y acciones de mejora

- Completar y conservar la evidencia manual de los escenarios seleccionados, indicando registro de cambio, entorno, precondiciones y resultado.
- Mantener actualizadas las decisiones D-04 (rechazo de repetición frente a idempotencia) y D-10 (roles del Gherkin frente a matriz RBAC) en [decisiones](../../../development/decisiones.md).
- Cerrar el registro de revisión por pares y conservar la evidencia de validación independiente en entorno de preproducción. Estas actividades quedan como observaciones menores de mejora.
- Continuar la validación de migraciones y recuperación. La evolución del solucionador VRPTW, la aprobación y despacho de rutas, las fuentes GPS/ETA y los factores ambientales se mantienen en el registro de [impedimentos](../Sprint%202/02%20Registro%20de%20Impedimentos%20V_1_6_0.md).
- En seguridad, el reporte OWASP 2025 no registra vulnerabilidades confirmadas: A01, A07, A08 y A10 quedan sin hallazgos, y A02, A03, A04, A05, A06 y A09 con advertencias, con las correcciones de dependencias y SQL aplicadas el 30/10. El 11/11/2026 se corrigieron además la cookie `Secure` y las cabeceras de seguridad (A02) y se fijaron las dependencias de Python (A03); EN-02 queda para el Sprint 4.

Los documentos 03 Calidad de código, 04 OWASP y 05 WCAG de esta carpeta recogen las evaluaciones exigidas por la consigna del Sprint 3. El documento 04 evalúa las diez categorías OWASP 2025 con 0 vulnerabilidades confirmadas: 4 sin hallazgos, 2 corregidas y pendientes de re-escaneo (A02, A03) y 4 con advertencias (A04, A05, A06 y A09). SonarQube Community Build reporta 0 vulnerabilidades y 0 puntos de revisión de seguridad, con control de calidad aprobado; debido al aviso «Limited security analysis», el resultado se complementa con la inspección manual y las auditorías de dependencias. La accesibilidad se evaluó con axe-core y Lighthouse sobre páginas de prueba; la revisión manual con lector de pantalla queda como comprobación complementaria.

## Control de versiones del documento

| Versión | Fecha | Autoría / cambio |
|---|---|---|
| V_1_0_0 | 29/10/2026 | Tovar Sánchez, Carlos Alberto. Emisión inicial de la revisión sobre el estado de `main` disponible el 29/10/2026; su versión más reciente correspondía a un registro de cambio fechado el 16/10/2026. Plantilla oficial, definición de terminado por actividad y registro de la demostración pendiente. |
| V_1_1_0 | 29/10/2026 | Rojas Camayo, Valentino Jhan Pierre (solicitud de integración n.º 25). Actualización documental; pendiente de revisión del equipo. Matriz por criterio y cuatro rutas; resultados pendientes y separación entre verificación técnica y aceptación formal. |
| V_1_2_0 | 30/10/2026 | Tovar Sánchez, Carlos Alberto. Documento único vigente: se retira la carpeta Histórico y el documento 06 (los impedimentos IMP-012 a IMP-016 pasan al registro de impedimentos del Sprint 2), se mide la cobertura y se registra la rama de Mikeiel. |
| V_1_3_0 | 30/10/2026 | Tovar Sánchez, Carlos Alberto. Se actualiza el estado de seguridad con las correcciones implementadas y los resultados del reporte OWASP 2025: 8 categorías limpias y 2 bajo revisión. Esta cifra se sustituyó en V_1_6_0 por el resultado vigente: 4 sin hallazgos y 6 con advertencias. |
| V_1_4_0 | 30/10/2026 | Tovar Sánchez, Carlos Alberto. Se actualiza el cierre del Sprint 3 y se organizan las comprobaciones complementarias como acciones de seguimiento. |
| V_1_5_0 | 30/10/2026 | Tovar Sánchez, Carlos Alberto. Se establece el estado general del Sprint 3 como aceptado y se dejan observaciones puntuales no bloqueantes para seguimiento. |
| V_1_6_0 | 30/10/2026 | Tovar Sánchez, Carlos Alberto. Corrección de coherencia del cierre: el estado se alinea con el documento 04 (diez categorías evaluadas, 0 vulnerabilidades confirmadas, 4 sin hallazgos y 6 con advertencias), se precisa el alcance (PMV-3 frente a los 20 puntos comprometidos), la aceptación se registra como «con observaciones» y se vincula a IMP-012, IMP-013 e IMP-014, se ajustan las condiciones de la definición de terminado y se unifican las referencias de registro de cambio. Con aportes de Rojas Camayo, Valentino Jhan Pierre (mejora de los puntos propuestos). |
| V_1_7_0 | 11/11/2026 | Rojas Camayo, Valentino Jhan Pierre. Se alinea el estado con la definición de terminado (aceptación con observaciones, DoD incompleta y velocidad provisional), se añade la tabla de pendientes reales y el registro pendiente de fecha y comentarios de las partes interesadas, y se actualiza el estado de seguridad con las correcciones del 11/11/2026. Se registran la sesión de revisión del 11/11/2026 y los comentarios del representante del cliente, la aceptación por historia con su evidencia, la respuesta a cada observación y las condiciones de cierre de IMP-012, IMP-013 e IMP-014. Se registran los asistentes del equipo a la sesión, la aceptación con observaciones del director del proyecto por historia, la fecha compromiso 11/11/2026 de los impedimentos y el responsable del recorrido de accesibilidad. |

[← Volver al índice correspondiente](README.md)
