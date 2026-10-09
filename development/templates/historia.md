# US/EN/T-XXX — título de la tarea

## Preparación

| Campo | Valor |
|---|---|
| Fuente / RF / RNF / RN / épica | |
| Sprint / PMV / prioridad | |
| Responsable / revisor | |
| Puntos originales / estimación restante | |
| Rama / base / PR | |
| Dependencias / decisiones D-XX | |
| Estado / impedimento | To Do |

Como ___, quiero ___ para ___. Para un enabler: problema técnico y resultado verificable.

## Criterios de aceptación

```gherkin
Escenario: Flujo principal
  Dado un contexto y datos concretos
  Cuando se ejecuta la acción
  Entonces se observa un resultado verificable

Escenario: Caso alternativo válido
  Dado un contexto alternativo
  Cuando se ejecuta la acción
  Entonces se conserva el comportamiento esperado

Escenario: Error o permiso insuficiente
  Dado un contexto inválido o un actor sin autorización
  Cuando se intenta la acción
  Entonces se informa el error sin mutaciones inconsistentes
```

## Implementación

- [ ] Dominio/reglas y estados definidos.
- [ ] Caso de uso y puertos/DTO acordados; adaptadores externos aislados.
- [ ] Persistencia/migración y autorización por rol/objeto, si aplica.
- [ ] UI con diseño compartido, estados vacíos/error/carga y datos demo explícitos.
- [ ] Contratos y configuración documentados; dependencias desbloqueadas.

## Validación y entrega

| Criterio | Prueba / comando | Datos / ambiente | Resultado | Commit / evidencia |
|---|---|---|---|---|
| | | | | |

- [ ] DoD de Planificación comprobada; cobertura, análisis estático, revisión y staging enlazados.
- [ ] Casos de integración/concurrencia/red aplicables verificados.
- [ ] PR aprobado e integrado en el destino correcto.

Limitaciones y trabajo restante: ___. Evaluador y fecha de aceptación: ___. Un resultado en memoria no acredita un criterio de persistencia real.
