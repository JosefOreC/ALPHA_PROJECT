# Informe SonarCloud y revisión OWASP Top 10:2025

| Campo | Evidencia verificada |
|---|---|
| Proyecto | EcoLogística Lima / `ALPHA_PROJECT` |
| Organización | `joseforec` |
| Project key | `JosefOreC_ALPHA_PROJECT` |
| Visibilidad | Pública |
| Enlace | [Resultados de main](https://sonarcloud.io/summary/overall?id=JosefOreC_ALPHA_PROJECT&branch=main) |
| Fecha del análisis | 30/10/2026, 12:34:50 America/Lima (`17:34:50 UTC`) |
| Rama analizada | `main` |
| Commit analizado | `d36441fc4254ac9865dab6daa5bfc8dfa29ff71e` |
| Identificador del análisis | `7bafcf24-f960-40ea-a76d-4f31f9d160ee` |
| Referencia posterior del repositorio | `6ba77a6b0d20314d5aaeb14b7c7ef1cd1af46b0e`; aún no representada por este análisis |
| Versión documental | V_1_0_0 |
| Estado | Resultados remotos exportados; revisión de hallazgos y cierre OWASP pendientes |

## 0. Actualización: análisis CI del PR aprobado

El propietario guardó `SONAR_TOKEN` y desactivó Automatic Analysis. El [intento 3 de GitHub Actions](https://github.com/JosefOreC/ALPHA_PROJECT/actions/runs/41107004270/attempts/3) completó **Pruebas y SonarCloud con success**. La tarea `AaGOKR0tuF0_WiLutffU` finalizó en SUCCESS el 30/10/2026 a las 18:53:48 UTC y generó el análisis `aa683391-5607-478e-9138-905441b99644`, para el [PR #27](https://sonarcloud.io/dashboard?id=JosefOreC_ALPHA_PROJECT&pullRequest=27).

La API del PR confirma el head `21248b14a39e3053390bc4ab4038bd1b51981f4f`. El artefacto registra `GITHUB_SHA=d5eb106129b0a3c4842442e2788288d23f0b20ac`, la referencia de merge utilizada por GitHub para probar el PR. Se conservan ambas referencias para distinguir el head del contexto de ejecución.

| Resultado remoto del PR #27 | Valor |
|---|---:|
| Quality Gate | OK |
| Cobertura informada en el ámbito del PR | 94,1 % |
| Cobertura de líneas / ramas | 95,9 % / 90,8 % |
| Cobertura nueva, de líneas y de ramas | 100 % |
| Vulnerabilidades / bugs / code smells del PR | 0 / 0 / 0 |
| Condición remota de cobertura nueva | Mínimo 80 %; el resultado supera el 90 % solicitado |

CI exige por separado el 90 % de líneas y ramas Python, y de las cuatro métricas frontend. El Quality Gate remoto todavía debe ajustarse al 90 % desde la administración del servicio si se desea que también imponga ese umbral. Las cifras del PR no sustituyen un nuevo análisis de main ni demuestran el cierre de sus dieciséis vulnerabilidades: hay diferencias de alcance documentadas en la sección 4.

Una consulta posterior confirmó que `main` ya apunta a `4218a972f94ab4c99ce49dc704c54e858569d3cf`: su análisis del 30/10/2026 a las 13:30:59 de Lima mantiene dieciséis vulnerabilidades y Quality Gate ERROR por `new_security_rating=5` (E), frente al máximo permitido de 1 (A). El PR #27 sigue abierto y sin integrar. Por eso el enlace de main continúa mostrando Failed aunque el análisis del PR esté aprobado.

La ejecución completa sigue en **failure** por el job independiente de auditoría: diez alertas Bandit B608, cero vulnerabilidades conocidas en el entorno Python auditado y dos vulnerabilidades altas npm (`undici` y `vite`). Esos hallazgos requieren revisión/corrección y no se ocultaron para aprobar CI. Los artifacts `sonar-evidence-41107004270-3` y `security-audits-41107004270-3` contienen la evidencia. La exportación de hotspots por PR sigue sin estar soportada por la API anunciada; revisar el dashboard.

### 0.1. Estado de main anterior al análisis CI del PR

El análisis `228d20c3-3239-437a-947a-39a975bf424c`, del 30/10/2026 a las **13:00:07 America/Lima**, corresponde al commit `155a99a67b325454e18b74a41671e0b7bfd05168`. Informa **16 vulnerabilidades**, 5 bugs y 21 code smells. El Quality Gate está en **ERROR**: `new_security_rating` devuelve 5 y el umbral permitido es 1. El historial registra el cambio de verde a rojo en el análisis anterior de `6ba77a6`. La tabla inicial de este documento conserva el snapshot previo `d36441f` y sus ocho vulnerabilidades; no representa el estado actual de main.

Las ocho nuevas incidencias de seguridad son:

| IDs | Regla | Archivo | Motivo reportado |
|---|---|---|---|
| AaGN8WUfHwZRnh-VsbWJ, AaGN8WUfHwZRnh-VsbWM | githubactions:S8541 | `.github/workflows/sonarcloud.yml` | Instalación Python que permite builds desde fuentes |
| AaGN8WUfHwZRnh-VsbWK, AaGN8WUfHwZRnh-VsbWN | githubactions:S8544 | `.github/workflows/sonarcloud.yml` | Dependencias Python sin resolución bloqueada |
| AaGN8WUfHwZRnh-VsbWL, AaGN8WUfHwZRnh-VsbWO | githubactions:S6505 | `.github/workflows/sonarcloud.yml` | Scripts lifecycle durante instalación npm |
| AaGN8WTDHwZRnh-VsbWH | pythonsecurity:S8707 | `scripts/check_python_coverage.py:26` | Lectura de una ruta suministrada por CLI |
| AaGN8WUXHwZRnh-VsbWI | pythonsecurity:S2083 | `scripts/export_sonar_report.py:92` | Posible path traversal según el flujo reportado |

Las seis incidencias del workflow se relacionan con A03:2025. Las dos alertas de rutas requieren revisar la aplicabilidad de A01:2025; el contenido remoto del exportador no seleccionaba nombres de archivo. Se añadieron pruebas de regresión y escritura mediante archivos abiertos de nombre fijo para hacer explícita esa separación. El comprobador de cobertura ahora lee únicamente su artefacto fijo, sin parámetro para elegir otro archivo.

La corrección preparada instala Python desde un lock universal con versiones exactas y hashes, usa `--only-binary=:all:` y `--require-hashes`, y ejecuta `npm ci --ignore-scripts`. Se verificó una instalación nueva completa, sin errores de dependencias, y `pip-audit` no encontró vulnerabilidades conocidas en **ese entorno CI aislado**. Las pruebas aprobaron 378 casos Python y 441 frontend; se mantuvo el mínimo del 90 %: líneas/ramas Python 94,42 % / 92,79 %, frontend 97,58 % / 90,24 %. Cinco pruebas de integración real siguen omitidas. El análisis posterior del PR no devuelve incidencias, pero no acredita por sí solo el cierre de los hallazgos de main ni las alertas de Bandit/npm.

La ejecución anterior [41102893381](https://github.com/JosefOreC/ALPHA_PROJECT/actions/runs/41102893381) falló por **«Falta el secret SONAR_TOKEN»**. El propietario ya lo guardó: se verificó únicamente su existencia mediante la API de GitHub, con actualización el 30/10/2026 a las 18:44:47 UTC; no se leyó su valor.

Se repitió la ejecución [41107004270, intento 2](https://github.com/JosefOreC/ALPHA_PROJECT/actions/runs/41107004270/attempts/2), sobre `21248b14a39e3053390bc4ab4038bd1b51981f4f`. Las 378 pruebas Python y 441 frontend aprobaron en GitHub, con cinco omisiones de integración y las mismas coberturas de líneas/ramas anteriores. El escáner llegó al servicio y este rechazó el análisis: **«You are running CI analysis while Automatic Analysis is enabled»**. Ese intento no publicó un análisis CI ni importó cobertura a SonarCloud. El propietario desactivó Automatic Analysis en Administration → Analysis Method del proyecto; el intento 3 posterior resolvió ese bloqueo sin reemplazar el token.

Los artifacts del intento 2 registran diez alertas Bandit B608, cero vulnerabilidades conocidas en el entorno Python auditado y dos vulnerabilidades altas de npm. El job de auditoría falla por los hallazgos de Bandit/npm; desactivar Automatic Analysis no los resuelve. El resultado verde del análisis automático del PR #27, fechado a las 18:26:51 UTC y anterior al token, tampoco demuestra que este intento CI haya aprobado.

## 1. Resultado inicial del servicio (snapshot d36441f)

La exportación se realizó mediante la API pública, sin token, conservando los identificadores originales. Se comprobó que el identificador del análisis no cambiara entre el inicio y el final de la consulta. Las listas y medidas no constituyen un snapshot transaccional del servicio.

| Indicador | Resultado |
|---|---:|
| Quality Gate del análisis | OK |
| Incidencias de tipo Vulnerability | 8 |
| Vulnerabilidades con severidad CRITICAL | 6 |
| Vulnerabilidades MAJOR / MINOR | 1 / 1 |
| Bugs | 5 |
| Code smells | 21 |
| Incidencias exportadas | 34, todas OPEN al consultar |
| Security Hotspots devueltos para main | 0, tras consultar TO_REVIEW y REVIEWED |
| Líneas de código no comentadas | 20 974 |
| Duplicación | 0,3 % |
| Cobertura remota | No disponible: la API no devolvió coverage, line_coverage ni branch_coverage |

El **Quality Gate OK no acredita ausencia de vulnerabilidades globales**. Las condiciones devueltas comprueban las calificaciones de fiabilidad, seguridad y mantenibilidad del código nuevo, y la revisión de hotspots nuevos. No contienen una condición de cobertura del 90 %. El período de referencia comenzó el 30/10/2026 a las 12:15:45 de Lima. Deben revisarse también los hallazgos del código global.

Tres incidencias S1523 incluyen la etiqueta `former-hotspot`. Por tanto, el resultado de cero hotspots no significa que no haya decisiones de seguridad pendientes: existen ocho vulnerabilidades abiertas.

## 2. Hallazgos de seguridad para entregar al revisor

Las categorías 2025 de esta tabla son una **clasificación razonada a partir de los CWE devueltos por las reglas y de la lista oficial OWASP**, no una clasificación 2025 emitida automáticamente por Sonar. Algunos metadatos del servicio todavía se refieren a OWASP 2021. No se renumeraron esas categorías como si fueran equivalentes.

| ID original | Regla | Severidad | Archivo y línea del análisis | CWE | Categoría 2025 propuesta |
|---|---|---|---|---|---|
| AaGN1K4Iui_0ctHiza7z | pythonsecurity:S8707 | MAJOR | `src/frontend/scripts/generate-basemap-style.py:16` | 20, 22 | A01, por CWE-22; revisión de entrada también relacionada con A05 |
| AaGN1K5Vui_0ctHiza8J | jssecurity:S8476 | MINOR | `docs/04 Diseño/support.js:159` | 20 | A05 |
| AaGN1K5Vui_0ctHiza8A | javascript:S1523 | CRITICAL | `docs/04 Diseño/support.js:844` | 95, 470 | A05 |
| AaGN1K5Vui_0ctHiza8B | javascript:S1523 | CRITICAL | `docs/04 Diseño/support.js:850` | 95, 470 | A05 |
| AaGN1K5Vui_0ctHiza8C | javascript:S1523 | CRITICAL | `docs/04 Diseño/support.js:1218` | 95, 470 | A05 |
| AaGN1K5Vui_0ctHiza8D | javascript:S2819 | CRITICAL | `docs/04 Diseño/support.js:1387` | 345 | A08 |
| AaGN1K5Vui_0ctHiza8E | javascript:S2819 | CRITICAL | `docs/04 Diseño/support.js:1407` | 345 | A08 |
| AaGN1K5Vui_0ctHiza8I | javascript:S2819 | CRITICAL | `docs/04 Diseño/support.js:1858` | 345 | A08 |

S8707 señala una lectura de ruta recibida por argumento de consola. Comprobar quién controla el argumento y los privilegios del proceso; definir el directorio permitido si el requisito exige esa restricción. No se ha demostrado explotación contra la API web.

S8476 señala una petición construida desde la ubicación del documento. Revisar origen, navegación y entradas controlables antes de concluir que una petición puede falsificarse.

S1523 señala construcción y ejecución dinámica de código mediante `Function`. Revisar la procedencia del contenido y si estos artefactos de diseño se publican o ejecutan en un contexto con datos o credenciales reales. La ubicación en documentación no basta para declararlos seguros.

S2819 señala comunicación entre ventanas mediante `postMessage` y recepción de mensajes. Evaluar los orígenes autorizados, validar origen y estructura de mensajes y restringir el destino según el contexto real. Por CWE-345, la propuesta 2025 es A08; el metadato OWASP 2021 de la regla no determina el código 2025.

Estos hallazgos no fueron corregidos, aceptados ni marcados como falsos positivos en el servicio. Valentino debe documentar para cada uno alcance, reproducción o análisis de flujo, decisión, responsable y evidencia posterior.

## 3. Matriz de las diez categorías

| Categoría OWASP 2025 | Evidencia disponible | Estado de evaluación |
|---|---|---|
| A01 Broken Access Control | S8707/CWE-22; pruebas locales RBAC y alcance por conductor | Hallazgo por revisar; falta evaluación completa del acceso en despliegue |
| A02 Security Misconfiguration | Configuración local CORS/cookies; cobertura remota ausente y condiciones del Quality Gate sin el 90 % | Pendiente verificar despliegue y corregir configuración de análisis |
| A03 Software Supply Chain Failures | Auditorías locales npm y pip documentadas en la guía; avisos en dependencias | Pendiente tratar dependencias y verificar versiones desplegadas |
| A04 Cryptographic Failures | Pruebas locales de PBKDF2, generación de tokens y sesiones | Evidencia parcial; faltan TLS y gestión operativa de secretos |
| A05 Injection | S1523 y S8476, cuatro incidencias; alertas SQL de Bandit por revisar | Pendiente triage y corrección o justificación |
| A06 Insecure Design | Arquitectura y separación de roles documentadas | Pendiente análisis de amenazas y abuso de flujos |
| A07 Authentication Failures | Pruebas de sesión, revocación, CSRF y límites de intentos | Evidencia parcial; no se acredita cierre en producción |
| A08 Software or Data Integrity Failures | Tres incidencias S2819/CWE-345 en mensajes entre ventanas | Pendiente triage y validación de integridad de entrega/datos |
| A09 Security Logging and Alerting Failures | No se aportó evidencia operativa de alertas y monitoreo | Pendiente evaluación manual |
| A10 Mishandling of Exceptional Conditions | Pruebas locales de entradas inválidas, fallos y protección transaccional con dobles | Evidencia parcial; integración real y condiciones de recursos pendientes |

La ausencia de una incidencia asociada a una categoría no equivale a cumplimiento de esa categoría. La revisión debe completarse con la [matriz OWASP del Sprint 3](04%20OWASP%20V_1_1_0.md).

## 4. Cobertura, alcance y continuidad del análisis

Las pruebas locales previas registraron 93,92 % de líneas y 92,30 % de ramas Python, y 97,58 % de líneas y 90,24 % de ramas frontend. Esas cifras corresponden a su ejecución local, no al análisis remoto de `d36441f`. Las ejecuciones posteriores deben conservar su propio informe y SHA.

La ejecución de GitHub Actions [41101399782](https://github.com/JosefOreC/ALPHA_PROJECT/actions/runs/41101399782), para `6ba77a6`, terminó en failure: el job «Pruebas y SonarCloud» figura success y el job «Auditoría complementaria OWASP» figura failure. Las anotaciones de este último registran dos salidas de proceso con código 1; no incluyen el detalle de los hallazgos. El éxito del primer job no demuestra que el escáner se ejecutara: esa versión permite omitirlo cuando faltan variables. El análisis Sonar consultado sigue siendo `d36441f`, sin cobertura remota.

La configuración y el informe se publicaron en la rama `chore/sonarcloud-owasp-2025`, mediante el [PR #27 en borrador](https://github.com/JosefOreC/ALPHA_PROJECT/pull/27). Su primera ejecución [41102893381](https://github.com/JosefOreC/ALPHA_PROJECT/actions/runs/41102893381) se observó queued. No se presenta como análisis completado. La validación local de la configuración actualizada aprobó 376 pruebas Python, con cinco omisiones de integración, cobertura de líneas del 94,41 % y de ramas del 92,79 %.

Hay una diferencia de alcance que debe resolverse explícitamente al migrar a CI: el análisis remoto incluye `docs/04 Diseño`, `ecologistica-ui` y `src/frontend/scripts`, mientras que `sonar-project.properties` delimita el análisis operativo y no incluye esas tres rutas. **Una incidencia que deje de aparecer por una exclusión no se considerará corregida.** Mantener seguimiento separado o ampliar el alcance acordado, documentando su impacto en cobertura y resultados. No comparar las cantidades de ambos análisis como si compartieran el mismo alcance.

## 5. Integración y permisos pendientes del propietario

El propietario guardó el token en GitHub; se verificó su existencia y se repitió CI sin leer el valor. La asignación de permisos de revisión sigue a cargo del propietario y no se ha verificado ni modificado mediante esta sesión.

1. Completado por el propietario: guardar el token de SonarCloud como `SONAR_TOKEN` en [GitHub Actions Secrets](https://github.com/JosefOreC/ALPHA_PROJECT/settings/secrets/actions). No publicarlo en archivos, commits, capturas ni mensajes.
2. Completado por el propietario: desactivar Automatic Analysis y usar GitHub Actions. El intento 3 publicó un análisis y recibió Quality Gate OK.
3. Añadir o localizar a **Valentino Jhan Pierre Rojas Camayo**, GitHub `ValeRojas1`, en la organización `joseforec`. La API asocia su commit al login `ValeRojas1-6n1Tp@github`; confirmar la cuenta exacta en el selector de SonarCloud.
4. En Administration → Permissions del proyecto, habilitar los permisos disponibles para revisar código, Administer Issues y Administer Security Hotspots. Browse Project y See Source Code son controles de lectura de proyectos privados; este proyecto es público. Revisar el acceso efectivo sin convertirlo en administrador del proyecto ni compartirle el token de CI.
5. Configurar y asignar un Quality Gate con el mínimo acordado del 90 % para cobertura global y nueva, según las capacidades del plan. Los archivos locales solo pueden exigir los umbrales de las pruebas y esperar el Quality Gate remoto; no crean sus condiciones.
6. Revisar el PR #27, ejecutar CI sobre el commit acordado del Sprint 3 y verificar SHA, importación de XML/LCOV, condiciones del Quality Gate y tratamiento de las ocho vulnerabilidades antes de integrar la configuración.

La [guía técnica](../Gu%C3%ADas%20t%C3%A9cnicas/SonarCloud%20y%20OWASP%202025.md) incluye los comandos de reproducción. El código preparado incorpora los identificadores reales, permite exportar proyectos públicos sin token y distingue la rama principal verificada al consultar hotspots.

## 6. Entrega y proceso de correcciones

La evidencia original se conserva localmente en `reports/sonar/`: `sonar-report.md`, `sonar-results.json`, historial, rama, condiciones del Quality Gate y metadatos de las cuatro reglas. La carpeta se excluye de Git; el paquete `reports/sonar-owasp-2025.zip` permite compartir la exportación completa con el revisor.

Valentino puede abrir una rama de correcciones desde la referencia acordada y relacionar sus cambios con los IDs anteriores. Tras el nuevo análisis se compararán commit, alcance, incidencias y cobertura; las exclusiones y las aceptaciones deben quedar justificadas. El merge de correcciones requiere revisión y comprobaciones aprobadas. Este informe no autoriza declarar cero vulnerabilidades críticas ni cumplimiento integral de OWASP.

Fuentes de la relación CWE–OWASP: [A01:2025 / CWE-22](https://top10.owasp.org/2025/A01_2025-Broken_Access_Control/), [A05:2025 / CWE-20, 95 y 470](https://top10.owasp.org/2025/A05_2025-Injection/), [A08:2025 / CWE-345](https://top10.owasp.org/2025/A08_2025-Software_or_Data_Integrity_Failures/). Los CWE de las reglas proceden de `api/rules/show` del proyecto, conservado en la exportación.

## 7. Control de cambios

| Versión | Fecha | Cambio |
|---|---|---|
| V_1_0_0 | 30/10/2026 | Informe inicial con evidencia de SonarCloud, ocho vulnerabilidades, trazabilidad y matriz de revisión OWASP 2025. |

[← Volver al índice del Sprint 03](README.md)
