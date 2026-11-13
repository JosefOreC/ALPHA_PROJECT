# Estándares, arquitectura y guía de desarrollo verde

**Nombre del Proyecto:** EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Líder del Proyecto:** Ore Campos, Josef Pablo

**Sprint:** Sprint 4, en curso.

**Versión del documento:** V_1_0_0

**Autoría:** elaboración técnica asistida por Codex, por solicitud del usuario; revisión del equipo pendiente.

**Fecha y hora de corte:** 12/11/2026, 20:56:09, America/Lima (UTC−05:00).

**Actualización documental:** 12/11/2026, 21:11:30, America/Lima.

**Rama y commit analizados:** `refactor/mern`, `7ea33a185619d5c06ab8ce8c090b3e334b45a9ce`.

**Alcance:** actualización técnica de las ocho áreas recogidas en la documentación de la Inspección 04, su arquitectura y el plan verificable de desarrollo verde. No constituye certificación ni una migración MERN.

## 1. Fuentes y criterio de evaluación

El [documento de estándares existente](../reduccion%20del%20impacto%20ambiental/02%20Estandares%20Ingenier%C3%ADa%20de%20software%20V_1_0_1.md) adapta el ejemplo MERN al stack real. Se reutiliza su fundamentación en ISO/IEC 25010, Green Software Foundation (GSF), intensidad de carbono del software y Web Sustainability Guidelines (WSG). Esta edición verifica el código local; no revalida ediciones de normas ni sus numerales en fuentes externas.

«Implementado» indica presencia de código; «parcial» indica que faltan extensión, medición o validación; «pendiente» indica ausencia de implementación o de evidencia necesaria. Una configuración o una prueba aprobada no demuestra por sí sola conformidad con una norma. No se calcula una puntuación sin la rúbrica original.

## 2. Arquitectura y correspondencia con el marco existente

| Marco documentado | Aplicación observable | Evidencia y límite |
|---|---|---|
| ISO/IEC 25010: eficiencia y mantenibilidad, según el documento base | Separación de responsabilidades y adaptadores; optimización potencial de consultas, transferencia y carga inicial. | Capas en backend y frontend; [prueba arquitectónica](../../../src/backend/tests/test_architecture.py), incluida en la ejecución backend. No se acredita cumplimiento integral ni se usan métricas antiguas como actuales. |
| GSF: eficiencia energética, de hardware y de carbono | Paginación de pedidos, carga diferida del mapa y componentes compartidos. | Código de pedidos y mapa. No se midió energía; no se implementó programación de cargas según intensidad de carbono. |
| WSG, según la correspondencia del documento base | Recursos SVG, carga modular, reducción de consultas y dependencias acotadas. | [App.tsx](../../../src/frontend/src/App.tsx), [iconos](../../../src/frontend/src/shared/ui/icons.tsx), persistencia y [package.json](../../../src/frontend/package.json). Falta comparación de rendimiento y no se acredita conformidad W3C. |
| Estilo documental del proyecto | Metadatos, versión, secciones numeradas, referencias, control de cambios e índices. | [Guía de estilo](../Gu%C3%ADas%20t%C3%A9cnicas/Gu%C3%ADa%20de%20estilo%20documental.md) y validadores registrados en evidencias. |

Backend conserva `domain`, `application`, `infrastructure` e `interfaces`; React conserva capas equivalentes, funcionalidades del dashboard y UI compartida. Los marcadores de contexto se derivan de pedidos válidos y rutas visibles, respetando el alcance del conductor definido en `prepareMap`; no amplían los permisos del usuario.

La estructura física no demuestra todos los principios SOLID. La composición API y el adaptador de portal concentran varias responsabilidades y son candidatos de revisión futura. La refactorización deberá mantener los contratos de autorización, transacciones, idempotencia y concurrencia ya existentes.

## 3. Matriz de las ocho áreas

| N.º | Área de la rúbrica documentada y adaptación | Estado actual | Evidencia concreta | Trabajo y condición de cierre |
|---|---|---|---|---|
| 1 | `.select()`/`.lean()` e índices MongoDB → proyecciones SQL e índices PostgreSQL. | Parcial. | [Pedidos](../../../src/backend/infrastructure/persistence/postgres_orders.py) usa columnas explícitas; [flota](../../../src/backend/infrastructure/persistence/postgres_fleet.py), [dashboard](../../../src/backend/infrastructure/persistence/postgres_dashboard.py), [portal](../../../src/backend/infrastructure/persistence/postgres_portal.py) y [autenticación](../../../src/backend/infrastructure/security.py) conservan `SELECT *`; diez índices explícitos en el esquema. | Seleccionar campos usados, consolidar consultas repetidas y medir planes/latencia sobre datos equivalentes; no eliminar campos necesarios para seguridad o transacciones. |
| 2 | Paginación en backend y frontend. | Parcial. | Pedidos aplica `LIMIT`/`OFFSET`; flota y conductores cargan listas completas; auditoría/incidencias usan un límite fijo de 200, que no constituye paginación navegable. | Extender contratos paginados y controles UI donde corresponda; orden estable, filtros y permisos coherentes, pruebas de límites y páginas vacías. |
| 3 | WebP/AVIF y medios adaptativos → recursos gráficos adecuados. | Parcial; adaptación pendiente de ratificación. | Iconos SVG, mapa vectorial con respaldo ráster, fuentes externas en el HTML. No se identificó una galería de fotografías para aplicar `<picture>`. | Medir teselas/fuentes, acordar la aplicación del criterio al mapa y evitar imágenes innecesarias. No declarar cumplido el uso literal de AVIF/WebP si no existe. |
| 4 | `React.lazy`/`Suspense` y división de código. | Parcial. | Mapas cargados de forma diferida; vistas principales importadas estáticamente; advertencia de paquetes grandes en el build. | Diferir vistas por módulo conservando autorización, historial y estado; comparar solicitudes y carga inicial en escenarios equivalentes. |
| 5 | Sustitución de librerías por APIs nativas y dependencias mínimas/auditadas. | Parcial. | Seis dependencias de producción declaradas en `package.json`; lint y build aprobados. | Ejecutar auditorías actuales de dependencias frontend/backend y revisar utilidades reales antes de sustituirlas. Seis dependencias no prueba ausencia de vulnerabilidades; no se ejecutó `npm audit` ni `pip-audit` en este corte. |
| 6 | SVG integrado como componentes. | Implementado para los iconos propios. | [icons.tsx](../../../src/frontend/src/shared/ui/icons.tsx); marcadores Leaflet generan SVG dentro de sus iconos. | Conservar accesibilidad, escape de texto y colores del sistema en cambios futuros. No atribuir una mejora de bytes sin comparación. |
| 7 | `Cache-Control`, ETag y caché de peticiones. | Pendiente de implementación explícita en el código inspeccionado. | [httpClient.ts](../../../src/frontend/src/infrastructure/httpClient.ts) no incorpora caché; API sin esas cabeceras. No se inspeccionó un proxy productivo. | Definir política por recurso y usuario, invalidación tras escrituras y separación entre sesiones. Nunca reutilizar datos privados de otro usuario ni almacenar respuestas de autenticación como caché pública. |
| 8 | Brotli/Gzip de respuestas. | Pendiente en la composición API. | [deps.py](../../../src/backend/interfaces/api/deps.py) no incluye middleware de compresión; no se acredita un servidor de estáticos productivo. | Configurar compresión en servidor/proxy acordado; verificar `Content-Encoding`, `Vary`, umbral, compatibilidad y bytes reales. Gzip calculado por Vite o Python no acredita compresión HTTP activa. |

Esta matriz reemplaza las conclusiones técnicas para este corte sin modificar retrospectivamente la matriz del 11/11/2026. Las diferencias —respaldo ráster, auditorías no repetidas y suite completa fallida— quedan explícitas.

## 4. Reglas de refactorización y desarrollo verde

1. Identificar un cuello de botella con evidencia antes de cambiarlo. Separar las mejoras de UX de las de rendimiento y del cálculo de carbono.
2. Mantener negocio y autorización fuera del renderizado cartográfico. Preservar la numeración almacenada y no incorporar paradas de una ruta ajena al alcance permitido.
3. Usar proyecciones SQL, parámetros y límites adecuados; revisar el orden estable y la concurrencia. Los índices se justifican por planes y patrones reales de consulta.
4. Cargar recursos al necesitarse, con estados de espera y de error utilizables. La división de código no debe permitir abrir módulos prohibidos ni perder la navegación.
5. Reutilizar tokens y componentes. Si cambia una decisión de identidad visual, actualizar su especificación y pruebas de manera coherente, sin relajar controles para ocultar regresiones.
6. Definir caché por contrato, usuario y vigencia; invalidar al mutar y al cambiar de sesión. La reducción de solicitudes no justifica datos operativos obsoletos.
7. Medir transferencia efectiva y coste de compresión; no deducir ahorro eléctrico a partir del nombre de una tecnología.
8. Conservar por cada cambio el commit anterior/posterior, entorno, fecha/hora, pruebas y métricas. No publicar credenciales ni atribuir aprobación académica a resultados locales.

## 5. Evidencia necesaria para el cierre

La [revisión del sprint](01%20Revisi%C3%B3n%20del%20Sprint%20V_1_0_0.md) registra las incidencias abiertas. Para completar esta evaluación se requiere resolverlas, conservar cobertura vigente, ejecutar las auditorías pendientes, medir rendimiento y documentar las decisiones de aplicación del criterio de medios y de adaptación de MERN. Se precisa revisión independiente y validación del evaluador con la rúbrica original.

La reducción del impacto ambiental se comprobará mediante el protocolo del [informe 03](03%20Informe%20de%20reducci%C3%B3n%20del%20impacto%20ambiental%20V_1_0_0.md). Este documento fundamenta acciones; no prueba una reducción ya obtenida.

## 6. Referencias

- [Estándares de ingeniería de software del proyecto, V_1_0_1](../reduccion%20del%20impacto%20ambiental/02%20Estandares%20Ingenier%C3%ADa%20de%20software%20V_1_0_1.md): origen de los marcos y la adaptación de ocho áreas.
- [Guía de estilo documental](../Gu%C3%ADas%20t%C3%A9cnicas/Gu%C3%ADa%20de%20estilo%20documental.md).
- [Código y resultados del corte](evidencias/README.md).

## Control de versiones del documento

| Versión | Fecha | Autoría / cambio |
|---|---|---|
| V_1_0_0 | 12/11/2026 | Elaboración asistida por Codex a solicitud del usuario. Evaluación de ocho áreas sobre `7ea33a1`, fundamentación reutilizada, límites y reglas verificables de continuación. |

[← Volver al índice correspondiente](README.md)
