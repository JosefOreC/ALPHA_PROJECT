# Informe SonarCloud

- Proyecto: `JosefOreC_ALPHA_PROJECT`
- Exportado (UTC): 2026-10-30T17:52:29.385346+00:00
- Ámbito: `{"branch": "main"}`
- [Dashboard](https://sonarcloud.io/dashboard?id=JosefOreC_ALPHA_PROJECT&branch=main)
- Quality Gate: **OK**
- Incidencias exportadas (incluye resueltas): 34
- Security Hotspots: 0
exportados

Consulta del estado actual, no snapshot atómico. Confirmar el commit del análisis en SonarCloud. No certifica cumplimiento OWASP.

| Métrica | Valor |
|---|---|
| bugs | 5 |
| duplicated_lines_density | 0.3 |
| code_smells | 21 |
| ncloc | 20974 |
| vulnerabilities | 8 |
| security_hotspots | 0 |

El detalle y los identificadores originales están en `sonar-results.json`.
Relacionar reglas y CWE con OWASP 2025 y completar la revisión manual según la guía del repositorio.

## Trazabilidad

- Organización: `joseforec`
- Análisis: `7bafcf24-f960-40ea-a76d-4f31f9d160ee`
- Commit analizado: `d36441fc4254ac9865dab6daa5bfc8dfa29ff71e`
- Fecha del análisis: 2026-10-30T17:34:50+0000

## Incidencias

Tipos: `{'CODE_SMELL': 21, 'BUG': 5, 'VULNERABILITY': 8}`.

| ID | Tipo | Severidad | Regla | Ubicación |
|---|---|---|---|---|
| AaGN1K4Rui_0ctHiza71 | CODE_SMELL | MAJOR | python:S8786 | JosefOreC_ALPHA_PROJECT:scripts/check_docs.py:52 |
| AaGN1K4Rui_0ctHiza72 | CODE_SMELL | MAJOR | python:S8786 | JosefOreC_ALPHA_PROJECT:scripts/check_docs.py:72 |
| AaGN1K4Rui_0ctHiza73 | BUG | MAJOR | python:S5850 | JosefOreC_ALPHA_PROJECT:scripts/check_docs.py:156 |
| AaGN1K4Rui_0ctHiza74 | CODE_SMELL | MAJOR | python:S8786 | JosefOreC_ALPHA_PROJECT:scripts/check_docs.py:156 |
| AaGN1K4xui_0ctHiza75 | CODE_SMELL | MAJOR | python:S8786 | JosefOreC_ALPHA_PROJECT:scripts/create_admin.py:38 |
| AaGN1K1Uui_0ctHiza7o | CODE_SMELL | MAJOR | python:S8786 | JosefOreC_ALPHA_PROJECT:src/backend/interfaces/api/portal/router.py:31 |
| AaGN1K4Iui_0ctHiza7z | VULNERABILITY | MAJOR | pythonsecurity:S8707 | JosefOreC_ALPHA_PROJECT:src/frontend/scripts/generate-basemap-style.py:16 |
| AaGN1K4Iui_0ctHiza7y | CODE_SMELL | MAJOR | python:S8786 | JosefOreC_ALPHA_PROJECT:src/frontend/scripts/generate-basemap-style.py:18 |
| AaGN1K3rui_0ctHiza7r | CODE_SMELL | MAJOR | typescript:S6848 | JosefOreC_ALPHA_PROJECT:src/frontend/src/interfaces/map/RouteMap.tsx:139 |
| AaGN1K31ui_0ctHiza7u | CODE_SMELL | MAJOR | typescript:S8786 | JosefOreC_ALPHA_PROJECT:src/frontend/src/features/dashboard/ui/format.ts:3 |
| AaGN1K4Cui_0ctHiza7w | CODE_SMELL | MINOR | typescript:S7773 | JosefOreC_ALPHA_PROJECT:src/frontend/src/application/fleetBoard.ts:86 |
| AaGN1K4Cui_0ctHiza7x | CODE_SMELL | MINOR | typescript:S7773 | JosefOreC_ALPHA_PROJECT:src/frontend/src/application/fleetBoard.ts:89 |
| AaGN1K3tui_0ctHiza7s | CODE_SMELL | MINOR | typescript:S7773 | JosefOreC_ALPHA_PROJECT:src/frontend/src/interfaces/fleet/VehicleDialog.tsx:76 |
| AaGN1K3tui_0ctHiza7t | CODE_SMELL | MINOR | typescript:S7773 | JosefOreC_ALPHA_PROJECT:src/frontend/src/interfaces/fleet/VehicleDialog.tsx:77 |
| AaGN1K3_ui_0ctHiza7v | CODE_SMELL | MAJOR | typescript:S8786 | JosefOreC_ALPHA_PROJECT:src/frontend/src/domain/format.ts:4 |
| AaGN1K4Oui_0ctHiza70 | BUG | BLOCKER | css:S9424 | JosefOreC_ALPHA_PROJECT:ecologistica-ui/design-system/eco.css:99 |
| AaGN1K3Jui_0ctHiza7p | CODE_SMELL | MAJOR | typescript:S8786 | JosefOreC_ALPHA_PROJECT:src/frontend/src/shared/ui/AppShell.tsx:34 |
| AaGN1K3kui_0ctHiza7q | BUG | BLOCKER | css:S9424 | JosefOreC_ALPHA_PROJECT:src/frontend/src/shared/ui/eco.css:104 |
| AaGN1K4zui_0ctHiza77 | BUG | MAJOR | Web:S5254 | JosefOreC_ALPHA_PROJECT:docs/04 Diseño/Dashboard del dia.dc.html:2 |
| AaGN1K4zui_0ctHiza76 | BUG | MAJOR | Web:PageWithoutTitleCheck | JosefOreC_ALPHA_PROJECT:docs/04 Diseño/Dashboard del dia.dc.html:3 |
| AaGN1K5Vui_0ctHiza8J | VULNERABILITY | MINOR | jssecurity:S8476 | JosefOreC_ALPHA_PROJECT:docs/04 Diseño/support.js:159 |
| AaGN1K5Vui_0ctHiza78 | CODE_SMELL | MAJOR | javascript:S8786 | JosefOreC_ALPHA_PROJECT:docs/04 Diseño/support.js:408 |
| AaGN1K5Vui_0ctHiza79 | CODE_SMELL | MAJOR | javascript:S8786 | JosefOreC_ALPHA_PROJECT:docs/04 Diseño/support.js:575 |
| AaGN1K5Vui_0ctHiza7- | CODE_SMELL | MINOR | javascript:S7773 | JosefOreC_ALPHA_PROJECT:docs/04 Diseño/support.js:614 |
| AaGN1K5Vui_0ctHiza7_ | CODE_SMELL | MAJOR | javascript:S7767 | JosefOreC_ALPHA_PROJECT:docs/04 Diseño/support.js:778 |
| AaGN1K5Vui_0ctHiza8A | VULNERABILITY | CRITICAL | javascript:S1523 | JosefOreC_ALPHA_PROJECT:docs/04 Diseño/support.js:844 |
| AaGN1K5Vui_0ctHiza8B | VULNERABILITY | CRITICAL | javascript:S1523 | JosefOreC_ALPHA_PROJECT:docs/04 Diseño/support.js:850 |
| AaGN1K5Vui_0ctHiza8C | VULNERABILITY | CRITICAL | javascript:S1523 | JosefOreC_ALPHA_PROJECT:docs/04 Diseño/support.js:1218 |
| AaGN1K5Vui_0ctHiza8D | VULNERABILITY | CRITICAL | javascript:S2819 | JosefOreC_ALPHA_PROJECT:docs/04 Diseño/support.js:1387 |
| AaGN1K5Vui_0ctHiza8E | VULNERABILITY | CRITICAL | javascript:S2819 | JosefOreC_ALPHA_PROJECT:docs/04 Diseño/support.js:1407 |
| AaGN1K5Vui_0ctHiza8F | CODE_SMELL | MAJOR | javascript:S2310 | JosefOreC_ALPHA_PROJECT:docs/04 Diseño/support.js:1529 |
| AaGN1K5Vui_0ctHiza8G | CODE_SMELL | MAJOR | javascript:S2310 | JosefOreC_ALPHA_PROJECT:docs/04 Diseño/support.js:1536 |
| AaGN1K5Vui_0ctHiza8H | CODE_SMELL | MAJOR | javascript:S2310 | JosefOreC_ALPHA_PROJECT:docs/04 Diseño/support.js:1561 |
| AaGN1K5Vui_0ctHiza8I | VULNERABILITY | CRITICAL | javascript:S2819 | JosefOreC_ALPHA_PROJECT:docs/04 Diseño/support.js:1858 |

El Quality Gate depende de sus condiciones y del período de código nuevo; revisar también las vulnerabilidades del código global.
Si no se devuelve una métrica de cobertura, registrarla como no disponible; no sustituirla con los porcentajes de las pruebas locales.
