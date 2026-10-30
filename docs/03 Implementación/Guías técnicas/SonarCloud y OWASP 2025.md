# SonarCloud y OWASP Top 10:2025

[← Volver al índice de guías técnicas](README.md)

## Estado y alcance

Actualización de correcciones: esta rama usa `vite` 8.3.5 y `undici` 8.12.3 (auditoría npm sin hallazgos), composición SQL con `psycopg.sql` y cero alertas medias/altas Bandit. El prototipo de diseño carga su lógica desde `dashboard-logic.js`: ya no evalúa código recibido como texto ni importa JavaScript remoto dinámicamente. Conserva la vista inicial y las propiedades; los cambios de lógica deben editarse en ese archivo local. Los mensajes entre ventanas solo se aceptan del padre con el mismo origen, y los envíos usan un origen explícito. Las nuevas pruebas verifican el rechazo de mensajes ajenos y de código enviado por el puente del editor.

El análisis de seguridad incluye ahora también `docs/04 Diseño`, `ecologistica-ui` y `src/frontend/scripts`, para comprobar los hallazgos históricos sin retirarlos del alcance. Los exportados de diseño están excluidos únicamente de cobertura, porque no forman parte de la aplicación desplegada; siguen sujetos a las reglas de seguridad. La cobertura Python se amplía a los dos generadores frontend: 94,60 % de líneas y 92,77 % de ramas, con 383 pruebas aprobadas y cinco omisiones de integración. Frontend: 432 pruebas Vitest y once Node, líneas 97,58 % y ramas 90,38 %. La confirmación remota de estas correcciones debe registrarse con su análisis y commit.

El proyecto SonarCloud ya existe y es público. La consulta de `main` / `155a99a`, del 30/10/2026 a las 13:00:07 de Lima, registra dieciséis vulnerabilidades y Quality Gate ERROR por seguridad en código nuevo. El análisis CI posterior del PR #27 tiene Quality Gate OK y cobertura superior al 90 %, con el alcance delimitado por su configuración. El [informe remoto del Sprint 3](../Sprint%2003/06%20Informe%20SonarCloud%20V_1_0_0.md) conserva ambos resultados y sus diferencias de alcance. La configuración está en el [PR #27 en borrador](https://github.com/JosefOreC/ALPHA_PROJECT/pull/27); el token está guardado y los permisos de revisión siguen pendientes de verificar.

| Dato de entrega al equipo | Estado |
|---|---|
| Repositorio | `JosefOreC/ALPHA_PROJECT` |
| Organización SonarCloud (`organization key`) | `joseforec`, verificada mediante la API |
| Proyecto (`project key`) | `JosefOreC_ALPHA_PROJECT`, verificada mediante la API |
| Enlace del proyecto | [Resumen de main](https://sonarcloud.io/summary/overall?id=JosefOreC_ALPHA_PROJECT&branch=main) |
| Usuario del revisor | Valentino Jhan Pierre Rojas Camayo, GitHub `ValeRojas1`; confirmar su cuenta en el selector de SonarCloud |
| Token | El propietario guardó `SONAR_TOKEN`; se verificó su existencia en GitHub, sin leer el valor |
| Análisis CI | Intento 3 de 41107004270: Pruebas y SonarCloud success; Quality Gate del PR #27 OK |

El [intento 3 de CI](https://github.com/JosefOreC/ALPHA_PROJECT/actions/runs/41107004270/attempts/3), sobre `21248b1`, aprobó 378 pruebas Python y 441 frontend, con cinco omisiones de integración. Cobertura de líneas/ramas: Python 94,42 % / 92,79 %; frontend 97,58 % / 90,24 %. Después de desactivar Automatic Analysis, Sonar aceptó el análisis `aa683391-5607-478e-9138-905441b99644`: Quality Gate OK para el PR #27, cobertura 94,1 %, líneas 95,9 %, ramas 90,8 % y cobertura nueva 100 %. La condición remota de cobertura nueva sigue en 80 %, aunque CI exige el 90 %; ajustarla en el servicio si se requiere el mismo umbral remoto. La ejecución completa sigue fallando por diez alertas Bandit B608 y dos vulnerabilidades altas npm; pip-audit no encontró vulnerabilidades conocidas en su entorno. El análisis de main y sus hallazgos se conservan por separado.

## Pasos pendientes del propietario del repositorio

1. Entrar en [SonarQube Cloud](https://sonarcloud.io/) con la cuenta administradora y abrir el proyecto existente de la tabla. Comprobar su vinculación con `JosefOreC/ALPHA_PROJECT` y el acceso de la aplicación Sonar al repositorio. No crear un segundo proyecto.
2. Compartir con Valentino la URL del dashboard, organización `joseforec` y project key `JosefOreC_ALPHA_PROJECT`.
3. Seleccionar análisis mediante GitHub Actions. Desactivar **Automatic Analysis** en el proyecto cuando se habilite CI, para evitar análisis duplicados. Si Sonar exige una primera referencia de `main`, completar primero ese análisis inicial desde el asistente y comprobar el SHA analizado.
4. Generar o seleccionar un token con permiso **Execute Analysis** para este proyecto desde [My Account → Security](https://sonarcloud.io/account/security). Guardarlo directamente en [GitHub → Settings → Secrets and variables → Actions → Secrets](https://github.com/JosefOreC/ALPHA_PROJECT/settings/secrets/actions), como `SONAR_TOKEN`. Definir una caducidad y rotarlo al vencer. No compartir el token con el revisor.

   El token es el valor secreto que muestra **Generate Token**, no la project key, el nombre `alpha-github-actions` que se le asigne ni la clave de la organización. Copiar el valor generado en el campo **Secret** de GitHub y usar `SONAR_TOKEN` en **Name**. Sonar solo muestra el valor al generarlo; si ya no está disponible, generar otro. Una credencial ausente impide ejecutar CI; una credencial válida no hace aprobar un Quality Gate con vulnerabilidades.
5. Los identificadores reales ya están en `sonar-project.properties`; el workflow actualizado no necesita variables adicionales para ellos. Si todavía se ejecuta la versión anterior del workflow del commit `6ba77a6`, esa versión sí requiere `SONAR_ORGANIZATION=joseforec` y `SONAR_PROJECT_KEY=JosefOreC_ALPHA_PROJECT` en Variables. La configuración apunta a `https://sonarcloud.io`.
6. Subir esta rama y abrir un PR hacia `main`. El flujo se ejecuta en los PR internos, los pushes a `main` y mediante **Actions → SonarCloud y seguridad → Run workflow** cuando esté disponible en la rama predeterminada. La disponibilidad de análisis de ramas/PR depende del plan contratado; verificarla antes de elegir esa modalidad. No contratar ni cambiar el plan como parte de esta configuración.

Los archivos preparados son `sonar-project.properties`, `.coveragerc`, `.github/workflows/sonarcloud.yml` y `scripts/export_sonar_report.py`. Las claves públicas están en el archivo de propiedades; el token se pasa por entorno. Para un análisis local con SonarScanner CLI instalado, usar ese archivo y `SONAR_TOKEN`. Ejecutar desde la raíz y confirmar la rama y el SHA antes de enviar el análisis.

El workflow actualizado falla expresamente si falta el token; no omite el análisis por variables de identificación ausentes. Los PR de forks ejecutan pruebas sin recibir el token ni enviar análisis; el flujo usa `pull_request`, con permisos de repositorio de solo lectura.

## Acceso para el compañero

Añadir o localizar a `ValeRojas1` en la organización y asignarle permisos del proyecto en **Administration → Permissions**. Confirmar la cuenta SonarCloud exacta: el historial del análisis asocia su commit al login `ValeRojas1-6n1Tp@github`. Ser Collaborator de GitHub no verifica ni concede por sí solo estos permisos en SonarCloud:

| Permiso | Finalidad |
|---|---|
| Browse Project | Consultar el proyecto privado y sus resultados |
| See Source Code | Revisar el código de un proyecto privado |
| Administer Issues | Gestionar estados de incidencias, incluidos falsos positivos |
| Administer Security Hotspots | Revisar hotspots y cambiar su estado con justificación |

Los proyectos públicos tienen reglas de lectura distintas. Revisar los permisos efectivos después del alta. Estos permisos de revisión no requieren compartir el token de CI ni conceder administración del proyecto.

Referencia: [permisos del proyecto](https://docs.sonarsource.com/sonarqube-cloud/managing-your-projects/administering-your-projects/setting-permissions).

## Ejecución y evidencias

Para reproducir las verificaciones locales en PowerShell:

```powershell
.venv/Scripts/python.exe -m pip install --only-binary=:all: --require-hashes -r scripts/requirements-ci.lock
New-Item -ItemType Directory -Force reports/security | Out-Null
.venv/Scripts/python.exe -m pytest src/backend/tests -q -p no:cacheprovider --cov --cov-config=.coveragerc --cov-report=xml:reports/coverage/backend.xml --junitxml=reports/tests/backend.xml
.venv/Scripts/python.exe -m coverage json -o reports/coverage/backend.json
.venv/Scripts/python.exe scripts/check_python_coverage.py
npm ci --ignore-scripts --prefix src/frontend
npm run test:coverage --prefix src/frontend
npm run build --prefix src/frontend
.venv/Scripts/python.exe -m bandit -r src/backend scripts -x src/backend/tests -f json -o reports/security/bandit.json
.venv/Scripts/python.exe -m pip freeze > reports/security/python-environment.txt
.venv/Scripts/python.exe -m pip_audit --local --format json --output reports/security/pip-audit.json --cache-dir .cache/pip-audit
npm audit --prefix src/frontend --audit-level=high --json > reports/security/npm-audit.json
```

Bandit y los auditores de dependencias devuelven un código de fallo al encontrar alertas. Cada auditoría del workflow se ejecuta aunque falle la anterior, y se conservan los JSON. CI aplica el umbral de severidad media para Bandit y alta para npm; `pip-audit` falla por cualquier vulnerabilidad conocida. La auditoría Python incluye las herramientas instaladas; el archivo de versiones permite distinguirlas de las dependencias de ejecución. Los requirements de desarrollo mantienen sus rangos; CI instala exclusivamente las versiones y hashes de `scripts/requirements-ci.lock`, con ruedas binarias y sin ejecutar builds de paquetes. npm usa su lockfile sin scripts lifecycle. La compilación y las pruebas se ejecutan explícitamente después.

Para actualizar el lock Python, revisar `scripts/requirements-ci.in` y `scripts/requirements-ci.constraints.txt` y regenerarlo con `uv pip compile scripts/requirements-ci.in --universal --python-version 3.14 --generate-hashes --only-binary=:all: --output-file scripts/requirements-ci.lock`. La generación inicial se verificó con uv 0.13.6, instalación real en Windows y resolución binaria para Linux. Las nuevas versiones deben volver a pasar pruebas y auditorías. El comprobador de cobertura solo lee `reports/coverage/backend.json`; no admite una ruta arbitraria por argumento.

El análisis incluye backend, frontend, scripts, política RBAC y configuración de CI. Los tests se clasifican aparte; se excluyen de fuentes las dependencias, cachés, compilados y los mapas estáticos. La cobertura Python incluye **backend y scripts**, igual que el alcance Python enviado a Sonar; la de TypeScript, los archivos de `src` incluidos por Vitest. Las 9 pruebas adicionales de Node no contribuyen al LCOV de Vitest. PostgreSQL/PostGIS real requiere habilitar por separado las pruebas optativas; sus omisiones no son verificaciones aprobadas.

**Mínimo obligatorio: 90 %.** `.coveragerc` exige un 90 % de cobertura combinada Python. Además, `scripts/check_python_coverage.py` comprueba líneas y ramas por separado a partir del JSON, sin redondear para decidir si aprueba. Vitest exige al menos 90 % en líneas, sentencias, funciones y ramas. El workflow falla si alguna comprobación queda por debajo; conserva las evidencias de las verificaciones ejecutadas. Mantener este alcance al agregar código y pruebas. Las pruebas de los scripts usan conexiones simuladas para no administrar bases reales.

Al crear el proyecto remoto, configurar y asignar en SonarCloud un Quality Gate con cobertura mínima del 90 % para el alcance global y el código nuevo, según las opciones disponibles en el plan y los permisos. La configuración del Quality Gate pertenece al servicio; `sonar.qualitygate.wait=true` espera su resultado, pero no cambia sus condiciones. Hasta ejecutar el análisis remoto, los porcentajes documentados corresponden a las herramientas locales.

Tras un análisis remoto, descargar los artifacts `sonar-evidence-…` y `security-audits-…` desde Actions. El primero contiene cobertura, JUnit y, si la API responde con los permisos necesarios, `reports/sonar/sonar-report.md` y `sonar-results.json`. El exportador comprueba que la tarea del escáner haya terminado correctamente y obtiene su Quality Gate por `analysisId`. Incluye todas las páginas de incidencias o falla si no puede garantizar la exportación completa. Para hotspots consulta las capacidades de la API: si no anuncia filtros para la rama/PR solicitada, los marca como **no exportados**, y exige revisión en el dashboard; nunca informa cero en su lugar. Cuando son compatibles, también pagina sus resultados. Las medidas y las listas se consultan en el momento de exportar y pueden cambiar si se lanza otro análisis concurrente; confirmar análisis, rama/PR y SHA en el dashboard.

También se puede exportar desde la raíz con las variables `SONAR_TOKEN`, `SONAR_PROJECT_KEY` y, opcionalmente, `SONAR_BRANCH` o `SONAR_PULL_REQUEST`:

```powershell
.venv/Scripts/python.exe scripts/export_sonar_report.py
```

`SONAR_PULL_REQUEST` tiene prioridad sobre la rama. Sin ninguna de ambas, se consulta la rama principal. Para este proyecto público basta con `SONAR_PROJECT_KEY=JosefOreC_ALPHA_PROJECT`; no se necesita token para consultar sus resultados públicos. Sin `report-task.txt`, la exportación manual consulta el análisis actual del proyecto, conserva su SHA y comprueba que no cambie durante la exportación. Para hotspots sin filtro de rama en la API, solo usa la consulta predeterminada cuando ha verificado que la rama solicitada es la principal. Los resultados quedan en `reports/`, ignorado por Git porque puede contener detalles de código e incidencias; conservar la evidencia aprobada en el entregable del sprint.

## Matriz de revisión OWASP 2025

OWASP Top 10 es una clasificación de riesgos. El informe debe registrar herramientas, versiones, commit, hallazgos, evidencia y revisiones pendientes; la ausencia de alertas automáticas no demuestra ausencia de vulnerabilidades. Si Sonar ofrece únicamente una clasificación anterior en el plan/versión utilizados, documentar la relación entre la regla/CWE y la categoría **2025**, sin renombrar categorías de 2021.

| Categoría oficial 2025 | Evidencia automática y revisión complementaria |
|---|---|
| A01 Broken Access Control | Pruebas RBAC/IDOR de `test_access_control.py`, denegación de permisos y alcance por conductor; revisar acceso horizontal y SSRF donde aplique. |
| A02 Security Misconfiguration | Sonar y revisión de CORS, cookies, cabeceras HTTP, secretos, documentación expuesta y configuración efectiva del despliegue. |
| A03 Software Supply Chain Failures | `npm audit`, `pip-audit`, lockfile, origen de paquetes y acciones fijadas por SHA; revisar actualización y proceso de publicación. |
| A04 Cryptographic Failures | Reglas/hotspots, PBKDF2 y generación de tokens; comprobar TLS, protección de datos, ciclo de vida y almacenamiento de secretos. |
| A05 Injection | Reglas de inyección de Sonar y alertas de Bandit; revisar SQL parametrizado, comandos, contenido HTML y entradas controladas por clientes. |
| A06 Insecure Design | Revisión de amenazas, separación de roles, límites de uso y abuso de flujos; requieren evaluación de diseño. |
| A07 Authentication Failures | Pruebas de login, revocación, CSRF y sesiones; revisar bloqueo de intentos, expiración y flujos de recuperación. |
| A08 Software or Data Integrity Failures | Revisar integridad de artefactos, migraciones y datos; comprobar validación y protección del proceso de entrega. |
| A09 Security Logging and Alerting Failures | Verificar auditoría real de autenticación y autorización, redacción de secretos, retención, monitoreo y alertas. |
| A10 Mishandling of Exceptional Conditions | Pruebas de errores de base de datos, entradas inválidas y fallos de red; comprobar rollback, límites de recursos y comportamiento seguro ante errores. |

Por hallazgo registrar: ID original, herramienta/regla, CWE, categoría 2025 razonada, severidad, archivo/línea, evidencia reproducible, decisión de revisión, responsable, corrección y análisis de verificación. Un hotspot es código sensible pendiente de evaluación; su estado Safe o Fixed necesita evidencia.

Fuente de las categorías: [OWASP Top 10:2025](https://top10.owasp.org/2025/). Funcionamiento de CI: [documentación oficial SonarCloud para GitHub Actions](https://docs.sonarsource.com/sonarqube-cloud/advanced-setup/ci-based-analysis/github-actions-for-sonarcloud).

## Cierre de Sprint 3 y correcciones

1. Identificar el commit del Sprint 3 integrado que realmente se analizó y conservar su informe inicial. El informe preliminar local no sustituye ese análisis.
2. Crear una rama de correcciones desde la referencia acordada. Relacionar cada cambio con sus incidencias y revisar los hotspots.
3. Abrir/actualizar el PR, repetir análisis y pruebas y conservar las evidencias anteriores y posteriores. Configurar las comprobaciones requeridas en la protección de `main`; agregar el workflow por sí solo no bloquea merges.
4. Aprobar el merge cuando se cumpla el Quality Gate acordado, se revisen los hotspots, se traten las alertas complementarias y se documenten las diez categorías con las limitaciones pendientes. No marcar cumplimiento OWASP basándose únicamente en un Quality Gate verde.
