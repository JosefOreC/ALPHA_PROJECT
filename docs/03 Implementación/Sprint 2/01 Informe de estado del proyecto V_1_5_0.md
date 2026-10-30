# Informe de estado del proyecto — Sprint 2

**Proyecto:** EcoLogística Lima — DistriRápido S.A.C.

**Versión del documento:** V_1_5_0

**Actualización documental:** 29/10/2026. No es fecha de reunión ni de aceptación.

**Periodo del informe original:** 05/10/2026 - 09/10/2026 (corte parcial del Sprint 2). Esta actualización no cambia el calendario ni declara nuevos acuerdos.

### Estado del proyecto

| Variable | Estado documental actual |
|---|---|
| Alcance | Implementación parcial; aceptación de todas las historias pendiente de evidencia por criterio y decisión formal. |
| Cronograma | Fechas y asignación a sprints por conciliar con Jira; no deducir sprint por nombre de rama ni por versión documental. |
| Costos | No se verificaron gastos; se conserva el presupuesto y el registro histórico, sin nuevas cifras. |
| Calidad | Ejecución del 29/10/2026 sobre `main` (commit `30969da`): backend con 225 pruebas aprobadas, 5 omitidas (PostgreSQL real) y 36 subpruebas; frontend con 273 pruebas Vitest, 9 de Node y 40 de navegador; lint, tipos y compilación sin errores. Cobertura medida el 30/10: backend 82 % y frontend 80 % de sentencias. Rendimiento, seguridad y accesibilidad requieren evidencia específica (ver Sprint 03, documentos 03 a 05). |

### Historias de Usuario y alcance

US-001, US-002, US-003, US-004, US-005, US-006, US-007, US-008, US-009, US-010, US-011, EN-00, EN-01, EN-02, EN-05. La [revisión vigente](03%20Revisi%C3%B3n%20del%20Sprint%20V_1_4_0.md) delimita qué fue planificado, adicional o continuidad y contiene criterios y cuatro rutas por historia/enabler. No se cuentan puntos completados.

La composición común, sesiones PostgreSQL, permisos y endpoints de portal existen en el árbol local. El motor VRPTW no está implementado en los archivos reservados y la propuesta estimada no demuestra el criterio de US-005. La rama `feature/mikeiel/spr3/rutas/optimizacion-co2` (sin Pull Request al 30/10/2026) agrega una heurística de inserción de menor costo con mejora 2-opt y el cálculo de CO₂ por consumo de combustible; no es un motor VRPTW y no está en `main`. Datos sintéticos no acreditan GPS/ETA, factores reales ni línea base.

### Demostración del trabajo realizado

Guion pendiente de ejecución: usar la matriz de la [revisión](03%20Revisi%C3%B3n%20del%20Sprint%20V_1_4_0.md) y los procedimientos de las [guías](../Gu%C3%ADas%20t%C3%A9cnicas/README.md). Los resultados y capturas previos se conservan en sus fuentes; no se atribuyen a una nueva demo.

### Riesgos

Rendimiento (RSK-01), fuentes externas (RSK-02/03), validación de usuarios (RSK-04), seguridad (RSK-05) y cobertura (RSK-09) se siguen en el [registro de riesgos](../../02%20Planificaci%C3%B3n/03%20Registro%20de%20riesgos%20V_1_0_0.md). Los bloqueos concretos, su impacto y desbloqueo están en [impedimentos](02%20Registro%20de%20Impedimentos%20V_1_5_0.md).

### Próximos avances

- Ejecutar escenarios con evidencia por commit y registrar aceptación formal por historia.
- Validar migraciones, reinicio, recuperación, concurrencia y seguridad donde corresponda.
- Conciliar D-04, D-10 y la continuidad Sprint 2/3; acordar responsables y fechas de las acciones preventivas.
- Completar motor/despacho y fuentes operativas sin confundir su implementación con validación.

### Notas

Las cifras de pruebas, decisiones, ramas y PR del informe anterior son antecedentes atribuidos a su autor; no se verificaron otra vez ni se consultó su estado remoto. La [retrospectiva](04%20Retrospectiva%20del%20Sprint%20V_2_2_0.md) propone prevención de los problemas registrados.


## Control de versiones del documento

| Versión | Fecha | Autoría / cambio |
|---|---|---|
| V_1_0_0 | 09/10/2026 | Tovar Sánchez, Carlos Alberto. Informe de estado del Sprint 2 con el estado real de cada historia, la evidencia de pruebas del 09/10 y los riesgos del periodo. |
| V_1_1_0 | 09/10/2026 | Tovar Sánchez, Carlos Alberto. Se actualizan los enlaces tras unificar la revisión y la retrospectiva del Sprint 2 con las de la rama `feature/josef/spr2/auth`. |
| V_1_2_0 | 09/10/2026 | Tovar Sánchez, Carlos Alberto. Se actualiza el enlace a la auditoría de coherencia tras corregir los documentos del Sprint 1. |
| V_1_3_0 | 29/10/2026 | Tovar Sánchez, Carlos Alberto. Corrige afirmaciones que `main` ya contradecía: la autenticación, la persistencia en PostgreSQL y la API única están integradas; las ramas de Josef están en `main` sin Pull Request; se reemplazan las cifras de pruebas por las del 29/10 sobre `30969da` y se actualizan el estado de cada historia, los riesgos, la demostración y los próximos avances. |
| V_1_4_0 | 29/10/2026 | Rojas Camayo, Valentino Jhan Pierre (PR #25). Actualización documental; pendiente de revisión del equipo. Síntesis coherente con revisión, impedimentos y retrospectiva; detalle histórico y cifras conservados en archivo. |
| V_1_5_0 | 30/10/2026 | Tovar Sánchez, Carlos Alberto. Documento único vigente: se retira la carpeta Histórico y se actualizan calidad (ejecución del 29/10 sobre `main`) y alcance (rama de Mikeiel sin PR). |


[← Volver al índice correspondiente](README.md)
