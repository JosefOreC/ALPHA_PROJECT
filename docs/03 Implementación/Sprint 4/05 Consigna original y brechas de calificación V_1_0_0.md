# Consigna original y brechas para la máxima calificación

**Nombre del Proyecto:** EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Líder del Proyecto:** Ore Campos, Josef Pablo.

**Sprint:** Sprint 4.

**Versión del documento:** V_1_0_0

**Autoría:** contraste técnico asistido por Codex, a solicitud del usuario.

**Fecha y hora del contraste:** 12/11/2026, 22:20:42, America/Lima (UTC−05:00).

**Rama y commit inspeccionado:** `refactor/mern`, `d5b1d57`; código de implementación `9f953d6acc79d569d3896ab1e2a161d8321b3720` y línea base `3b5bdae3930856101e8f8d7955813bc9ddaa9619`. Este documento es posterior a esos commits.

**Fuente:** imagen de la consigna y del descriptor de máxima calificación suministrada por el usuario en esta conversación después de la entrega de d5b1d57. Transcripción de contenido; la captura no se presenta como un archivo ya guardado en el repositorio.

**Estado:** requisitos originales identificados. La implementación anterior satisface parcialmente esta consigna; no acredita todavía la máxima calificación.

## 1. Consigna de la columna izquierda

> Refactorización Técnica MERN, Diagnóstico y Análisis del Impacto Ambiental (Green IT / SWDM): Evaluación del cumplimiento comprobable de las 8 áreas de optimización full-stack en MERN (consultas magras .select()/.lean() e índices en MongoDB, paginación backend/frontend de 12 registros, imágenes WebP/AVIF adaptativas con &lt;picture&gt;, React.lazy/Suspense para code splitting, sustitución de librerías por APIs nativas, inlining de SVGs, cabeceras Cache-Control/ETag/React Query y compresión Brotli/Gzip) con código fuente comparativo ANTES y DESPUÉS; junto con la precisión matemática en las métricas de rendimiento Lighthouse (score ≥ 90, FCP ≤ 1.0 s, LCP ≤ 1.4 s, TBT ≤ 85 ms, CLS ≤ 0.02, peso total < 1.1 MB) y el cálculo de g CO₂e mediante el modelo SWDM v4.

## 2. Descriptor de máxima calificación de la columna derecha

> Implementan correctamente las 8 optimizaciones MERN mostrando fragmentos de código ANTES y DESPUÉS en cada área; alcanza un score de rendimiento Lighthouse ≥ 90/100, FCP ≤ 1.0 s, LCP ≤ 1.4 s, TBT ≤ 85 ms y peso de transferencia ≤ 1.1 MB; realiza los cálculos de consumo energético (kWh) y emisión de CO₂e con el modelo SWDM v4 sin errores matemáticos, proyectando el ahorro anual y respaldando los resultados con reportes consolidados de auditoría.

Se exige también CLS ≤ 0,02 porque figura en la consigna izquierda. Para el peso se adopta el límite estricto de la consigna: menos de 1100000 bytes (MB decimal). No se sustituye FCP ≤ 1,0 s por un umbral de 1,8 s ni LCP ≤ 1,4 s por 2,5 s. La imagen no especifica dispositivo, perfil de red, página, caché ni número de repeticiones; se deben declarar y conservar las condiciones de cada auditoría, sin cambiar el perfil para ocultar fallos.

## 3. Contraste de las ocho optimizaciones

| Área exigida | Evidencia existente en el código inspeccionado | Brecha respecto de la consigna literal |
|---|---|---|
| MongoDB, select/lean e índices | SQL con proyecciones e índices PostgreSQL y menos consultas repetidas. | Falta MongoDB/Mongoose en backend Express/Node; equivalencia conceptual SQL no acredita MERN literal. |
| Paginación backend/frontend de 12 registros | Flota, conductores y registros solicitan 20; Pedidos descarga hasta 20 páginas de 100 mediante loadAll antes de filtrar localmente. | Debe pedir y mostrar páginas de 12, sin precargar todas las páginas; filtros y permisos antes de paginar. La afirmación anterior de que Pedidos ya cumplía paginación UI era insuficiente. |
| WebP/AVIF adaptativas con picture | Iconos SVG y teselas externas; no hay un picture WebP/AVIF del producto. | La ausencia de fotografías no acredita este requisito literal. Hace falta un recurso pertinente con tamaños, formatos y dimensiones reservadas, probado en distintos viewports. |
| React.lazy/Suspense | Once vistas/componentes diferidos. | Implementado; falta organizar los fragmentos comparativos por esta área dentro de la entrega consolidada. |
| Sustitución de librerías por APIs nativas | Se usan fetch, AbortController, Intl y una caché nativa; el paquete frontend mantiene seis dependencias directas. | Debe demostrarse una sustitución real con dependencia/uso anterior y alternativa posterior. No puede inventarse una librería que no existía. |
| SVG en línea | Iconos React y marcadores SVG integrados. | Existe implementación; falta presentar el contraste verificable antes/después y no atribuirle un ahorro aislado sin medirlo. |
| Cache-Control/ETag/React Query | ETag privado, 304, no-store y caché nativa acotada; React Query no está instalado. | Hay cumplimiento parcial. La consigna menciona React Query y no debe declararse satisfecho literalmente sin implementar o acordar expresamente su alternativa. |
| Brotli/Gzip | Gzip HTTP comprobado: 36430 → 1232 bytes en la respuesta sintética. | Gzip satisface la alternativa de compresión; se deben adjuntar ambos fragmentos y preservar la prueba HTTP. |

El stack actual es React + FastAPI + PostgreSQL/PostGIS. El nombre refactor/mern no cambia las tecnologías ejecutadas. Migrar a MERN afecta autenticación, permisos, persistencia, transacciones y cálculo geográfico; no equivale a añadir un ejemplo Express desconectado del software.

## 4. Umbrales: auditorías móviles existentes

Datos de [comparacion.json](evidencias/optimizacion-3b5bdae/comparacion.json), medianas de tres ejecuciones por pantalla, build de producción, Lighthouse 13.6.0 y Edge 157, throttling móvil simulado, datos ficticios por HTTP local. Se conserva la comparación original sin cambiar sus condiciones.

| Métrica | Umbral exigido | Acceso después | ¿Cumple? | Pedidos después | ¿Cumple? |
|---|---|---|---|---|---|
| Score de rendimiento | ≥ 90/100 | 99 | Sí | 99 | Sí |
| FCP | ≤ 1000 ms | 1237,51 ms | No | 1234,97 ms | No |
| LCP | ≤ 1400 ms | 1237,51 ms | Sí | 1981,68 ms | No |
| TBT | ≤ 85 ms | 0 ms | Sí | 0 ms | Sí |
| CLS | ≤ 0,02 | 0,0753889 | No | 0,0319047 | No |
| Transferencia | < 1100000 bytes | 107355 bytes | Sí | 119920 bytes | Sí |

La reducción del 77,8 % y el score de 99 son mejoras reales, pero no compensan FCP, LCP o CLS que incumplen. No se declara máxima calificación a partir del score agregado.

## 5. Cálculo ambiental y evidencia pendiente

El informe 03 ya registra bytes, energía y emisiones estimadas, unidades, intensidad de carbono, escenario anual hipotético y ejecutor reproducible. Para consolidarlo se deben presentar las contribuciones operativas e incorporadas por segmento y las fórmulas con todos sus parámetros, además de validar automáticamente la aritmética y las conversiones. Las visitas anuales no observadas seguirán etiquetadas como escenario.

La fuente primaria [SWDM v4](https://sustainablewebdesign.org/estimating-digital-emissions/) se volvió a consultar el 12/11/2026. Sus intensidades operativas publicadas son 0,055, 0,059 y 0,080 kWh/GB; las incorporadas equivalentes son 0,012, 0,013 y 0,081 kWh/GB. La suma de 0,300 usada anteriormente corresponde a ambos componentes con intensidad global de 494 g CO₂e/kWh, primera visita y hosting verde cero. Debe diferenciarse energía operativa de energía equivalente incorporada al desglosar los resultados.

Los reportes consolidados deberán reunir: identificación de commits y entorno; ocho pares de fragmentos reales; métricas y dictamen por umbral; desglose SWDM; ahorro anual parametrizado; vínculos a informes originales y resultado global. La existencia de doce informes Lighthouse separados no sustituye por sí sola esa presentación consolidada.

## 6. Alcance de la corrección

Esta consigna original sustituye las suposiciones de cumplimiento reconstruido de los documentos 01 y 04. La revisión, retrospectiva e informe ambiental anteriores se conservan como evidencia del trabajo realizado, pero sus declaraciones sobre ocho áreas adaptadas no acreditan las ocho áreas MERN literales.

Se solicitó al usuario definir si la siguiente implementación debe migrar a MERN conservando las funciones actuales, o conservar el stack mediante una adaptación expresamente aceptada. Mientras no exista esa respuesta no se presenta la adaptación como decisión del evaluador ni como autorización para sustituir la persistencia del producto.

## Control de versiones del documento

| Versión | Fecha | Autoría / cambio |
|---|---|---|
| V_1_0_0 | 12/11/2026 | Contraste asistido por Codex a partir de la imagen original suministrada por el usuario; se explicitan requisitos, brechas y umbrales. |

[← Volver al índice correspondiente](README.md)
