# Informe de estado del proyecto — Sprint 2

**Proyecto:** EcoLogística Lima — DistriRápido S.A.C.

**Versión del documento:** V_1_4_0

**Actualización documental:** 29/10/2026. No es fecha de reunión ni de aceptación.

**Periodo y autoría del informe original:** se conservan en [informe histórico](Hist%C3%B3rico/01%20Informe%20de%20estado%20del%20proyecto%20V_1_3_0.md). Esta actualización no cambia el calendario ni declara nuevos acuerdos.

### Estado del proyecto

| Variable | Estado documental actual |
|---|---|
| Alcance | Implementación parcial; aceptación de todas las historias pendiente de evidencia por criterio y decisión formal. |
| Cronograma | Fechas y asignación a sprints por conciliar con Jira; no deducir sprint por nombre de rama ni por versión documental. |
| Costos | No se verificaron gastos; se conserva el presupuesto y el registro histórico, sin nuevas cifras. |
| Calidad | Código y tests inspeccionables; ninguna suite de aplicación ejecutada en esta edición. Cobertura, rendimiento, seguridad y accesibilidad requieren evidencia específica. |

### Historias de Usuario y alcance

US-001, US-002, US-003, US-004, US-005, US-006, US-007, US-008, US-009, US-010, US-011, EN-00, EN-01, EN-02, EN-05. La [revisión vigente](03%20Revisi%C3%B3n%20del%20Sprint%20V_1_3_0.md) delimita qué fue planificado, adicional o continuidad y contiene criterios y cuatro rutas por historia/enabler. No se cuentan puntos completados.

La composición común, sesiones PostgreSQL, permisos y endpoints de portal existen en el árbol local. El motor VRPTW no está implementado en los archivos reservados y la propuesta estimada no demuestra el criterio de US-005. Datos sintéticos no acreditan GPS/ETA, factores reales ni línea base.

### Demostración del trabajo realizado

Guion pendiente de ejecución: usar la matriz de la [revisión](03%20Revisi%C3%B3n%20del%20Sprint%20V_1_3_0.md) y los procedimientos de las [guías](../Gu%C3%ADas%20t%C3%A9cnicas/README.md). Los resultados y capturas previos se conservan en sus fuentes; no se atribuyen a una nueva demo.

### Riesgos

Rendimiento (RSK-01), fuentes externas (RSK-02/03), validación de usuarios (RSK-04), seguridad (RSK-05) y cobertura (RSK-09) se siguen en el [registro de riesgos](../../02%20Planificaci%C3%B3n/03%20Registro%20de%20riesgos%20V_1_0_0.md). Los bloqueos concretos, su impacto y desbloqueo están en [impedimentos](02%20Registro%20de%20Impedimentos%20V_1_4_0.md).

### Próximos avances

- Ejecutar escenarios con evidencia por commit y registrar aceptación formal por historia.
- Validar migraciones, reinicio, recuperación, concurrencia y seguridad donde corresponda.
- Conciliar D-04, D-10 y la continuidad Sprint 2/3; acordar responsables y fechas de las acciones preventivas.
- Completar motor/despacho y fuentes operativas sin confundir su implementación con validación.

### Notas

Las cifras de pruebas, decisiones, ramas y PR del informe anterior son antecedentes atribuidos a su autor; no se verificaron otra vez ni se consultó su estado remoto. La [retrospectiva](04%20Retrospectiva%20del%20Sprint%20V_2_1_0.md) propone prevención de los problemas registrados.

## Control de versiones del documento

| Versión | Fecha | Autoría / cambio |
|---|---|---|
| V_1_3_0 y antecedentes | Fechas en la fuente | Autoría y registro completos en [fuente histórica](Hist%C3%B3rico/01%20Informe%20de%20estado%20del%20proyecto%20V_1_3_0.md). |
| V_1_4_0 | 29/10/2026 | Actualización documental; pendiente de revisión del equipo. Síntesis coherente con revisión, impedimentos y retrospectiva; detalle histórico y cifras conservados en archivo. |


[← Volver al índice correspondiente](README.md)
