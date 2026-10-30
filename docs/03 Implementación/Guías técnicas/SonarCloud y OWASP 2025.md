# SonarCloud y OWASP Top 10:2025

[← Volver al índice de guías técnicas](README.md)

## Estado y alcance

La configuración está preparada para Python/FastAPI y React/TypeScript. **Preparar estos archivos no crea la organización, no conecta GitHub y no ejecuta SonarCloud.** Al 30/10/2026 no se ha creado el proyecto remoto ni emitido un resultado Sonar. Consultar el [informe preliminar local](Informe%20preliminar%20OWASP%202025.md).

| Dato de entrega al equipo | Estado |
|---|---|
| Repositorio | `JosefOreC/ALPHA_PROJECT` |
| Organización SonarCloud (`organization key`) | Pendiente de creación; copiar el valor real |
| Proyecto (`project key`) | Pendiente de importación; copiar el valor real |
| Enlace del proyecto | Pendiente; copiar desde el dashboard creado |
| Usuario del revisor | Pendiente de indicar su cuenta SonarCloud |
| Token | Secret `SONAR_TOKEN` de GitHub Actions; nunca incluir su valor en esta tabla |

## Alta por el propietario del repositorio

1. Entrar en [SonarQube Cloud](https://sonarcloud.io/) con GitHub. Importar el repositorio `JosefOreC/ALPHA_PROJECT` y crear/seleccionar la organización que proponga el asistente. Autorizar la aplicación de Sonar solamente para los repositorios necesarios. Mantener la visibilidad acorde con la autorización del equipo; no hacer público un repositorio privado.
2. Copiar la **organization key**, la **project key** y la URL del dashboard. No deducir estos identificadores a partir del nombre visible.
3. Seleccionar análisis mediante GitHub Actions. Desactivar **Automatic Analysis** en el proyecto cuando se habilite CI, para evitar análisis duplicados. Si Sonar exige una primera referencia de `main`, completar primero ese análisis inicial desde el asistente y comprobar el SHA analizado.
4. Generar un token con permiso **Execute Analysis** para este proyecto. Para exportar resultados de un proyecto privado, su titular también necesita permisos de lectura. Guardarlo directamente en GitHub → repositorio → **Settings → Secrets and variables → Actions → Secrets**, como `SONAR_TOKEN`. Definir una caducidad y rotarlo al vencer.
5. En **Variables**, crear `SONAR_ORGANIZATION` y `SONAR_PROJECT_KEY` con los valores reales. El workflow está dirigido a la región europea `https://sonarcloud.io`; si el alta se hace en otra región, adaptar también el host del escáner y del exportador antes de ejecutarlo.
6. Subir esta rama y abrir un PR hacia `main`. El flujo se ejecuta en los PR internos, los pushes a `main` y mediante **Actions → SonarCloud y seguridad → Run workflow** cuando esté disponible en la rama predeterminada. La disponibilidad de análisis de ramas/PR depende del plan contratado; verificarla antes de elegir esa modalidad. No contratar ni cambiar el plan como parte de esta configuración.

Los archivos preparados son `sonar-project.properties`, `.coveragerc`, `.github/workflows/sonarcloud.yml` y `scripts/export_sonar_report.py`. Las claves se pasan desde las variables de Actions; el token se pasa por entorno. Para un análisis local con SonarScanner CLI instalado, proporcionar las mismas claves mediante `-Dsonar.organization=...` y `-Dsonar.projectKey=...`, y el token mediante `SONAR_TOKEN`. Ejecutar desde la raíz y confirmar la rama y el SHA antes de enviar el análisis.

Si faltan las variables, el flujo ejecuta las pruebas y avisa que **Sonar no se ejecutó**. Si las variables existen pero falta el token, falla expresamente. Los PR de forks ejecutan pruebas sin recibir el token ni enviar análisis; el flujo usa `pull_request`, con permisos de repositorio de solo lectura.

## Acceso para el compañero

Una vez indicada su cuenta, añadirla a la organización y asignarle permisos del proyecto en **Administration → Permissions**:

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
.venv/Scripts/python.exe -m pip install -r src/backend/requirements.txt -r scripts/requirements-security.txt
New-Item -ItemType Directory -Force reports/security | Out-Null
.venv/Scripts/python.exe -m pytest src/backend/tests -q -p no:cacheprovider --cov --cov-config=.coveragerc --cov-report=xml:reports/coverage/backend.xml --junitxml=reports/tests/backend.xml
.venv/Scripts/python.exe -m coverage json -o reports/coverage/backend.json
.venv/Scripts/python.exe scripts/check_python_coverage.py
npm ci --prefix src/frontend
npm run test:coverage --prefix src/frontend
npm run build --prefix src/frontend
.venv/Scripts/python.exe -m bandit -r src/backend scripts -x src/backend/tests -f json -o reports/security/bandit.json
.venv/Scripts/python.exe -m pip freeze > reports/security/python-environment.txt
.venv/Scripts/python.exe -m pip_audit --local --format json --output reports/security/pip-audit.json --cache-dir .cache/pip-audit
npm audit --prefix src/frontend --audit-level=high --json > reports/security/npm-audit.json
```

Bandit y los auditores de dependencias devuelven un código de fallo al encontrar alertas. Cada auditoría del workflow se ejecuta aunque falle la anterior, y se conservan los JSON. CI aplica el umbral de severidad media para Bandit y alta para npm; `pip-audit` falla por cualquier vulnerabilidad conocida. La auditoría Python incluye las herramientas instaladas; el archivo de versiones permite distinguirlas de las dependencias de ejecución. Las dependencias Python de la aplicación tienen rangos abiertos y pueden resolver versiones distintas entre ejecuciones.

El análisis incluye backend, frontend, scripts, política RBAC y configuración de CI. Los tests se clasifican aparte; se excluyen de fuentes las dependencias, cachés, compilados y los mapas estáticos. La cobertura Python incluye **backend y scripts**, igual que el alcance Python enviado a Sonar; la de TypeScript, los archivos de `src` incluidos por Vitest. Las 9 pruebas adicionales de Node no contribuyen al LCOV de Vitest. PostgreSQL/PostGIS real requiere habilitar por separado las pruebas optativas; sus omisiones no son verificaciones aprobadas.

**Mínimo obligatorio: 90 %.** `.coveragerc` exige un 90 % de cobertura combinada Python. Además, `scripts/check_python_coverage.py` comprueba líneas y ramas por separado a partir del JSON, sin redondear para decidir si aprueba. Vitest exige al menos 90 % en líneas, sentencias, funciones y ramas. El workflow falla si alguna comprobación queda por debajo; conserva las evidencias de las verificaciones ejecutadas. Mantener este alcance al agregar código y pruebas. Las pruebas de los scripts usan conexiones simuladas para no administrar bases reales.

Al crear el proyecto remoto, configurar y asignar en SonarCloud un Quality Gate con cobertura mínima del 90 % para el alcance global y el código nuevo, según las opciones disponibles en el plan y los permisos. La configuración del Quality Gate pertenece al servicio; `sonar.qualitygate.wait=true` espera su resultado, pero no cambia sus condiciones. Hasta ejecutar el análisis remoto, los porcentajes documentados corresponden a las herramientas locales.

Tras un análisis remoto, descargar los artifacts `sonar-evidence-…` y `security-audits-…` desde Actions. El primero contiene cobertura, JUnit y, si la API responde con los permisos necesarios, `reports/sonar/sonar-report.md` y `sonar-results.json`. El exportador comprueba que la tarea del escáner haya terminado correctamente y obtiene su Quality Gate por `analysisId`. Incluye todas las páginas de incidencias o falla si no puede garantizar la exportación completa. Para hotspots consulta las capacidades de la API: si no anuncia filtros para la rama/PR solicitada, los marca como **no exportados**, y exige revisión en el dashboard; nunca informa cero en su lugar. Cuando son compatibles, también pagina sus resultados. Las medidas y las listas se consultan en el momento de exportar y pueden cambiar si se lanza otro análisis concurrente; confirmar análisis, rama/PR y SHA en el dashboard.

También se puede exportar desde la raíz con las variables `SONAR_TOKEN`, `SONAR_PROJECT_KEY` y, opcionalmente, `SONAR_BRANCH` o `SONAR_PULL_REQUEST`:

```powershell
.venv/Scripts/python.exe scripts/export_sonar_report.py
```

`SONAR_PULL_REQUEST` tiene prioridad sobre la rama. Sin ninguna de ambas, se consulta la rama principal. Sin `report-task.txt`, la exportación manual consulta el estado actual del proyecto. Los resultados quedan en `reports/`, ignorado por Git porque puede contener detalles de código e incidencias; conservar la evidencia aprobada en el entregable del sprint.

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
