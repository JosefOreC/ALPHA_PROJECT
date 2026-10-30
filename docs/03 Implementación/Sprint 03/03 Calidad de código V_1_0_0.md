# Evaluación de Calidad de Código — SonarQube

**Nombre del Proyecto:** EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Fecha de Análisis:** 2026-10-30

**Versión del Análisis:** V_1_0_0

**Versión del documento:** V_1_0_0

**Commit evaluado (mediciones locales):** `main`, `29ca820` (30/10/2026).

> **Alcance real del análisis.** El equipo ejecuta SonarQube Cloud (proyecto `JosefOreC / ALPHA_PROJECT`) y compartió capturas; la configuración del escaneo (`sonar-project.properties`, clave `ecologistica`, con las fuentes de backend y frontend, las pruebas y las rutas de cobertura `src/backend/coverage.xml` y `src/frontend/coverage/lcov.info`) y la cobertura de Vitest (proveedor V8, `lcov`) están en la rama de Alex (`feature/alex/spr1/m_conductor/crud`), aún sin integrar a `main`. Los resultados de SonarQube (Quality Gate, duplicación, bugs, code smells y Security Hotspots) **no están en el repositorio y no pude leerlos**: sus campos figuran «Por incorporar» hasta registrar las capturas, y no se estiman. Lo que sí medí el 30/10 con herramientas locales (cobertura, lint, tipos, auditoría de dependencias) se registra con su comando y su resultado. No existe integración continua (`.github/`).

## 1. Resumen Ejecutivo de Quality Gate

- **Estado del Quality Gate:** **PASSED** en SonarQube Cloud para la rama `main` (commit `d36441f`, análisis del 30/10/2026). El Quality Gate por defecto evalúa el código nuevo: no significa que el código existente esté libre de incidencias (ver sección 2: 8 de seguridad, 26 de fiabilidad y 10 de mantenibilidad). El análisis tiene además 2 advertencias («analysis warnings») cuyo detalle falta registrar.
- **Porcentaje de Cobertura de Pruebas (Coverage):** backend **82 %** de sentencias (`pytest-cov` sobre `application`, `domain`, `infrastructure` e `interfaces`; 225 pruebas aprobadas) y frontend **80,0 %** de sentencias, 72,5 % de ramas, 80,6 % de funciones y 85,8 % de líneas (`vitest --coverage`, proveedor V8; 273 pruebas aprobadas). Es cobertura global del código, no del código nuevo del sprint, y proviene de herramientas locales: **SonarQube Cloud no recibe cobertura** («A few extra steps are needed to analyze your code coverage»), pues los informes `coverage.xml` y `lcov.info` no se envían.
- **Duplicación de Código:** **0,3 %** sobre 24 mil líneas (SonarQube Cloud, `main`, commit `d36441f`), sin condiciones definidas en el Quality Gate.

Otros indicadores locales (30/10/2026): `oxlint` sin advertencias, `tsc -b` sin errores, compilación de producción completada; backend con 225 pruebas aprobadas, 5 omitidas (integración con PostgreSQL real) y 36 subpruebas.

## 2. Métricas Principales

| Categoría | Cantidad Detectada | Severidad (Bloqueante / Alta / Media / Baja) |
|---|---|---|
| Bugs (Reliability) | **26** incidencias abiertas, calificación **E** (SonarQube Cloud, `main`) | E: la peor calificación; desglose por severidad por incorporar de la página *Issues* |
| Vulnerabilidades (Security) | **8** incidencias abiertas, calificación **D** (SonarQube Cloud, `main`). Auditoría de dependencias: `npm audit` 2 altas, `pip-audit` 0 (ver sección 3) | D; desglose por severidad por incorporar de la página *Issues* |
| Code Smells (Maintainability) | **10** incidencias abiertas, calificación **A** (SonarQube Cloud, `main`). Observación manual: 3 archivos de backend vacíos (`generate_routes.py`, `reoptimize_route.py`, `route.py`) | A; desglose por severidad por incorporar |
| Security Hotspots | No se muestran en el resumen (la sección «Security hotspots» figura como *Deprecated* en SonarQube Cloud); el análisis del PR #26 reportó 0 sobre 0 líneas nuevas. Candidatos por inspección manual en [04 OWASP](04%20OWASP%20V_1_1_0.md) | Por incorporar |

## 3. Plan de Remediación y Deuda Técnica

- **Deuda Técnica Estimada:** por incorporar de SonarQube (medida *Technical Debt* en *Measures*; el resumen solo muestra calificación A en mantenibilidad).
- **Principales hallazgos y acciones correctivas:**
  0. **SonarQube Cloud, `main`:** 26 incidencias de fiabilidad (calificación E), 8 de seguridad (D) y 10 de mantenibilidad (A) abiertas. Acción: abrir la página *Issues*, clasificar por severidad y regla, corregir primero las de fiabilidad y de seguridad, y repetir el análisis; registrar aquí cada hallazgo con su corrección. **No aplicada.**
  1. **Vite 8.3.0 – 8.3.2 con vulnerabilidad alta** (dependencia directa de desarrollo; `launch-editor` con escape incompleto de argumentos en Windows). Corrección disponible: actualizar `vite` a una versión posterior a 8.3.2 con `npm audit fix` y volver a correr las pruebas. **No aplicada** en esta fecha.
  2. **`undici` 8.0.0 – 8.12.1 con vulnerabilidad alta** (transitiva; denegación de servicio por memoria no acotada en el analizador de `EventSource`). Se corrige junto con el punto anterior. **No aplicada.**
  3. **Cobertura de ramas del frontend en 72,5 %** y sentencias en 80,0 %, justo en el umbral de la Definition of Done (≥ 80 % del código nuevo). Acción: agregar pruebas a las ramas de error de los adaptadores HTTP y a las vistas de administración; medir la cobertura por archivo modificado en cada Pull Request.
  4. **Tres archivos de backend vacíos** (`generate_routes.py`, `reoptimize_route.py` y `route.py`) y duplicidad entre el módulo de planificación estimada y el caso de uso previsto. Acción: eliminarlos o implementarlos al construir el motor de rutas (EN-01).
  5. **Análisis estático sin integración continua.** La configuración de SonarQube existe en la rama de Alex. Acción: integrarla a `main` mediante Pull Request, generar la cobertura de backend con `pytest --cov --cov-report=xml` (archivo `src/backend/coverage.xml`) y la de frontend con `vitest --coverage` (`lcov`), y agregar un flujo de CI que ejecute el escaneo con el Quality Gate como requisito de merge.

**Para completar este documento:** agregar las capturas de la rama `main` en SonarQube Cloud de (1) *Issues*, con el conteo por tipo y severidad y las reglas más frecuentes; (2) *Security Hotspots*; (3) *Measures*, con la deuda técnica y las líneas por lenguaje; y (4) el detalle de las 2 advertencias del análisis. Después, registrar las correcciones aplicadas y el nuevo análisis.

**Comandos usados en esta evaluación (desde `src/backend` y `src/frontend`):**

```powershell
# Backend
.venv\Scripts\python.exe -m pytest -q --cov=application --cov=domain --cov=infrastructure --cov=interfaces --cov-report=term
.venv\Scripts\python.exe -m pip_audit -r requirements.txt
# Frontend
npx vitest run --coverage --coverage.reporter=text-summary
npx oxlint ; npx tsc -b ; npm audit
```

## Evidencia de SonarQube Cloud

### Análisis de la rama `main`

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

El resumen no desglosa las incidencias por severidad ni por regla, ni muestra los Security Hotspots ni la deuda técnica; esos datos están en las páginas *Issues*, *Security Hotspots* y *Measures*.

### Pull Request #26

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
| V_1_0_0 | 30/10/2026 | Tovar Sánchez, Carlos Alberto. Emisión inicial con la plantilla oficial: cobertura, lint y auditoría de dependencias medidos localmente y resumen de SonarQube Cloud de `main` (commit d36441f) y del PR #26; desglose de incidencias y deuda técnica por incorporar. |

[← Volver al índice correspondiente](README.md)
