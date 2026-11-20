# Automatización de auditoría verde y gestión de versiones

**Proyecto:** EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Versión del documento:** V_1_0_0.

**Versión de entrega:** v1.0.0.

**Fecha:** 13/11/2026.

**Revisión técnica y documental:** Ore Campos, Josef Pablo; Cueva Ricse, Alex.

**Alcance de publicación:** actualización de documentación Markdown. Las implementaciones y las mediciones descritas corresponden al incremento local auditado; sus archivos productivos y nuevos artefactos no se incorporan con esta publicación.

## 1. Integración documental de main

Se actualizó la referencia remota mediante `git fetch origin main`. La revisión documental utiliza `origin/main` en `fc11d71f34302646afd0c7aa669d8424130446fe`, que incorpora los aportes de estándares, formato y nombres de archivo. Se conserva la organización del Sprint 4 y se completa la carpeta de entrega exigida por la rúbrica.

| Aporte de main | Referencia | Integración documental |
|---|---|---|
| Estándares y reglas verdes | 26530cf, PR 41 | Actualización al estado final de las ocho áreas, ISO, GSF y WSG. |
| Guía de estilo y plantilla | 1a8b5e6, PR 42 | Metadatos, registro impersonal, secciones, tablas y validación de Markdown. |
| Nombres exactos | 2c1f814, PR 43 | Dos documentos V_1_0_0 en la ruta exigida. |

Se respetan los créditos de Tovar Sánchez, Carlos Alberto y Rojas Camayo, Valentino Jhan Pierre en los antecedentes. La revisión del presente sprint corresponde a Ore Campos, Josef Pablo y Cueva Ricse, Alex.

## 2. Workflow de auditoría

Main conserva su workflow de auditoría estática y lighthouserc.json. Su configuración se describe en el [documento CI/CD integrado](../reduccion%20del%20impacto%20ambiental/03%20Automatizacion%20CI-CD%20y%20gestion%20de%20versiones%20V_1_0_0.md). El diseño de banco HTTPS con dos escenarios y umbrales estrictos descrito a continuación es una configuración local distinta, no incluida en esta publicación de Markdown.

La propuesta local de `green-audit.yml`, distinta del [workflow existente en main](../../../.github/workflows/green-audit.yml), configura GitHub Actions para pull requests a main, cambios en main/refactor/mern y ejecución manual. La matriz separa Acceso y Pedidos. Cada trabajo instala dependencias fijadas, compila, inicia un banco HTTPS con datos ficticios y ejecuta Lighthouse CI (LHCI) tres veces.

La configuración LHCI (`lighthouserc.cjs`, registro local) aplica agregación pesimista: usa el resultado menos favorable de las réplicas. Los seis umbrales se expresan como errores; el workflow conserva el código de fallo y publica reportes como artefactos del trabajo, incluso ante aserciones fallidas. Los informes no se envían a almacenamiento público temporal.

| Control | Configuración |
|---|---|
| Score | ≥ 0,90 en la categoría de rendimiento |
| FCP / LCP / TBT | ≤ 1000 / 1400 / 85 ms |
| CLS / transferencia | ≤ 0,02 / 1100000 bytes |
| Datos | 150 pedidos sintéticos; sin base operativa ni credenciales de usuarios |
| Herramientas | @lhci/cli 0.16.1, lockfile independiente y paquetes Python fijados |
| Seguridad del trabajo | Permiso contents: read; acciones fijadas por hash; certificado efímero solo para localhost |

El navegador de GitHub se identifica durante el trabajo. Su versión y sistema operativo pueden diferir del banco histórico; los resultados remotos forman una serie independiente. La configuración de CI no cambia el arranque productivo ni desactiva la seguridad de la aplicación.

## 3. Estado de validación

Se validaron sintaxis YAML, carga de configuración y ejecución completa de LHCI. Pedidos aprobó sus tres cargas; Acceso devolvió error por una carga con TBT de 167 ms. Las otras dos cargas de Acceso registraron 0 y 24 ms. El fallo se conserva y la estabilidad del gate de Acceso queda pendiente. El detalle y los códigos de salida se conservan en [el registro de esta inspección](evidencias/inspeccion04/README.md).

La publicación en GitHub, la ejecución remota del workflow y el resultado de sus trabajos se registrarán cuando existan sus URL e identificadores. Esta publicación contiene exclusivamente Markdown. La configuración estricta local y los resultados del banco no acreditan una ejecución remota de esa configuración.

## 4. Rutas y secuencia Git de entrega

La ruta requerida contiene los dos archivos Markdown V_1_0_0. La versión semántica del paquete es v1.0.0; los nombres V_1_0_0 se mantienen por la convención documental de la rúbrica.

La siguiente secuencia es el procedimiento de publicación para la persona responsable. Los comandos de commit y push se documentan como pasos de entrega y no como operaciones ejecutadas durante esta revisión.

```powershell
git status --short
git fetch origin main
git branch --show-current
New-Item -ItemType Directory -Force -Path 'docs/03 Implementación/reduccion del impacto ambiental'
python scripts/check_docs.py
npx --yes markdownlint-cli2@0.24.1
git add -- 'docs/03 Implementación/reduccion del impacto ambiental/*.md' 'docs/03 Implementación/Sprint 4/**/*.md' 'docs/03 Implementación/Sprint 4/*.md' 'docs/03 Implementación/README.md'
git diff --cached --check
git diff --cached --stat
git commit -m "docs(green-it): consolida entrega v1.0.0 de Inspeccion 04"
git push origin refactor/mern
```

`New-Item` cumple la función de mkdir en PowerShell. El directorio Sprint 4, las fuentes de las ocho optimizaciones y sus recursos deben incluirse en una entrega coordinada; los hashes del paquete permiten comprobar esa correspondencia. Los cambios ajenos al alcance se revisan antes del staging. La integración con main se realiza mediante el procedimiento de revisión del repositorio.

### 4.1 Equivalente de creación de carpetas en Bash

```bash
mkdir -p "docs/03 Implementación/reduccion del impacto ambiental"
git status --short
git add -- "docs/03 Implementación/reduccion del impacto ambiental/"
git diff --cached --check
git commit -m "docs(green-it): prepara informes de Inspeccion 04"
git push origin refactor/mern
```

Este bloque muestra la secuencia mkdir, git add, git commit y git push requerida por la guía. La publicación completa también debe incluir el incremento de código revisado, los recursos y la configuración de auditoría; el bloque documental no sustituye esa revisión.

## 5. Referencias

- Google Chrome, [configuración de Lighthouse CI](https://googlechrome.github.io/lighthouse-ci/docs/configuration.html).
- GitHub, [sintaxis de workflows](https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions).
- [Guía de estilo del proyecto](../Gu%C3%ADas%20t%C3%A9cnicas/Gu%C3%ADa%20de%20estilo%20documental.md).

## Control de versiones del documento

| Versión | Fecha | Autoría / cambio |
|---|---|---|
| V_1_0_0 | 13/11/2026 | Ore Campos, Josef Pablo; Cueva Ricse, Alex. Revisión técnica y documental de automatización, rutas y procedimiento Git. |

[← Volver al índice del Sprint 4](README.md)
