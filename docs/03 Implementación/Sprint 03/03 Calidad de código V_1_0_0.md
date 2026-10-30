# Evaluación de Calidad de Código — SonarQube

**Nombre del Proyecto:** EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Fecha de Análisis:** 2026-10-30

**Versión del Análisis:** V_1_0_0

**Versión del documento:** V_1_0_0

**Commit evaluado:** `main`, `29ca820` (30/10/2026).

> **Alcance real del análisis.** El repositorio no tiene servidor SonarQube/SonarCloud, token ni archivo `sonar-project.properties`, y no existe integración continua (`.github/`). Por eso **no se ejecutó SonarQube**: los campos que solo SonarQube entrega (Quality Gate, duplicación, bugs, code smells y Security Hotspots) figuran como «Pendiente de ejecución» y no se estiman. Lo que sí se midió en esta fecha con herramientas locales (cobertura, lint, tipos, auditoría de dependencias) se registra con su comando y su resultado.

## 1. Resumen Ejecutivo de Quality Gate

- **Estado del Quality Gate:** PENDIENTE DE EJECUCIÓN (SonarQube no ejecutado).
- **Porcentaje de Cobertura de Pruebas (Coverage):** backend **82 %** de sentencias (`pytest-cov` sobre `application`, `domain`, `infrastructure` e `interfaces`; 225 pruebas aprobadas) y frontend **80,0 %** de sentencias, 72,5 % de ramas, 80,6 % de funciones y 85,8 % de líneas (`vitest --coverage`, proveedor V8; 273 pruebas aprobadas). Es cobertura global del código, no del código nuevo del sprint, y proviene de herramientas locales, no de SonarQube.
- **Duplicación de Código:** PENDIENTE DE EJECUCIÓN (SonarQube).

Otros indicadores locales (30/10/2026): `oxlint` sin advertencias, `tsc -b` sin errores, compilación de producción completada; backend con 225 pruebas aprobadas, 5 omitidas (integración con PostgreSQL real) y 36 subpruebas.

## 2. Métricas Principales

| Categoría | Cantidad Detectada | Severidad (Bloqueante / Alta / Media / Baja) |
|---|---|---|
| Bugs | Pendiente de ejecución (SonarQube) | Pendiente |
| Vulnerabilidades | Pendiente de ejecución (SonarQube). Auditoría de dependencias: `npm audit` 2 altas, `pip-audit` 0 (ver sección 3) | Alta (dependencias de desarrollo) |
| Code Smells | Pendiente de ejecución (SonarQube). Observación manual: 3 archivos de backend vacíos (`generate_routes.py`, `reoptimize_route.py`, `route.py`) | Pendiente |
| Security Hotspots | Pendiente de ejecución (SonarQube). Candidatos por inspección manual en el documento [04 OWASP](04%20OWASP%20V_1_0_0.md) | Pendiente |

## 3. Plan de Remediación y Deuda Técnica

- **Deuda Técnica Estimada:** pendiente de ejecución (la calcula SonarQube a partir de sus hallazgos).
- **Principales hallazgos y acciones correctivas:**
  1. **Vite 8.3.0 – 8.3.2 con vulnerabilidad alta** (dependencia directa de desarrollo; `launch-editor` con escape incompleto de argumentos en Windows). Corrección disponible: actualizar `vite` a una versión posterior a 8.3.2 con `npm audit fix` y volver a correr las pruebas. **No aplicada** en esta fecha.
  2. **`undici` 8.0.0 – 8.12.1 con vulnerabilidad alta** (transitiva; denegación de servicio por memoria no acotada en el analizador de `EventSource`). Se corrige junto con el punto anterior. **No aplicada.**
  3. **Cobertura de ramas del frontend en 72,5 %** y sentencias en 80,0 %, justo en el umbral de la Definition of Done (≥ 80 % del código nuevo). Acción: agregar pruebas a las ramas de error de los adaptadores HTTP y a las vistas de administración; medir la cobertura por archivo modificado en cada Pull Request.
  4. **Tres archivos de backend vacíos** (`generate_routes.py`, `reoptimize_route.py` y `route.py`) y duplicidad entre el módulo de planificación estimada y el caso de uso previsto. Acción: eliminarlos o implementarlos al construir el motor de rutas (EN-01).
  5. **Sin análisis estático continuo.** Acción: agregar `sonar-project.properties`, una cuenta de SonarCloud o un SonarQube local y un flujo de CI que ejecute pruebas con cobertura (`pytest --cov --cov-report=xml` y `vitest --coverage` en formato `lcov`) y envíe el resultado, con el Quality Gate como requisito de merge.

**Para completar este documento:** ejecutar `sonar-scanner` con el XML de cobertura de backend y el `lcov` del frontend, copiar el Quality Gate, la duplicación y los conteos por severidad a las secciones 1 y 2, y registrar la deuda técnica y las correcciones aplicadas.

**Comandos usados en esta evaluación (desde `src/backend` y `src/frontend`):**

```powershell
# Backend
.venv\Scripts\python.exe -m pytest -q --cov=application --cov=domain --cov=infrastructure --cov=interfaces --cov-report=term
.venv\Scripts\python.exe -m pip_audit -r requirements.txt
# Frontend
npx vitest run --coverage --coverage.reporter=text-summary
npx oxlint ; npx tsc -b ; npm audit
```

## Control de versiones del documento

| Versión | Fecha | Autoría / cambio |
|---|---|---|
| V_1_0_0 | 30/10/2026 | Tovar Sánchez, Carlos Alberto. Emisión inicial con la plantilla oficial: cobertura, lint y auditoría de dependencias medidos localmente; campos de SonarQube pendientes de ejecución. |

[← Volver al índice correspondiente](README.md)
