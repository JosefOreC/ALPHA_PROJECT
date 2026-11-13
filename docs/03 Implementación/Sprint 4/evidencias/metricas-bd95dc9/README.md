# Evidencias de métricas — Sprint 4

**Proyecto:** EcoLogística Lima — DistriRápido S.A.C. **Líder:** Ore Campos, Josef Pablo.

**Autoría:** ejecución y elaboración asistidas por Codex, a solicitud del usuario.

**Índice actualizado:** 2026-11-13T01:40:49-05:00, America/Lima (UTC−05:00).

**Rama:** refactor/mern. **Código:** `1d525069686ad1222a1bbe8b58a018bdae2542a2`. **Base frontend:** `bd95dc9315c9e2526fcb06add520e982f8310cf6`.

## 1. Resultado y procedencia

Las seis corridas finales cumplen score ≥ 90, FCP ≤ 1000 ms, LCP ≤ 1400 ms, TBT ≤ 85 ms, CLS ≤ 0,02 y transferencia < 1100000 bytes. Cada número se toma del JSON original, sin redondear para aprobar. El [consolidador](consolidar_metricas.py) termina con código distinto de cero si falla una corrida o cambian las condiciones seleccionadas.

- [Informe consolidado HTML](auditoria-consolidada.html).
- [Resultado completo, umbrales, rangos, SWDM y huellas de reportes](auditoria-consolidada.json).
- [Inventario y SHA-256 de los dos builds](builds.json).
- [Manifiesto final de artefactos](procedencia.json).

Los recibos conservan HEAD, árbol de trabajo y fechas de ejecución reales. Se midieron/probaron los archivos que luego se incorporaron a 1d52506, sin reescribir esos campos. El build anterior fue compilado antes de editar el frontend y preservado aparte. Los archivos .br/.gz posteriores se verifican contra sus originales mediante Node y negociación HTTP.

## 2. Doce reportes originales de la comparación controlada

Lighthouse 13.6.0, Chromium headless 145.0.7632.6, móvil simulado 412 × 823, RTT 150 ms, throughput 1638,4 Kbps y CPU ×4. Ambos estados usan HTTPS/HTTP/2, el mismo banco FastAPI y 150 pedidos ficticios en memoria. La configuración completa está en cada JSON; la identidad ficticia no se usa fuera del ejecutor local.

| Estado | Página | Corrida 1 | Corrida 2 | Corrida 3 |
|---|---|---|---|---|
| Antes | login | [HTML](verified-before-login-1.html) / [JSON](verified-before-login-1.json) | [HTML](verified-before-login-2.html) / [JSON](verified-before-login-2.json) | [HTML](verified-before-login-3.html) / [JSON](verified-before-login-3.json) |
| Antes | pedidos | [HTML](verified-before-pedidos-1.html) / [JSON](verified-before-pedidos-1.json) | [HTML](verified-before-pedidos-2.html) / [JSON](verified-before-pedidos-2.json) | [HTML](verified-before-pedidos-3.html) / [JSON](verified-before-pedidos-3.json) |
| Después | login | [HTML](final-after-login-1.html) / [JSON](final-after-login-1.json) | [HTML](final-after-login-2.html) / [JSON](final-after-login-2.json) | [HTML](final-after-login-3.html) / [JSON](final-after-login-3.json) |
| Después | pedidos | [HTML](final-after-pedidos-1.html) / [JSON](final-after-pedidos-1.json) | [HTML](final-after-pedidos-2.html) / [JSON](final-after-pedidos-2.json) | [HTML](final-after-pedidos-3.html) / [JSON](final-after-pedidos-3.json) |

Resúmenes de fase: [antes](verified-before-summary.json) y [después](final-after-summary.json). Logs de servidor: [antes](verified-before-server.txt) y [después](final-after-server.txt). Las advertencias SSL locales que puedan aparecer no se confunden con errores de carga del producto. El certificado autofirmado y su clave permanecen ignorados en .test-deps; no se publican ni se modifica el almacén de certificados del sistema.

## 3. Regresión, calidad y dependencias

| Control | Metadatos | Salida | Resultado |
|---|---|---|---|
| Build | [JSON](compilacion.json) | [TXT](compilacion.txt) | Código 0; advertencia del motor cartográfico diferido. |
| Lint | [JSON](lint.json) | [TXT](lint.txt) | Código 0. |
| Frontend y Node | [JSON](frontend-cobertura.json) | [TXT](frontend-cobertura.txt), [cobertura](frontend-cobertura-resumen.json) | 470 Vitest, 12 Node; líneas 97,19 %, ramas 90,09 %. |
| Backend | [JSON](backend-cobertura.json) | [TXT](backend-cobertura.txt), [cobertura](backend-cobertura-resumen.json) | 442 aprobadas, 36 subpruebas, 7 omitidas; líneas 93,98 %, ramas 90,36 %. |
| Gate backend | [JSON](backend-umbral.json) | [TXT](backend-umbral.txt) | Umbrales 90 % aprobados. |
| Playwright/axe | [JSON](interfaz-pruebas.json) | [TXT](interfaz-pruebas.txt) | 54 aprobadas, 5 omitidas por viewport, 0 fallidas. |
| Dependencias completas instaladas | [pip-audit](pip-audit.json) | Resultado JSON íntegro. | 0 vulnerabilidades conocidas, incluido Hypercorn y sus dependencias. |
| Documentación | [JSON](documentacion.json) | [TXT](documentacion.txt) | Enlaces, navegación y versiones comprobados. |
| Markdown | [JSON](markdown.json) | [TXT](markdown.txt) | Lint de los documentos actuales. |

Las omisiones de backend son integración PostgreSQL/PostGIS explícita, no fallos disimulados. Las pruebas reales de vistas de la entrega anterior siguen en su carpeta histórica. Playwright completó sus casos; para terminar el ejecutor en Windows se detuvo únicamente su Vite PID 24048, puerto 5178, iniciado a las 01:29:32 Lima. La salida final y el código 0 se preservan.

## 4. Diagnóstico Edge y experimentos

Se conservan [las corridas iniciales Edge/HTTP/1.1](baseline-summary.json) y los reportes originales listados a continuación. Incluyen un script inyectado por software local, bloqueado en Lighthouse. No se desactivó el antivirus. No se comparan esos valores con Chromium/HTTP/2 para atribuir la diferencia solo al código.

- login: [HTML 1](baseline-login-1.html) / [JSON 1](baseline-login-1.json), [HTML 2](baseline-login-2.html) / [JSON 2](baseline-login-2.json), [HTML 3](baseline-login-3.html) / [JSON 3](baseline-login-3.json).
- pedidos: [HTML 1](baseline-pedidos-1.html) / [JSON 1](baseline-pedidos-1.json), [HTML 2](baseline-pedidos-2.html) / [JSON 2](baseline-pedidos-2.json), [HTML 3](baseline-pedidos-3.html) / [JSON 3](baseline-pedidos-3.json).

Log de diagnóstico: [TXT](baseline-server.txt).

Los [experimentos descartados](experimentos.json) conservan todos sus resúmenes versionados; los reportes completos intermedios se archivan localmente en .test-deps/metricas-experimentos. Incluyen prerender/arranque y HTTP/1.1; no son el código final ni evidencia seleccionada de cumplimiento. El nombre isolated-h2-candidate-9 no acredita h2: esa corrida realmente usó HTTP/1.1, como registran sus protocolos/origen.

- [candidate-1-summary.json](candidate-1-summary.json).
- [candidate-2-summary.json](candidate-2-summary.json).
- [candidate-3-summary.json](candidate-3-summary.json).
- [candidate-4-summary.json](candidate-4-summary.json).
- [candidate-5-summary.json](candidate-5-summary.json).
- [h2-candidate-10-summary.json](h2-candidate-10-summary.json).
- [isolated-candidate-6-summary.json](isolated-candidate-6-summary.json).
- [isolated-candidate-7-summary.json](isolated-candidate-7-summary.json).
- [isolated-candidate-8-summary.json](isolated-candidate-8-summary.json).
- [isolated-candidate-9-summary.json](isolated-candidate-9-summary.json).
- [isolated-candidate-summary.json](isolated-candidate-summary.json).
- [isolated-h2-candidate-9-summary.json](isolated-h2-candidate-9-summary.json).
- [minimal-candidate-summary.json](minimal-candidate-summary.json).
- [verified-after-summary.json](verified-after-summary.json).

## 5. Reproducción

Guardar esta carpeta antes de repetir: los comandos sustituyen artefactos de la tarea. Desde la raíz, con Node, dependencias frontend y el entorno virtual instalados:

El entorno original usa Node 24.11.1 y Python 3.14.2. Preparar las herramientas y el build anterior sin modificar el checkout actual:

```powershell
npm.cmd install --prefix .test-deps/green-it --ignore-scripts --no-audit --no-fund --save-exact lighthouse@13.6.0 chrome-launcher@1.2.3
git archive --format=zip --output=.test-deps/metricas-antes.zip bd95dc9315c9e2526fcb06add520e982f8310cf6 src/frontend
Expand-Archive -LiteralPath '.test-deps/metricas-antes.zip' -DestinationPath '.test-deps/metricas-antes' -Force
npm.cmd --prefix .test-deps/metricas-antes/src/frontend ci
npm.cmd --prefix .test-deps/metricas-antes/src/frontend run build
```

Generar un certificado de prueba nuevo (rutas de OpenSSL de Git utilizadas en este equipo):

```powershell
& 'C:/Program Files/Git/usr/bin/openssl.exe' req -config 'C:/Program Files/Git/usr/ssl/openssl.cnf' -x509 -newkey rsa:2048 -nodes -days 2 -subj '/CN=localhost' -addext 'subjectAltName=IP:127.0.0.1,DNS:localhost' -keyout .test-deps/green-it/local-tls-key.pem -out .test-deps/green-it/local-tls-cert.pem
```

```powershell
$evidence = 'docs/03 Implementación/Sprint 4/evidencias/metricas-bd95dc9'
.\.venv\Scripts\python.exe -m pip install -r src/backend/requirements-http2.txt
npm.cmd --prefix src/frontend run build
$env:GREEN_IT_CHROME_PATH = "$env:LOCALAPPDATA/ms-playwright/chromium_headless_shell-1208/chrome-headless-shell-win64/chrome-headless-shell.exe"
$env:GREEN_IT_TLS_CERT = (Resolve-Path '.test-deps/green-it/local-tls-cert.pem').Path
$env:GREEN_IT_TLS_KEY = (Resolve-Path '.test-deps/green-it/local-tls-key.pem').Path
node scripts/measure_green_it.mjs verified-before .test-deps/metricas-antes/src/frontend/dist $evidence
node scripts/measure_green_it.mjs final-after src/frontend/dist $evidence
.\.venv\Scripts\python.exe "$evidence/consolidar_metricas.py"
```

Para preparar el build anterior, exportar src/frontend del commit bd95dc9315c9e2526fcb06add520e982f8310cf6 mediante git archive a una carpeta local separada, instalar con npm ci, compilar y preservar su dist en .test-deps/metricas-bd95dc9-dist. No sustituirlo por el dist actual. El [inventario](builds.json) permite comprobar los artefactos usados en esta entrega.

La ruta de Chromium indica el binario realmente utilizado (Playwright revisión 1208). En otro equipo debe instalarse un binario equivalente y volver a medir ambos estados; no se supone que una versión distinta reproduzca los números exactos. Para preparar TLS local se generaron certificado/clave efímeros con OpenSSL, CN localhost y SAN localhost/127.0.0.1, dentro de .test-deps. El ejecutor añade la excepción de validación solo al navegador del banco local; no debe trasladarse a producción.

```powershell
.\.venv\Scripts\python.exe 'docs/03 Implementación/Sprint 4/evidencias/verificar_corte.py' quality $evidence
.\.venv\Scripts\python.exe 'docs/03 Implementación/Sprint 4/evidencias/verificar_corte.py' coverage $evidence
.\.venv\Scripts\python.exe 'docs/03 Implementación/Sprint 4/evidencias/verificar_corte.py' backend-coverage $evidence
.\.venv\Scripts\python.exe 'docs/03 Implementación/Sprint 4/evidencias/verificar_corte.py' python-gate $evidence
.\.venv\Scripts\python.exe 'docs/03 Implementación/Sprint 4/evidencias/verificar_corte.py' ui $evidence
.\.venv\Scripts\python.exe 'docs/03 Implementación/Sprint 4/evidencias/verificar_corte.py' markdown $evidence
.\.venv\Scripts\python.exe 'docs/03 Implementación/Sprint 4/evidencias/verificar_corte.py' docs $evidence
```

El [ejecutor Lighthouse](../../../../../scripts/measure_green_it.mjs), el [fixture](../../../../../scripts/green_it_fixture.py) y el [ejecutor de calidad](../verificar_corte.py) están versionados. Ejecutar mediciones secuencialmente; todas usan localhost:5189. Los controles ordinarios desactivan integración real con la base del usuario.

[← Volver al índice correspondiente](../README.md)
