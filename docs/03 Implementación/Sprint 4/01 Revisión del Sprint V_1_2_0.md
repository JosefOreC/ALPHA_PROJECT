# Revisión del sprint

**Nombre del Proyecto:** EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Líder del Proyecto:** Ore Campos, Josef Pablo.

**Sprint:** Sprint 4.

**Versión del documento:** V_1_2_0

**Autoría:** implementación, medición y elaboración técnica asistidas por Codex, a solicitud del usuario; revisión del equipo pendiente.

**Fecha y hora de actualización:** 2026-11-13T01:40:49-05:00, America/Lima (UTC−05:00). Cada evidencia conserva además su fecha original de ejecución.

**Rama:** `refactor/mern`.

**Commit base de esta comparación:** `bd95dc9315c9e2526fcb06add520e982f8310cf6`.

**Commit de implementación analizado:** `1d525069686ad1222a1bbe8b58a018bdae2542a2`. La documentación es posterior al commit y se registra por separado.

**Estado:** las métricas exigidas cumplen en las seis corridas finales del banco móvil de producción HTTPS/HTTP/2. La consigna MERN completa conserva las brechas tecnológicas del documento 05; no se atribuye máxima calificación global ni aceptación formal.

## 1. Incremento revisado

El usuario solicitó bajar las métricas a los límites de la consigna y publicar el resultado en la misma rama. Se mantuvieron el estilo corporativo y los marcadores discretos de otras paradas de la misma ruta.

| Cambio aplicado | Comportamiento verificable | Evidencia |
|---|---|---|
| Formulario estable | Los campos permanecen montados y deshabilitados al verificar la sesión; se impide enviar el formulario antes de terminar. | [SessionToolbar](../../../src/frontend/src/interfaces/session/SessionToolbar.tsx), prueba de identidad de los nodos del formulario. |
| Acción de Pedidos | Se reserva el control superior mientras llegan los permisos, evitando mover el contenido. | [OrderManagementView](../../../src/frontend/src/interfaces/OrderManagementView.tsx). |
| Precompresión | El build genera Brotli y gzip para JS/CSS; mantiene originales y omite archivos pequeños. No añade una librería al navegador. | [Script nativo de Node](../../../src/frontend/scripts/precompress.mjs), prueba de descompresión de ambas variantes. |
| Representaciones HTTP | Selección por Accept-Encoding/calidad, MIME original, Vary y ETag de representación; fallback a originales; restricciones de rutas y métodos. | [Adaptador estático](../../../src/backend/interfaces/api/static_assets.py), 17 casos nuevos backend. |
| Despliegue HTTP/2 | Servidor opcional Hypercorn con TLS y mismo origen para React/API. | [Requisitos](../../../src/backend/requirements-http2.txt), [arranque](../../../src/backend/README.md#https-y-http2). |

## 2. Métricas y condiciones

| Métrica | Exigencia | Acceso: mediana | Pedidos: mediana | Máximo de las seis corridas |
|---|---|---|---|---|
| Score | >= 90 | 100 | 100 | 100 |
| FCP | <= 1000 ms | 768.1499 ms | 764.2762 ms | 904.735 ms |
| LCP | <= 1400 ms | 768.1499 ms | 1213.2762 ms | 1237.0107 ms |
| TBT | <= 85 ms | 0 ms | 0 ms | 0 ms |
| CLS | <= 0.02 | 0 | 0.0003636511 | 0.0003636511 |
| Transferencia | < 1100000 bytes | 92862 bytes | 101837 bytes | 102171 bytes |

Cada una de las tres corridas de cada pantalla cumple todos los límites; no se seleccionó solo la mejor. El peso usa MB decimal y se verifica el límite estricto de menos de 1100000 bytes. El [informe consolidado](evidencias/metricas-bd95dc9/auditoria-consolidada.html) enlaza los doce reportes originales y el [documento 06](06%20Auditor%C3%ADa%20consolidada%20de%20m%C3%A9tricas%20V_1_0_0.md) detalla el método y el contraste del código.

Se utilizó Lighthouse 13.6.0, Chromium headless 145.0.7632.6, perfil móvil simulado de 412 × 823, RTT 150 ms, throughput 1638,4 Kbps y CPU ×4, caché restablecida por Lighthouse, 150 pedidos ficticios y HTTP/2 tanto antes como después. Las primeras mediciones con Edge/HTTP/1.1 se conservan como diagnóstico separado: no se mezclan para atribuir mejoras al código.

## 3. Validaciones del incremento

| Control | Resultado |
|---|---|
| TypeScript/Vite y oxlint | Ambos códigos 0; sigue la advertencia del motor cartográfico diferido. |
| Frontend | 470 Vitest y 12 Node aprobadas; líneas 97,19 %, ramas 90,09 %. |
| Backend | 442 pruebas y 36 subpruebas aprobadas, 7 omitidas de integración explícita; líneas 93,98 %, ramas 90,36 %. |
| Navegador y axe | 54 aprobadas, 5 omitidas por asignación de viewport, 0 fallidas. |
| Dependencias instaladas | pip-audit posterior a instalar Hypercorn: 0 vulnerabilidades conocidas. |
| Gate de métricas | 6/6 corridas finales aprobadas, incluida carga HTTP 200 de Pedidos. |

Los recibos y salidas están en el [índice de evidencias](evidencias/metricas-bd95dc9/README.md). Se conservaron los umbrales de cobertura. Los recibos previos al commit conservan HEAD bd95dc9 y su árbol de trabajo; esos archivos de producto se incorporaron en 1d52506. No se cambian sus horas para aparentar ejecuciones posteriores.

El ejecutor de Playwright completó los 59 casos y quedó esperando el cierre de Vite en Windows. Se detuvo exclusivamente el servidor creado por esa ejecución (PID 24048, puerto 5178, inicio 13/11/2026 01:29:32 Lima); el comando terminó con código 0. No se detuvo un servicio del usuario.

## 4. Aceptación y continuidad

El cumplimiento de métricas corresponde al build y a la configuración HTTPS/HTTP/2 declarados. Uvicorn de desarrollo continúa usando HTTP/1.1 y no se acredita con estas cifras. El certificado autofirmado se usó solo en localhost; el despliegue necesita un certificado válido del dominio.

Continúan pendientes la migración MERN literal, paginación de 12 registros, picture WebP/AVIF, contraste de sustitución de librerías y el tratamiento literal de React Query. El detalle está en el documento 05 y la matriz del documento 04. La aceptación del cliente, una ceremonia de sprint y una calificación académica requieren su registro real.

## Control de versiones del documento

| Versión | Fecha | Autoría / cambio |
|---|---|---|
| V_1_0_0 | 12/11/2026 | Diagnóstico asistido por Codex, conservado en 3b5bdae. |
| V_1_1_0 | 12/11/2026 | Optimización inicial 9f953d6 y documentación d5b1d57. |
| V_1_2_0 | 13/11/2026 | Consigna original, métricas verificadas en 1d52506 y evidencias consolidadas. |

[← Volver al índice correspondiente](README.md)
