# Automatización CI/CD y gestión de versiones con Git

**Nombre del Proyecto:** EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Líder del Proyecto:** Ore Campos, Josef Pablo

**Versión del documento:** V_1_0_0

**Autor:** Equipo de desarrollo EcoLogística Lima

**Actualización documental:** 13/11/2026.

**Alcance:** flujo de integración continua `green-audit.yml` con Lighthouse CI (LHCI), estructura de directorios del criterio, versionado semántico `v1.0.0` y secuencia de comandos Git CLI utilizada (criterio «Automatización CI/CD y gestión de versiones con Git» de la rúbrica de la Inspección 04).

## 1. Flujo de integración continua `green-audit.yml`

El archivo [`.github/workflows/green-audit.yml`](../../../.github/workflows/green-audit.yml) ejecuta una auditoría automatizada del frontend con Lighthouse CI. La configuración de la auditoría está en [`lighthouserc.json`](../../../lighthouserc.json), en la raíz del repositorio.

### 1.1 Eventos y permisos

| Elemento | Configuración | Motivo |
|---|---|---|
| `push` | Rama `main` y etiquetas `v*.*.*` | Audita cada integración y cada versión publicada. |
| `pull_request` | Hacia `main` (`opened`, `synchronize`, `reopened`, `ready_for_review`) | Detecta regresiones antes de integrar. |
| `workflow_dispatch` | Ejecución manual | Permite repetir la auditoría sin un commit nuevo. |
| `permissions` | `contents: read` | Principio de mínimo privilegio; el flujo no escribe en el repositorio. |
| `concurrency` | Cancela ejecuciones anteriores de la misma rama | Evita consumo innecesario de cómputo en el runner (Green IT). |

### 1.2 Pasos del trabajo `lighthouse`

| # | Paso | Comando o acción |
|---|---|---|
| 1 | Obtener código | `actions/checkout` v4.2.2 (fijada por SHA, sin credenciales persistidas) |
| 2 | Configurar Node.js 24 con caché npm | `actions/setup-node` v4.4.0, caché sobre `src/frontend/package-lock.json` |
| 3 | Instalar dependencias | `npm ci --ignore-scripts --prefix src/frontend` |
| 4 | Compilar el frontend de producción | `npm run build` (`tsc -b && vite build`) en `src/frontend` |
| 5 | Ejecutar Lighthouse CI | `npx @lhci/cli@0.15.1 autorun --config=./lighthouserc.json` |
| 6 | Resumen de puntuaciones | Tabla de las cuatro categorías en el resumen del job (`GITHUB_STEP_SUMMARY`) |
| 7 | Guardar reportes | `actions/upload-artifact` v4.6.2: reportes HTML y JSON durante 30 días |

Las acciones se fijan por SHA de commit, igual que en los flujos `documentacion.yml` y `sonarcloud.yml`, para que una etiqueta movida no cambie el código ejecutado.

### 1.3 Configuración de Lighthouse CI

| Fase | Configuración en `lighthouserc.json` |
|---|---|
| `collect` | Sirve `src/frontend/dist` con el servidor estático de LHCI en modo SPA y audita la raíz `/` tres veces (perfil móvil por defecto de Lighthouse). |
| `assert` | Mediana de las tres ejecuciones: accesibilidad ≥ 90 (error, bloquea el flujo); rendimiento ≥ 80, buenas prácticas ≥ 90 y SEO ≥ 90 (advertencia). |
| `upload` | `target: filesystem` en `reports/lighthouse/`; los reportes no se envían a servicios externos y se conservan como artefacto del job. |

La accesibilidad es bloqueante porque el proyecto ya cumple WCAG (documento de Sprint 3) y una regresión afecta a usuarios reales. Las demás categorías emiten advertencias para no bloquear integraciones por variaciones del entorno del runner.

La aplicación exige inicio de sesión, por lo que la URL pública auditada es la pantalla de acceso. Las vistas autenticadas se miden manualmente con Chrome DevTools, según el documento [01 Informe de reducción del impacto ambiental](01%20Informe%20de%20reduccion%20del%20impacto%20ambiental%20V_1_0_0.md).

### 1.4 Ejecución local de verificación

Se ejecutó `npx @lhci/cli@0.15.1 autorun` el 13/11/2026 sobre la compilación de producción (base `fc11d71`, Chrome local de Windows 11). Resultado de la ejecución representativa:

| Categoría | Puntuación | Umbral |
|---|---|---|
| Rendimiento | 94 | ≥ 80 |
| Accesibilidad | 100 | ≥ 90 |
| Buenas prácticas | 100 | ≥ 90 |
| SEO | 91 | ≥ 90 |

Las tres ejecuciones dieron los mismos valores y todas las aserciones se cumplieron. Para reproducirla:

```bash
npm ci --ignore-scripts --prefix src/frontend
npm run build --prefix src/frontend
npx --yes @lhci/cli@0.15.1 autorun --config=./lighthouserc.json
```

## 2. Estructura de directorios

Los documentos del criterio se organizan en `docs/03 Implementación/reduccion del impacto ambiental/`:

```text
docs/
└── 03 Implementación/
    └── reduccion del impacto ambiental/
        ├── README.md
        ├── 01 Informe de reduccion del impacto ambiental V_1_0_0.md
        ├── 02 Estandares Ingeniería de software V_1_0_0.md
        └── 03 Automatizacion CI-CD y gestion de versiones V_1_0_0.md
```

## 3. Gestión de versiones

El proyecto sigue [Versionado Semántico 2.0.0](https://semver.org/lang/es/) (`MAYOR.MENOR.PARCHE`). La versión inicial publicada es **v1.0.0** y se representa en:

| Mecanismo | Valor |
|---|---|
| Etiqueta Git anotada | `v1.0.0` |
| [`VERSION`](../../../VERSION) | `1.0.0` |
| `src/frontend/package.json` y `package-lock.json` | `"version": "1.0.0"` |
| [`CHANGELOG.md`](../../../CHANGELOG.md) | Sección `[1.0.0]` |

Reglas de incremento: **MAYOR** para cambios incompatibles de la API o del modelo de datos; **MENOR** para funcionalidades compatibles; **PARCHE** para correcciones. Los documentos mantienen su propia versión en el nombre (`V_X_Y_Z`), según la [Guía de estilo documental](../Gu%C3%ADas%20t%C3%A9cnicas/Gu%C3%ADa%20de%20estilo%20documental.md).

## 4. Secuencia de comandos Git CLI

Comandos ejecutados en la rama `feature/spr4/green-it/green-audit`:

```bash
# 1. Crear los directorios (idempotente: no modifica los existentes)
mkdir -p "docs/03 Implementación/reduccion del impacto ambiental"

# 2. Verificar la estructura generada
ls -la "docs/03 Implementación/reduccion del impacto ambiental"

# 3. Preparar los archivos (rutas explícitas, sin temporales ni secretos)
git status --short
git add .github/workflows/green-audit.yml lighthouserc.json VERSION CHANGELOG.md \
  .gitignore README.md src/frontend/package.json src/frontend/package-lock.json \
  "docs/03 Implementación/reduccion del impacto ambiental"

# 4. Registrar los cambios
git commit -m "ci(green-it): auditoría Lighthouse CI y versión v1.0.0"

# 5. Publicar los cambios
git push -u origin feature/spr4/green-it/green-audit

# Etiqueta de versión
git tag -a v1.0.0 -m "EcoLogística Lima v1.0.0"
git push origin v1.0.0
```

Los reportes generados (`reports/`, `.lighthouseci/`) y las dependencias (`node_modules/`) están excluidos en `.gitignore`.

[← Volver al índice correspondiente](README.md)
