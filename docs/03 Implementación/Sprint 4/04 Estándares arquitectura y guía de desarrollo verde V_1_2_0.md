# Estándares, arquitectura y guía de desarrollo verde

**Nombre del Proyecto:** EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Líder del Proyecto:** Ore Campos, Josef Pablo.

**Sprint:** Sprint 4.

**Versión del documento:** V_1_2_0

**Autoría:** implementación, medición y elaboración técnica asistidas por Codex, a solicitud del usuario; revisión del equipo pendiente.

**Fecha y hora de actualización:** 2026-11-13T01:40:49-05:00, America/Lima (UTC−05:00). Cada evidencia conserva además su fecha original de ejecución.

**Rama:** `refactor/mern`.

**Commit base de esta comparación:** `bd95dc9315c9e2526fcb06add520e982f8310cf6`.

**Commit de implementación analizado:** `1d525069686ad1222a1bbe8b58a018bdae2542a2`. La documentación es posterior al commit y se registra por separado.

**Estado:** métricas de la consigna original cumplidas en el banco definido. La implementación completa MERN sigue siendo parcial. Esta versión reemplaza la afirmación anterior sobre ocho áreas adaptadas como si acreditara el requisito literal.

## 1. Fuente vigente y arquitectura

La fuente vigente es la [consigna original](05%20Consigna%20original%20y%20brechas%20de%20calificaci%C3%B3n%20V_1_0_0.md) suministrada por el usuario. El stack real continúa siendo React, FastAPI y PostgreSQL/PostGIS. HTTP/2 se ofrece mediante un servidor ASGI opcional; no constituye migración a Express/MongoDB.

Se mantienen puertos, adaptadores y autorización. La optimización actual afecta al estado visual de carga y a la entrega de recursos estáticos; no incorpora lógica de dominio al navegador ni evita la autenticación de endpoints. Los recursos comprimidos conservan MIME, variantes y validadores; una representación no se confunde con el ETag de otra.

## 2. Matriz literal de las ocho áreas

| Área original | Estado real del software | Dictamen literal |
|---|---|---|
| MongoDB, select/lean e índices | Proyecciones e índices PostgreSQL; 5 → 2 consultas por resumen acreditadas en la entrega anterior. | Equivalencia SQL documentada; MongoDB/MERN pendiente. |
| Backend/frontend de 12 registros | Flota/conductores/registros usan 20; Pedidos descarga páginas de 100 y filtra el conjunto. | Pendiente adecuación literal a 12 con navegación y filtros de servidor. |
| WebP/AVIF adaptativas con picture | SVG y mapas; no hay picture adaptativo del producto. | Pendiente. |
| React.lazy/Suspense | Once vistas/componentes diferidos; punto de entrada React original conservado. | Implementado. |
| Sustitución de librerías por APIs nativas | fetch/AbortController/Intl y Node zlib para precompresión. | Se necesita acreditar la sustitución real anterior/posterior requerida, sin inventar dependencia previa. |
| SVG en línea | Iconos React y marcadores SVG existentes, con pruebas de accesibilidad. | Implementado; contraste histórico por área aún debe consolidarse con toda la consigna. |
| Cache-Control/ETag/React Query | Caché privada/304, activos inmutables y caché nativa acotada; React Query ausente. | Parcial respecto de la mención literal de React Query. |
| Brotli/Gzip | Variantes de build y negociación real para estáticos; gzip dinámico de API. | Implementado y probado. |

## 3. Umbrales y verificación

| Métrica | Exigencia | Acceso: mediana | Pedidos: mediana | Máximo de las seis corridas |
|---|---|---|---|---|
| Score | >= 90 | 100 | 100 | 100 |
| FCP | <= 1000 ms | 768.1499 ms | 764.2762 ms | 904.735 ms |
| LCP | <= 1400 ms | 768.1499 ms | 1213.2762 ms | 1237.0107 ms |
| TBT | <= 85 ms | 0 ms | 0 ms | 0 ms |
| CLS | <= 0.02 | 0 | 0.0003636511 | 0.0003636511 |
| Transferencia | < 1100000 bytes | 92862 bytes | 101837 bytes | 102171 bytes |

Las seis corridas finales cumplen todos los límites. Se verifican las condiciones del perfil y la respuesta 200 del listado, no solo el score agregado. La [auditoría](06%20Auditor%C3%ADa%20consolidada%20de%20m%C3%A9tricas%20V_1_0_0.md) presenta la configuración, los fragmentos antes/después y los enlaces a informes originales.

## 4. Reglas de desarrollo y despliegue

1. Mantener componentes y espacios estables durante la carga; no habilitar escrituras antes de verificar sesión/permisos.
2. Comprimir durante el build con APIs nativas y conservar originales como fallback. Validar ambas descompresiones.
3. Respetar calidad de codificación, MIME, Vary, validadores de representación y restricciones de rutas estáticas.
4. Auditar producción con HTTPS/HTTP/2 si esa es la configuración declarada; no atribuir las mismas cifras a Vite o Uvicorn HTTP/1.1.
5. Conservar condiciones, réplicas, resultados desfavorables, commit y horas; comprobar cada umbral sin redondearlo a favor.
6. Separar consumo estimado de electricidad medida y tráfico anual hipotético de tráfico observado.

## 5. Referencias y límites

Se conservan como marcos de calidad [ISO/IEC 25010:2023](https://www.iso.org/standard/78176.html), la [introducción GSF](https://learn.greensoftware.foundation/practitioner/introduction/) y las [Web Sustainability Guidelines](https://www.w3.org/TR/web-sustainability-guidelines/). Ninguno constituye una certificación de esta entrega. La [configuración oficial de Hypercorn](https://hypercorn.readthedocs.io/en/latest/how_to_guides/configuring.html) respalda el arranque HTTP/2 documentado.

Pasan los controles de regresión y cobertura de la revisión; la auditoría instalada no tiene vulnerabilidades conocidas. Una revisión WCAG manual, aceptación del cliente o nota académica no se infieren de esos controles. Las brechas MERN de la matriz permanecen explícitas.

## Control de versiones del documento

| Versión | Fecha | Autoría / cambio |
|---|---|---|
| V_1_0_0 | 12/11/2026 | Diagnóstico asistido por Codex, conservado en 3b5bdae. |
| V_1_1_0 | 12/11/2026 | Optimización inicial 9f953d6 y documentación d5b1d57. |
| V_1_2_0 | 13/11/2026 | Consigna original, métricas verificadas en 1d52506 y evidencias consolidadas. |

[← Volver al índice correspondiente](README.md)
