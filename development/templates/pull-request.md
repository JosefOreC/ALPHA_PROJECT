# Descripción de PR

Copiar el contenido relevante al cuerpo del PR. La plantilla es manual; no está instalada como plantilla automática de GitHub.

## Problema y comportamiento resultante

Describir el caso que motivó el cambio y el resultado observable. Identificar US/EN/T, RF/RNF/RN y PMV/sprint.

## Alcance y contratos

Rama origen → destino: ___. Commit base: ___.

Indicar cambios de dominio, API/DTO, persistencia/migración, permisos y UI que afectan a otros módulos. Decisiones D-XX: ___. Origen de datos y modo real/demo: ___.

## Validación

| Criterio | Comando / prueba | Entorno / datos | Resultado / evidencia |
|---|---|---|---|
| | | | |

Cobertura y alcance: ___. Análisis estático: ___. Demo/staging, commit y evaluador distinto del implementador: ___. Pendientes y pruebas omitidas: ___.

## Revisión e integración

- [ ] Destino corresponde a `sprint/sprN` o al PR de cierre hacia main.
- [ ] Criterios de aceptación y DoD comprobados; puertos/adaptadores conservados.
- [ ] Conflictos resueltos y pruebas afectadas repetidas.
- [ ] Documentación/backlog/estado actual actualizados según alcance.
- [ ] Migración y recuperación descritas, si aplican; sin secretos ni datos personales en evidencia.

Revisor técnico: ___. Plan de recuperación y limitaciones materiales: ___.
