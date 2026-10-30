# Evaluación de Calidad de Código — SonarQube

**Nombre del Proyecto:** EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Fecha de Análisis:** 2026-10-30

**Versión del Análisis:** V_1_0_0

**Versión del documento:** V_1_0_0

**Commit evaluado (mediciones locales):** `main`, `29ca820` (30/10/2026).

> **Alcance del análisis.** El equipo analiza el proyecto con **SonarQube Community Build** (proyecto `EcoLogistica`, versión 1.0), con la configuración `sonar-project.properties` de la rama de Alex (fuentes de backend y frontend, pruebas y rutas de cobertura `src/backend/coverage.xml` y `src/frontend/coverage/lcov.info`; aún sin integrar a `main`). Además, **SonarQube Cloud** analiza el repositorio de GitHub (proyecto `JosefOreC / ALPHA_PROJECT`) con su alcance por defecto. Los datos principales de este documento son los de Community Build; los de Cloud se registran como evidencia complementaria. En la captura de Community Build no se ven la rama ni el commit analizados. Lo medido localmente el 30/10 (cobertura, lint, tipos, auditoría de dependencias) se registra con su comando. No existe integración continua (`.github/`).

## 1. Resumen Ejecutivo de Quality Gate

- **Estado del Quality Gate:** **PASSED** (SonarQube Community Build, proyecto `EcoLogistica`, versión 1.0, 30/10/2026). El análisis tiene advertencias («The last analysis has warnings») cuyo detalle falta registrar. En SonarQube Cloud (rama `main`, commit `d36441f`) el Quality Gate también es Passed, aunque con incidencias abiertas (ver evidencia complementaria).
- **Porcentaje de Cobertura de Pruebas (Coverage):** **77,9 %** según SonarQube Community Build, sobre 4,3 mil líneas por cubrir; queda **por debajo del 80 %** que exige la Definition of Done. Mediciones locales del 30/10 con otra métrica: backend 82 % de sentencias (`pytest-cov` sobre `application`, `domain`, `infrastructure` e `interfaces`; 225 pruebas aprobadas) y frontend 80,0 % de sentencias, 72,5 % de ramas, 80,6 % de funciones y 85,8 % de líneas (`vitest --coverage`, V8; 273 pruebas aprobadas). Es cobertura global del código, no del código nuevo del sprint. SonarQube Cloud no recibe cobertura.
- **Duplicación de Código:** **0,1 %** sobre 13 mil líneas (SonarQube Community Build). SonarQube Cloud reporta 0,3 % sobre 24 mil líneas.

Otros indicadores locales (30/10/2026): `oxlint` sin advertencias, `tsc -b` sin errores, compilación de producción completada; backend con 225 pruebas aprobadas, 5 omitidas (integración con PostgreSQL real) y 36 subpruebas.

## 2. Métricas Principales

| Categoría | Cantidad Detectada | Severidad (Bloqueante / Alta / Media / Baja) |
|---|---|---|
| Bugs | **0** abiertos (calificación de fiabilidad **A**) | Sin incidencias; no aplica severidad |
| Vulnerabilidades | **0** abiertas (calificación de seguridad **A**). Auditoría de dependencias aparte: `npm audit` 2 altas, `pip-audit` 0 (ver sección 3) | Sin incidencias en SonarQube; las 2 altas de `npm audit` son de dependencias de desarrollo |
| Code Smells | **0** abiertos (calificación de mantenibilidad **A**). Observación manual: 3 archivos de backend vacíos (`generate_routes.py`, `reoptimize_route.py`, `route.py`) | Sin incidencias; no aplica severidad |
| Security Hotspots | **0** (calificación **A**). Candidatos por inspección manual en [04 OWASP](04%20OWASP%20V_1_1_0.md) | Sin hotspots reportados |

## 3. Plan de Remediación y Deuda Técnica

- **Deuda Técnica Estimada:** 0 min en Community Build (sin incidencias de mantenibilidad; calificación A); el valor exacto de la medida *Technical Debt* está por registrar de *Measures*.
- **Principales hallazgos y acciones correctivas:**
  0. **Cobertura de SonarQube en 77,9 %, bajo el 80 % de la DoD.** Acción: agregar pruebas a las ramas de error de los adaptadores y a las vistas de administración hasta superar el 80 % y enviar la cobertura a SonarQube en cada Pull Request. **No aplicada.**
  0b. **Advertencias del análisis** («The last analysis has warnings»). Acción: abrir *See details*, registrar cada advertencia y su tratamiento. **Por registrar.**
  0c. **Discrepancia entre analizadores:** Community Build reporta 0 incidencias, y SonarQube Cloud (alcance por defecto, 21 mil líneas de código) reporta 8 de seguridad, 26 de fiabilidad y 10 de mantenibilidad abiertas. Es probable que se deba al distinto alcance de archivos (la configuración de Alex acota las fuentes y excluye pruebas), pero no está verificado. Acción: revisar las incidencias de Cloud y decidir si corresponden a código del proyecto. **No aplicada.**
  1. **Vite 8.3.0 – 8.3.2 con vulnerabilidad alta** (dependencia directa de desarrollo; `launch-editor` con escape incompleto de argumentos en Windows). Corrección disponible: actualizar `vite` a una versión posterior a 8.3.2 con `npm audit fix` y volver a correr las pruebas. **No aplicada** en esta fecha.
  2. **`undici` 8.0.0 – 8.12.1 con vulnerabilidad alta** (transitiva; denegación de servicio por memoria no acotada en el analizador de `EventSource`). Se corrige junto con el punto anterior. **No aplicada.**
  3. **Cobertura de ramas del frontend en 72,5 %** y sentencias en 80,0 %, justo en el umbral de la Definition of Done (≥ 80 % del código nuevo). Acción: agregar pruebas a las ramas de error de los adaptadores HTTP y a las vistas de administración; medir la cobertura por archivo modificado en cada Pull Request.
  4. **Tres archivos de backend vacíos** (`generate_routes.py`, `reoptimize_route.py` y `route.py`) y duplicidad entre el módulo de planificación estimada y el caso de uso previsto. Acción: eliminarlos o implementarlos al construir el motor de rutas (EN-01).
  5. **Análisis estático sin integración continua.** La configuración de SonarQube existe en la rama de Alex. Acción: integrarla a `main` mediante Pull Request, generar la cobertura de backend con `pytest --cov --cov-report=xml` (archivo `src/backend/coverage.xml`) y la de frontend con `vitest --coverage` (`lcov`), y agregar un flujo de CI que ejecute el escaneo con el Quality Gate como requisito de merge.

**Para completar este documento:** registrar la rama, el commit y la hora del análisis de Community Build; el detalle de sus advertencias; la deuda técnica de *Measures*; y, si se corrigen las incidencias de Cloud, el nuevo análisis que lo comprueba. Subir la cobertura a SonarQube y a 80 % o más.

**Comandos usados en esta evaluación (desde `src/backend` y `src/frontend`):**

```powershell
# Backend
.venv\Scripts\python.exe -m pytest -q --cov=application --cov=domain --cov=infrastructure --cov=interfaces --cov-report=term
.venv\Scripts\python.exe -m pip_audit -r requirements.txt
# Frontend
npx vitest run --coverage --coverage.reporter=text-summary
npx oxlint ; npx tsc -b ; npm audit
```

## Evidencia de SonarQube

### SonarQube Community Build (análisis del equipo)

Captura del resumen del proyecto `EcoLogistica` (versión 1.0, «Overall Code»; último análisis 30/10/2026):

![Resumen del proyecto EcoLogistica en SonarQube Community Build](evidencias-sonar/sonarqube-community-ecologistica-resumen.jpg)

| Indicador | Valor en la captura |
|---|---|
| Quality Gate | Passed (con advertencias en el último análisis) |
| Líneas de código | 11 mil (13 mil líneas en total) |
| Security / Reliability / Maintainability | 0 / 0 / 0 incidencias abiertas · calificación A en las tres |
| Accepted issues | 0 |
| Cobertura | 77,9 % sobre 4,3 mil líneas por cubrir |
| Duplicaciones | 0,1 % sobre 13 mil líneas |
| Security Hotspots | 0 · calificación A |


### SonarQube Cloud — rama `main` (evidencia complementaria)

Captura del resumen de la rama `main` en SonarQube Cloud (pestaña *Overall Code*, commit `d36441f`, 30/10/2026):

![Resumen de la rama main en SonarQube Cloud](evidencias-sonar/sonarqube-cloud-main-resumen.png)

| Indicador | Valor en la captura |
|---|---|
| Quality Gate | Passed |
| Líneas de código | 21 mil (24 mil líneas en total) |
| Security | 8 incidencias abiertas · calificación D |
| Reliability | 26 incidencias abiertas · calificación E |
| Maintainability | 10 incidencias abiertas · calificación A |
| Accepted issues | 0 |
| Cobertura | No configurada en SonarQube Cloud |
| Duplicaciones | 0,3 % (sin condiciones en el Quality Gate; 24 mil líneas) |
| Advertencias del análisis | 2 (detalle por registrar) |

Ese análisis usa el alcance por defecto de SonarQube Cloud (21 mil líneas de código) y no el de `sonar-project.properties`; por eso sus cifras difieren de las de Community Build. El resumen no desglosa las incidencias por severidad ni por regla.

### SonarQube Cloud — Pull Request #26

Captura del resumen del Pull Request #26 en SonarQube Cloud (proyecto `JosefOreC / ALPHA_PROJECT`, rama `feature/carlos/spr3/docs-sprints` hacia `main`, análisis del commit `54135e26`, 30/10/2026):

![Resumen del PR #26 en SonarQube Cloud](evidencias-sonar/sonarqube-cloud-pr26-resumen.png)

| Indicador | Valor en la captura |
|---|---|
| Quality Gate | Passed |
| Líneas nuevas de código | 0 |
| New Issues / Accepted Issues | 0 / 0 |
| Security Hotspots | 0 |
| Duplicaciones en código nuevo | Sin dato; **0,3 %** estimado tras el merge |
| Cobertura | No configurada en SonarQube Cloud («A few extra steps are needed to analyze your code coverage») |

**Límites de esta evidencia.** Es un análisis de Pull Request con cero líneas nuevas, así que no sustituye al análisis del código completo. La cobertura no llega a SonarQube todavía: los informes `coverage.xml` y `lcov.info` que configura `sonar-project.properties` no se envían, por lo que las cifras de cobertura de este documento son las medidas localmente. Para completar el documento se necesitan las pantallas del análisis de la rama `main` (ver «Para completar este documento»).

## Control de versiones del documento

| Versión | Fecha | Autoría / cambio |
|---|---|---|
| V_1_0_0 | 30/10/2026 | Tovar Sánchez, Carlos Alberto. Emisión inicial con la plantilla oficial: cobertura, lint y auditoría de dependencias medidos localmente y resultados de SonarQube Community Build (Quality Gate, cobertura 77,9 %, duplicación 0,1 % y 0 incidencias) y evidencia complementaria de SonarQube Cloud. |

[← Volver al índice correspondiente](README.md)
