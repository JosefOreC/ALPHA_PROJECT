# Informe de estado del proyecto — Sprint 2

**Proyecto:** EcoLogística Lima — DistriRápido S.A.C.

**Versión del documento:** V_1_5_0

**Actualización documental:** 30/10/2026. No es fecha de reunión ni de aceptación.

**Periodo del informe original:** 05/10/2026 - 09/10/2026 (corte parcial del Sprint 2). Esta actualización no cambia el calendario ni declara nuevos acuerdos.

### Estado del proyecto

| Variable | Estado documental actual |
|---|---|
| Alcance | Implementación parcial; aceptación de todas las historias pendiente de evidencia por criterio y decisión formal. |
| Cronograma | Fechas y asignación a sprints por conciliar con Jira; no deducir sprint por nombre de rama ni por versión documental. |
| Costos | No se verificaron gastos; se conserva el presupuesto y el registro histórico, sin nuevas cifras. |
| Calidad | Ejecución registrada sobre `main` el 30/10/2026 a las 12:45 (hora de Lima): servidor con 368 pruebas aprobadas, 5 omitidas (PostgreSQL real) y 36 subpruebas; interfaz web con 432 pruebas Vitest, 9 de Node y 40 de navegador; análisis de estilo, tipos y compilación sin errores. La cobertura local reportada fue 97 % de sentencias en servidor y 95,9 % de sentencias en interfaz web; son mediciones de pruebas locales, distintas de código completo/código nuevo o modificado de SonarQube. Esta ejecución precede a los cambios de seguridad integrados ese día a las 14:17. Rendimiento, seguridad y accesibilidad se detallan en los documentos 03 a 05 del Sprint 03; allí se aclara que el XML versionado no respalda estos porcentajes locales. |

### Historias de Usuario y alcance

US-001, US-002, US-003, US-004, US-005, US-006, US-007, US-008, US-009, US-010, US-011, EN-00, EN-01, EN-02, EN-05. La [revisión vigente](03%20Revisi%C3%B3n%20del%20Sprint%20V_1_4_0.md) delimita qué fue planificado, adicional o continuidad y contiene criterios y cuatro rutas por historia/enabler. No se cuentan puntos completados.

La composición común, sesiones PostgreSQL, permisos y endpoints de portal existen en el árbol local. La planificación de rutas está implementada como heurística en `domain/planning.py` (inserción de menor costo con mejora 2-opt, capacidad, ventanas y objetivo de CO₂, tiempo o mixto), incorporada a `main` el 30/10/2026 desde la rama de Mikeiel. No es un solucionador VRPTW exacto (OR-Tools) ni incluye aprobación, publicación o despacho de rutas; los archivos `generate_routes.py`, `reoptimize_route.py` y `route.py` siguen vacíos. Medición del 30/10 con datos sintéticos (10 corridas de 150 pedidos y 15 vehículos): mediana 3,5 s y máximo 6,6 s, por debajo de 45 s. Datos sintéticos no acreditan GPS/ETA, factores reales ni línea base.

### Demostración del trabajo realizado

Guion pendiente de ejecución: usar la matriz de la [revisión](03%20Revisi%C3%B3n%20del%20Sprint%20V_1_4_0.md) y los procedimientos de las [guías](../Gu%C3%ADas%20t%C3%A9cnicas/README.md). Los resultados y capturas previos se conservan en sus fuentes; no se atribuyen a una nueva demo.

### Riesgos

Rendimiento (RSK-01), fuentes externas (RSK-02/03), validación de usuarios (RSK-04), seguridad (RSK-05) y cobertura (RSK-09) se siguen en el [registro de riesgos](../../02%20Planificaci%C3%B3n/03%20Registro%20de%20riesgos%20V_1_0_0.md). Los bloqueos concretos, su impacto y desbloqueo están en [impedimentos](02%20Registro%20de%20Impedimentos%20V_1_6_0.md).

### Próximos avances

- Ejecutar escenarios con evidencia por registro de cambio y registrar aceptación formal por historia.
- Validar migraciones, reinicio, recuperación, concurrencia y seguridad donde corresponda.
- Conciliar D-04, D-10 y la continuidad Sprint 2/3; acordar responsables y fechas de las acciones preventivas.
- Completar motor/despacho y fuentes operativas sin confundir su implementación con validación.

### Notas

Las cifras de pruebas, decisiones, ramas y solicitudes de integración del informe anterior son antecedentes atribuidos a su autor; no se verificaron otra vez ni se consultó su estado remoto. La [retrospectiva](04%20Retrospectiva%20del%20Sprint%20V_2_2_0.md) propone prevención de los problemas registrados.


## Control de versiones del documento

| Versión | Fecha | Autoría / cambio |
|---|---|---|
| V_1_0_0 | 09/10/2026 | Tovar Sánchez, Carlos Alberto. Informe de estado del Sprint 2 con el estado real de cada historia, la evidencia de pruebas del 09/10 y los riesgos del periodo. |
| V_1_1_0 | 09/10/2026 | Tovar Sánchez, Carlos Alberto. Se actualizan los enlaces tras unificar la revisión y la retrospectiva del Sprint 2 con las de la rama `feature/josef/spr2/auth`. |
| V_1_2_0 | 09/10/2026 | Tovar Sánchez, Carlos Alberto. Se actualiza el enlace a la auditoría de coherencia tras corregir los documentos del Sprint 1. |
| V_1_3_0 | 29/10/2026 | Tovar Sánchez, Carlos Alberto. Corrige afirmaciones que `main` ya contradecía: la autenticación, la persistencia en PostgreSQL y la API única están integradas; las ramas de Josef están en `main` sin solicitud de integración; se reemplazan las cifras de pruebas por las de la ejecución del 29/10 sobre el estado de `main` disponible ese día (puntero de la rama fechado el 16/10) y se actualizan el estado de cada historia, los riesgos, la demostración y los próximos avances. |
| V_1_4_0 | 29/10/2026 | Rojas Camayo, Valentino Jhan Pierre (solicitud de integración n.º 25). Actualización documental; pendiente de revisión del equipo. Síntesis coherente con revisión, impedimentos y retrospectiva; detalle histórico y cifras conservados en archivo. |
| V_1_5_0 | 30/10/2026 | Tovar Sánchez, Carlos Alberto. Documento único vigente: se retira la carpeta Histórico y se actualizan calidad (ejecución sobre `main` el 30/10 a las 12:45, hora de Lima) y alcance (rama de Mikeiel sin solicitud de integración). |


[← Volver al índice correspondiente](README.md)
