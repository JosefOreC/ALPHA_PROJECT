# Evidencias del incremento adaptado sobre 6e36e35

**Rama:** `refactor/mern`. **Base:** `6e36e355e0d39c83c5700a83eb0987b6fd849a10`.

Los cambios permanecen sin commit. Los recibos identifican HEAD, estado del árbol, hash del diff de fuentes, comando, horas Lima y huella de la salida. El HEAD de las mediciones identifica su base, no la totalidad del incremento local. La matriz y las comparaciones por área están en la sección 7 del [documento 04](../../04%20Est%C3%A1ndares%20arquitectura%20y%20gu%C3%ADa%20de%20desarrollo%20verde%20V_1_2_0.md). La implementación seleccionada usa el prefijo de medición **fase3-arranque**.

## Código y validaciones

- Diff del incremento respecto de la base (`cambios-producto.patch`, registro local).
- Antecedentes reales SQL/lazy y creación de SVG (`antecedentes.patch`, registro local): commits 3b5bdae → 9f953d6 y padre de c142f0d → c142f0d. No representan cambios nuevos ni conversiones históricas inventadas.
- Recibos de la solución final en `entrega/` y `arranque/`. Cada salida TXT tiene metadatos JSON.
- Los recibos raíz, `final/`, `prefetch/`, `prefetch-final/` y `alcance-query/` conservan intentos intermedios. No deben confundirse con la solución final. La primera cobertura pasó sus pruebas pero falló ramas; el primer cambio de alcance de Query tuvo una prueba fallida de error nulo, corregida posteriormente.

La integración real PostgreSQL/PostGIS está desactivada en los controles ordinarios. Las pruebas nuevas comprueban contratos SQL con dobles y comportamiento HTTP con memoria sintética; no acreditan índices instalados en una base del usuario. Los planes reales anteriores permanecen en [la entrega histórica](../optimizacion-3b5bdae/README.md).

| Comprobación seleccionada | Resultado | Salida |
|---|---|---|
| Build del arranque seleccionado | Código 0; advertencia de tamaño del motor cartográfico diferido | Build (`compilacion.txt`, registro local), recibo (`compilacion.json`, registro local) |
| Lint | Código 0, sin nuevas advertencias | Lint (`lint.txt`, registro local), recibo (`lint.json`, registro local) |
| Frontend definitivo | 474 pruebas aprobadas; líneas 97,14 %, ramas 90,27 % | Cobertura (`frontend-cobertura.txt`, registro local), recibo (`frontend-cobertura.json`, registro local) |
| Backend | 447 pruebas y 36 subpruebas aprobadas; 7 omitidas | Cobertura (`backend-cobertura.txt`, registro local), recibo (`backend-cobertura.json`, registro local) |
| Gate backend | Líneas 94,01 %, ramas 90,48 %; umbrales 90 % aprobados | Gate (`backend-umbral.txt`, registro local) |
| Node | 12 aprobadas, incluida descompresión Brotli/gzip | Node (`frontend-node.txt`, registro local) |
| Navegador/axe | 54 aprobadas, 5 omitidas por distribución de viewport | Navegador (`interfaz-pruebas.txt`, registro local), recibo (`interfaz-pruebas.json`, registro local) |
| Acceso/administración/cierre tras ajustar arranque | 2 aprobadas, escritorio y móvil | Regresión de arranque (`interfaz-arranque.txt`, registro local), recibo (`interfaz-arranque.json`, registro local) |

## Resultado y reportes originales

Las seis corridas seleccionadas cumplen todos los umbrales: performance 100, FCP máximo 906,381 ms, LCP máximo 1386,0075 ms, TBT máximo 72 ms, CLS 0 y transferencia máxima 101753 bytes. Los doce originales de la comparación controlada están enlazados en el informe HTML (`auditoria-consolidada.html`, registro local) y en el JSON con huellas, rangos, solicitudes y SWDM (`auditoria-consolidada.json`, registro local).

| Estado | Página | Corrida 1 | Corrida 2 | Corrida 3 |
|---|---|---|---|---|
| Base | Acceso | JSON (`fase3-before-login-1.json`, registro local) / HTML (`fase3-before-login-1.html`, registro local) | JSON (`fase3-before-login-2.json`, registro local) / HTML (`fase3-before-login-2.html`, registro local) | JSON (`fase3-before-login-3.json`, registro local) / HTML (`fase3-before-login-3.html`, registro local) |
| Base | Pedidos | JSON (`fase3-before-pedidos-1.json`, registro local) / HTML (`fase3-before-pedidos-1.html`, registro local) | JSON (`fase3-before-pedidos-2.json`, registro local) / HTML (`fase3-before-pedidos-2.html`, registro local) | JSON (`fase3-before-pedidos-3.json`, registro local) / HTML (`fase3-before-pedidos-3.html`, registro local) |
| Seleccionado | Acceso | JSON (`fase3-arranque-login-1.json`, registro local) / HTML (`fase3-arranque-login-1.html`, registro local) | JSON (`fase3-arranque-login-2.json`, registro local) / HTML (`fase3-arranque-login-2.html`, registro local) | JSON (`fase3-arranque-login-3.json`, registro local) / HTML (`fase3-arranque-login-3.html`, registro local) |
| Seleccionado | Pedidos | JSON (`fase3-arranque-pedidos-1.json`, registro local) / HTML (`fase3-arranque-pedidos-1.html`, registro local) | JSON (`fase3-arranque-pedidos-2.json`, registro local) / HTML (`fase3-arranque-pedidos-2.html`, registro local) | JSON (`fase3-arranque-pedidos-3.json`, registro local) / HTML (`fase3-arranque-pedidos-3.html`, registro local) |

El manifiesto de procedencia (`procedencia.json`, registro local) identifica artefactos, fuentes y ambos builds. El validador de solo lectura (`validar_evidencias.py`, registro local) comprueba integridad, los doce hashes seleccionados y 18 igualdades del cálculo ambiental. Las proyecciones anuales son escenarios, no tráfico observado: el resultado algebraico de Acceso es negativo y se presenta como incremento estimado.

## Mediciones

Los prefijos `fase3-before` identifican el build del commit base; `fase3-after` identifica el primer experimento con React Query en Pedidos; `fase3-prefetch` conserva el intento posterior de precarga. Ambos experimentos registraron incumplimientos de LCP/TBT y fueron retirados. No se borran sus reportes ni se seleccionan solo corridas favorables. La solución final limita Query a Registros y deja App.tsx igual a la base.

`fase3-final` conserva la primera solución de Query acotado: sus medianas cumplieron, pero tres corridas individuales fallaron TBT/LCP. `fase3-arranque` incorpora además `setTimeout(..., 0)` para separar la inicialización de React y es la serie seleccionada, con las seis corridas conformes. No se sustituyen resultados de la misma serie para ocultar fallos.

Cada ejecución genera resumen, log del servidor y tres JSON/HTML por página. Las mediciones usan únicamente localhost:5189, API FastAPI real con 150 pedidos ficticios en memoria y sesión ficticia del banco; nunca cargan credenciales ni la base del usuario. No equivalen a un despliegue productivo.

Herramientas del banco nuevo: Node 22.23.1, Python 3.14.6, Lighthouse 13.6.0, Chromium headless 153.0.8010.12 y Hypercorn 0.18.0, TLS efímero y h2. Este Chromium difiere de los reportes históricos de `metricas-bd95dc9`; por eso se recompiló y midió la base en el mismo entorno nuevo. No se atribuyen diferencias entre navegadores a optimizaciones del código.

## Reproducción

Desde la raíz del repositorio. Conservar esta carpeta antes de repetir: los ejecutores sustituyen los archivos de su tarea. Instalar dependencias frontend con el lock actual y preparar Lighthouse/chrome-launcher en `.test-deps/green-it` conforme al [procedimiento anterior](../metricas-bd95dc9/README.md). Para este banco se preparó `.test-deps/audit-venv` con los requisitos HTTP/2 opcionales. Un navegador diferente exige medir de nuevo ambos estados.

```powershell
$evidence = 'docs/03 Implementación/Sprint 4/evidencias/fase3-6e36e35'
python 'docs/03 Implementación/Sprint 4/evidencias/verificar_corte.py' quality "$evidence/entrega"
python 'docs/03 Implementación/Sprint 4/evidencias/verificar_corte.py' coverage-limited "$evidence/entrega"
python 'docs/03 Implementación/Sprint 4/evidencias/verificar_corte.py' backend-coverage "$evidence/entrega"
python 'docs/03 Implementación/Sprint 4/evidencias/verificar_corte.py' python-gate "$evidence/entrega"
python 'docs/03 Implementación/Sprint 4/evidencias/verificar_corte.py' node "$evidence/entrega"
$env:PLAYWRIGHT_CHANNEL = 'bundled'
python 'docs/03 Implementación/Sprint 4/evidencias/verificar_corte.py' ui "$evidence/entrega"
python 'docs/03 Implementación/Sprint 4/evidencias/verificar_corte.py' coverage-limited "$evidence/arranque"
python 'docs/03 Implementación/Sprint 4/evidencias/verificar_corte.py' ui-login "$evidence/arranque"
```

Para compilar la base sin cambiar la rama: exportar mediante `git archive` los directorios `src/frontend`, `src/backend` y `src/shared` de 6e36e35 a `.test-deps/fase3-before`; extraerlos; ejecutar `npm ci` y `npm run build` en su frontend. No reemplazar el dist anterior con el actual. Preparar certificado/clave efímeros en `.test-deps/green-it` con OpenSSL como indica el procedimiento histórico, sin modificar certificados del sistema.

```powershell
$env:GREEN_IT_PYTHON = (Resolve-Path '.test-deps/audit-venv/Scripts/python.exe').Path
$env:GREEN_IT_CHROME_PATH = "$env:LOCALAPPDATA/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-win64/chrome-headless-shell.exe"
$env:GREEN_IT_TLS_CERT = (Resolve-Path '.test-deps/green-it/fase3-cert.pem').Path
$env:GREEN_IT_TLS_KEY = (Resolve-Path '.test-deps/green-it/fase3-key.pem').Path
$env:GREEN_IT_BACKEND_ROOT = (Resolve-Path '.test-deps/fase3-before/src/backend').Path
node scripts/measure_green_it.mjs fase3-before .test-deps/fase3-before/src/frontend/dist $evidence
$env:GREEN_IT_BACKEND_ROOT = (Resolve-Path 'src/backend').Path
node scripts/measure_green_it.mjs fase3-arranque src/frontend/dist $evidence
python 'docs/03 Implementación/Sprint 4/evidencias/metricas-bd95dc9/consolidar_metricas.py' --directory $evidence --before fase3-before --after fase3-arranque --baseline 6e36e35 --page-size 12
python "$evidence/validar_evidencias.py"
```

Ejecutar mediciones secuencialmente, sin suites de pruebas concurrentes. `GREEN_IT_PYTHON` y `GREEN_IT_BACKEND_ROOT` permiten elegir explícitamente el intérprete y las fuentes del estado medido; no cambian credenciales ni configuración del producto. El consolidador verifica navegador/perfil/protocolo, carga 200 del listado, una sola petición de 12 y ausencia de descarga del motor cartográfico; falla si alguna corrida final supera un umbral. Conserva el modelo ambiental parametrizado, los rangos y las huellas de los informes.

[← Volver al índice del Sprint 4](../../README.md)
