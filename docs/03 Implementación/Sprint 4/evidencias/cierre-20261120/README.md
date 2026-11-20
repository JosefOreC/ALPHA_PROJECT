# Evidencias del cierre técnico del 20/11/2026

[Volver al Sprint 4](../../README.md) · [Cierre y trazabilidad](../../08%20Cierre%20tecnico%20y%20trazabilidad%20V_1_0_0.md)

## Procedencia

Los reportes remotos proceden de los artefactos oficiales de GitHub Actions del commit `64267bd`. Los recibos conservan run IDs, fechas, resultados, enlace y caducidad de los artefactos. Los archivos de este directorio continúan disponibles aunque caduque la descarga temporal de GitHub.

| Control | Ejecución oficial | Copia conservada |
|---|---|---|
| CI | [44715557327](https://github.com/JosefOreC/ALPHA_PROJECT/actions/runs/44715557327) | [Recibos](github-actions.json). |
| Tests | [44715557858](https://github.com/JosefOreC/ALPHA_PROJECT/actions/runs/44715557858) | [JUnit](backend-remoto.xml) · [Playwright](playwright-remoto.json) · [Cobertura frontend](cobertura-frontend.json). |
| SonarCloud y seguridad | [44715557318](https://github.com/JosefOreC/ALPHA_PROJECT/actions/runs/44715557318) | [Informe completo](sonar-resultados.json) · [Gate](gate-final.json) · [Incidencias abiertas](issues-final.json) · [Rama](branches-final.json) · [Cobertura Python](cobertura-python.json). |
| Documentación | [44715557306](https://github.com/JosefOreC/ALPHA_PROJECT/actions/runs/44715557306) | [Recibos](github-actions.json). |
| Lighthouse | [44715557340](https://github.com/JosefOreC/ALPHA_PROJECT/actions/runs/44715557340) | [Valores de las tres cargas](lighthouse-remoto.json). |

## Multimedia de la demostración automatizada

| Recorrido | Video | Capturas |
|---|---|---|
| Registro de pedido por operador | [registro-pedido.webm](registro-pedido.webm) | [Pedido registrado](pedido-registrado.png). |
| Ruta y confirmación por conductor | [entrega-conductor.webm](entrega-conductor.webm) | [Ruta asignada](ruta-asignada.png) · [Entrega confirmada](entrega-confirmada.png). |
| Administración y laboratorio X/Y | [roles-y-ruta-demo.webm](roles-y-ruta-demo.webm) | [Roles y accesos](roles-y-accesos.png) · [Laboratorio](laboratorio-rutas.png). |

Los videos provienen de Chromium con backend y persistencia reales y datos sintéticos. Las verificaciones también se ejecutaron en Firefox y WebKit. El [recibo de demostración](demostracion-tecnica.json) identifica cada caso, la base Git y los hashes de las fuentes de prueba. El [recibo del verificador](recibo-grabacion.json) confirma la eliminación de la base y el rol temporales. Esta grabación es técnica; no acredita una reunión ni decisiones de aceptación.

La corrida grabada registró 11 aprobados y un fallo de latencia de salud (6202,893 ms). Se conserva el resultado; la medición sin video se adjunta como serie independiente. No se incluyen trazas con información de sesión ni credenciales temporales. Las cuentas visibles usan el dominio reservado `example.invalid`.

## Integridad y lectura

[SHA-256 de los archivos](sha256.json). Los reportes y contadores son JSON y XML legibles sin ejecutar código. Los videos WebM pueden descargarse y abrirse en un navegador compatible. El reporte HTML completo está en los artefactos de Tests y puede descargarse desde el enlace oficial de la ejecución.

SUS y Render están excluidos por indicación del usuario. No se modifican respuestas de usuarios ni se atribuyen mediciones nuevas a la encuesta histórica.

[Volver al índice del Sprint 4](../../README.md)


La [repetici?n sin grabaci?n](medicion-sin-video.json) aprob? **12/12**, sin omisiones ni reintentos, en Chromium, Firefox y WebKit. El [recibo de limpieza](recibo-medicion.json) confirma la eliminaci?n de los recursos temporales.

| Motor | TTFB (ms) | FCP (ms) | LCP (ms) | GET /health (ms) | GET /api/pedidos (ms) |
|---|---:|---:|---:|---:|---:|
| chromium | 3.30 | 36.00 | 36.00 | 4.60 | 217.71 |
| firefox | 13.00 | 177.00 | 177.00 | 6.22 | 127.26 |
| webkit | 2.00 | 85.00 | 85.00 | 5.44 | 113.24 |

Estas son muestras puntuales locales; la serie grabada fallida y las cargas remotas de Lighthouse se mantienen separadas.
