# Estándares de Ingeniería de Software y Guía de Desarrollo Verde

**Nombre del Proyecto:** EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Líder del Proyecto:** Ore Campos, Josef Pablo

**Versión del documento:** V_1_0_0

**Autor:** Tovar Sánchez, Carlos Alberto

**Actualización documental:** 12/11/2026.

**Alcance:** fundamentación en normativas internacionales, reglas arquitectónicas de código limpio, guía de desarrollo verde y matriz de mapeo entre las optimizaciones y los estándares (criterio «Estándares internacionales, arquitectura y guía de desarrollo verde» de la rúbrica de la Inspección 04).

## 1. Contexto y adaptación al stack

La rúbrica y el informe de referencia describen un stack MERN (MongoDB, Express, React y Node). EcoLogística Lima usa **React 19 con Vite y TypeScript** en el frontend, **FastAPI (Python)** en el backend y **PostgreSQL con PostGIS** como base de datos. Se conservan las ocho áreas de optimización de la rúbrica y se traducen a su equivalente en este stack:

| # | Área de la rúbrica (MERN) | Equivalente en EcoLogística Lima |
|---|---|---|
| 1 | Consultas magras `.select()` / `.lean()` e índices en MongoDB | Columnas explícitas (sin `SELECT *`) e índices en PostgreSQL |
| 2 | Paginación en backend y frontend | `limit` y `offset` en FastAPI y paginación en la interfaz |
| 3 | Imágenes WebP/AVIF adaptativas con `<picture>` | Medios optimizados: el proyecto usa SVG y mapa vectorial, no imágenes ráster |
| 4 | `React.lazy` / `Suspense` para code splitting | Igual, en React con Vite |
| 5 | Sustitución de librerías por APIs nativas | Dependencias mínimas y auditadas |
| 6 | Inlining de SVG | Iconos SVG como componentes React |
| 7 | Cabeceras `Cache-Control` / ETag / React Query | Cabeceras de caché y caché de peticiones en el cliente |
| 8 | Compresión Brotli / Gzip | Compresión de respuestas en FastAPI o en el servidor de estáticos |

El estado de cada área se verificó en el código el 11/11/2026 y se informa en la matriz de la sección 4, sin atribuir mejoras que el repositorio no tiene. Las métricas cuantitativas (Lighthouse y modelo SWDM) se presentan en el documento 01 y no se repiten aquí.

## 2. Fundamentación en normativas internacionales

### 2.1 ISO/IEC 25010 (calidad del producto de software)

| Característica | Subcaracterística | Aplicación en EcoLogística Lima |
|---|---|---|
| Eficiencia de desempeño | Comportamiento temporal | El requisito RNF-001 fija un máximo de 45 s (P95) para generar rutas con 150 pedidos y 15 vehículos; la prueba `test_benchmark_scale_of_150_orders_and_15_vehicles_stays_fast` lo vigila y la medición del 30/10/2026 (10 corridas sintéticas) dio una mediana de 3,5 s y un máximo de 6,6 s. El mapa se carga bajo demanda. |
| Eficiencia de desempeño | Utilización de recursos | Consultas con parámetros, diez índices en `schema.sql` (por ejemplo `idx_pedidos_estado_distrito` y un índice GIST de geometrías) y seis dependencias de producción en el frontend. |
| Eficiencia de desempeño | Capacidad | Listados con `limit` entre 1 y 100 (20 por defecto) y `offset` acotado; la prueba de escala de 150 pedidos y 15 vehículos. |
| Mantenibilidad | Modularidad | Arquitectura hexagonal (`domain`, `application`, `infrastructure`, `interfaces`) con la prueba `test_architecture.py`; frontend en capas (`domain`, `application`, `infrastructure`, `interfaces`, `shared`). |
| Mantenibilidad | Reusabilidad | Sistema de diseño compartido en `shared/ui`; puertos y adaptadores intercambiables (por ejemplo `RouteOptimizer` y `AlgorithmSettings`). |
| Mantenibilidad | Analizabilidad | Lint con `oxlint`, comprobación de tipos con `tsc`, análisis estático con SonarQube y documentación versionada. |
| Mantenibilidad | Modificabilidad | Configuración por variables de entorno (`DATABASE_URL`, `CORS_ALLOW_ORIGINS`, `SESSION_COOKIE_SECURE`) y objetivos de optimización intercambiables (CO₂, tiempo o mixto). |
| Mantenibilidad | Capacidad de ser probado | Umbral de cobertura del 90 % en frontend (`vite.config.ts`) y en Python (flujo de integración continua); 368 pruebas de backend y 435 de frontend al 30/10/2026. |

### 2.2 Green Software Foundation (GSF)

Se aplican los cuatro principios de eficiencia y conciencia del carbono:

| Principio | Qué plantea | Aplicación en EcoLogística Lima |
|---|---|---|
| Eficiencia de carbono | Emitir la menor cantidad de carbono posible por unidad de trabajo | Planificación de rutas con una heurística que responde en segundos en lugar de un cálculo exhaustivo; listados paginados para no transferir datos innecesarios. |
| Eficiencia energética | Usar la menor energía posible | Índices en consultas frecuentes, carga diferida del mapa y actualización del dashboard cada 60 s en lugar de consultas continuas. |
| Conciencia de carbono | Hacer más trabajo cuando la electricidad es más limpia | Aún no se aplica, porque el despliegue no está definido. Propuesta: programar fuera de la hora punta las tareas diferibles (recálculo de reportes) cuando exista un servidor propio. |
| Eficiencia de hardware | Usar menos hardware y prolongar la vida útil de los dispositivos | Cliente ligero (seis dependencias de producción) y vistas probadas a 390 px para que los conductores usen móviles de gama baja. |

Como referencia de medición, la especificación de intensidad de carbono del software (SCI, ISO/IEC 21031:2024) define `SCI = ((E × I) + M) por R`, donde E es la energía consumida, I la intensidad de carbono de la electricidad, M el carbono incorporado del hardware y R la unidad funcional (en este proyecto, un pedido o una ruta planificada).

### 2.3 W3C Web Sustainability Guidelines (WSG)

El texto oficial consultado el 11/11/2026 es un borrador de nota del grupo de trabajo (Group Note Draft, 16/10/2026) y numera sus secciones así: 2 Diseño de la experiencia de usuario, 3 Desarrollo web, 4 Alojamiento, infraestructura y sistemas, y 5 Estrategia de negocio y gestión de producto. La rúbrica cita las pautas «1.2, 2.4 y 3.1»: en el texto oficial la **2.4** es «Design efficient and streamlined user journeys» y la **3.1** es «Set goals based on performance and energy impact», mientras que el numeral 1.2 pertenece a la introducción («WSG layers of guidance») y no es una pauta. Los títulos de las pautas se citan en su idioma original. Este documento cubre la 2.4 y la 3.1 con su título oficial y, para la intención que la rúbrica atribuye a «1.2» (medios optimizados), la pauta **2.9**, «Optimize media to reduce resource use».

| Pauta oficial | Título | Aplicación en EcoLogística Lima |
|---|---|---|
| 2.4 | Design efficient and streamlined user journeys | Cada rol llega a su tarea en pocos pasos: el conductor confirma una entrega desde «Mi ruta» y «Pedido actual», y el planificador genera rutas en una sola pantalla. |
| 2.9 | Optimize media to reduce resource use | No hay imágenes ráster; los iconos son SVG y el mapa es vectorial. Si se agregan imágenes, se usarán WebP o AVIF con `<picture>` y `loading="lazy"`. |
| 3.1 | Set goals based on performance and energy impact | Metas medibles: 45 s (P95) para generar rutas (RNF-001), cobertura mínima del 90 % y puntaje de Lighthouse como objetivo del informe de reducción del impacto ambiental. |
| 3.2 | Minify and remove unused code | El build de producción (`vite build`) minimiza el código y se ejecuta en cada Pull Request; `oxlint` detecta código sin uso. |
| 3.3 | Modularize bandwidth-heavy components | El componente de mapa (`LeafletCanvas`) se carga con `React.lazy` y `Suspense`. |
| 3.4 | Avoid redundancy and duplication in code | Una sola implementación del cálculo de CO₂ por km (`domain/emissions.py`) y un único cliente HTTP (`requestJson`). |
| 3.11 | Use sustainable JavaScript and APIs | Peticiones paginadas con `limit` y `offset`, y respuestas con solo los datos necesarios. |
| 3.12 | Use dependencies sparingly and maintain them | Seis dependencias de producción; `npm audit` y `pip-audit` sin hallazgos y Bandit sin alertas medias o altas (verificado el 30/10/2026). |
| 3.16 | Reduce the number and complexity of database queries | Índices para los filtros frecuentes y consultas con parámetros; las consultas con `SELECT *` se reemplazarán por columnas explícitas. |

## 3. Reglas arquitectónicas y guía de desarrollo verde

### 3.1 Principios de código limpio aplicados

| Principio | Backend (Python y FastAPI) | Frontend (React y TypeScript) |
|---|---|---|
| Clean Code | Funciones cortas con un propósito; comentarios que explican el porqué; nombres del dominio en español. | Componentes pequeños por responsabilidad; tipos explícitos; `oxlint` y `tsc` sin avisos. |
| SOLID, responsabilidad única | Un caso de uso por archivo en `application/use_cases`. | Una vista, un servicio y un adaptador por responsabilidad. |
| SOLID, abierto y cerrado | Nuevos objetivos de optimización o combustibles se agregan por configuración, sin modificar los casos de uso. | Nuevos paneles se agregan como componentes sin modificar el `AppShell`. |
| SOLID, sustitución e interfaces | Puertos pequeños en `domain/ports` (por ejemplo repositorios de vehículos y conductores). | Servicios inyectados por interfaz; adaptadores HTTP y de demostración intercambiables. |
| SOLID, inversión de dependencias | El dominio solo depende de puertos; `test_architecture.py` falla si importa infraestructura o frameworks. | `domain` no importa de `infrastructure` ni de `interfaces`. |
| DRY | Consultas fijas como constantes de módulo; cálculo de emisiones en un solo lugar. | Componentes comunes en `shared/ui` y un único cliente HTTP. |
| YAGNI | Redis, OAuth2/JWT y Docker Compose permanecen como arquitectura objetivo hasta que se necesiten. | Sin librerías de estado global ni de fechas mientras bastan las APIs nativas. |

### 3.2 Reglas para el backend

1. El dominio no importa FastAPI, psycopg ni ningún framework; la dependencia va de afuera hacia adentro.
2. Toda consulta SQL usa parámetros (`%s`); las consultas nuevas listan sus columnas y no usan `SELECT *`.
3. Todo listado es paginado con un límite máximo (hoy 100 registros) y se rechaza lo que lo excede.
4. Cada filtro frecuente nuevo se entrega con su índice en `schema.sql`.
5. Los cálculos pesados (planificación) tienen un tiempo máximo configurable y una medición asociada (RNF-001).
6. Las respuestas JSON de más de 1 KB se comprimen (GZip o Brotli) y los recursos estáticos llevan cabeceras de caché (propuesta, no implementada).
7. Las dependencias se fijan y se auditan en cada Pull Request (`pip-audit` y Bandit).
8. La cobertura de Python se mantiene en 90 % o más, en líneas y en ramas.

### 3.3 Reglas para el frontend

1. Se respetan las capas `domain`, `application`, `infrastructure`, `interfaces` y `shared`; el dominio no importa de las demás.
2. Los componentes pesados se cargan con `React.lazy` y `Suspense` (hecho para el mapa; pendiente para administración y reportes).
3. Los iconos son componentes SVG; no se suben imágenes ráster sin necesidad y, si se suben, serán WebP o AVIF de menos de 200 KB con `<picture>` y `loading="lazy"` bajo el pliegue.
4. Toda dependencia nueva se justifica y se revisa su peso en el build; `npm audit` no admite hallazgos altos.
5. Las peticiones son paginadas y sin consultas continuas innecesarias (el dashboard actualiza cada 60 s).
6. Las reglas de diseño y accesibilidad se vigilan con pruebas automáticas (`designRules.test.ts` y axe-core en Playwright).
7. La cobertura mínima es del 90 % (líneas, sentencias, funciones y ramas).
8. El build de producción se genera minimizado y sin avisos de lint ni de tipos.

### 3.4 Cómo se comprueba cada regla

| Regla | Mecanismo | Dónde |
|---|---|---|
| Dominio sin frameworks | `test_architecture.py` | Pruebas del backend |
| SQL parametrizado | Bandit sin hallazgos medios o altos | Flujo de integración continua (`.github/workflows/sonarcloud.yml`) |
| Cobertura de 90 % | `scripts/check_python_coverage.py` y umbral de Vitest | Flujo de integración continua |
| Dependencias sin hallazgos | `pip-audit` y `npm audit` | Flujo de integración continua |
| Lint y tipos | `oxlint` y `tsc -b` | Pruebas y compilación del frontend |
| Reglas de diseño y accesibilidad | `designRules.test.ts` y `accesibilidad.spec.ts` | Pruebas del frontend |

## 4. Matriz de mapeo directo: estándares y optimizaciones

| # | Optimización | ISO/IEC 25010 | Green Software Foundation | W3C WSG | Estado verificado en el código (11/11/2026) |
|---|---|---|---|---|---|
| 1 | Consultas con columnas explícitas e índices en PostgreSQL | Eficiencia: utilización de recursos | Eficiencia de hardware y energética | 3.16 | Parcial: diez índices en `schema.sql`; quedan 15 usos de `SELECT *` por reemplazar. |
| 2 | Paginación en backend y frontend | Eficiencia: capacidad | Eficiencia energética | 2.4 y 3.11 | Parcial: el backend limita a 100 registros (20 por defecto) y la interfaz pagina de 100 en 100; la regla de 12 registros por vista no está aplicada. |
| 3 | Medios optimizados | Eficiencia: comportamiento temporal | Eficiencia de carbono | 2.9 | Cumplido por diseño: sin imágenes ráster; iconos SVG y mapa vectorial. |
| 4 | Code splitting con `React.lazy` y `Suspense` | Mantenibilidad: modularidad; eficiencia: comportamiento temporal | Eficiencia energética y de hardware | 3.3 | Parcial: `LeafletCanvas` se carga bajo demanda; las demás vistas van en el paquete principal. |
| 5 | Dependencias mínimas y auditadas | Mantenibilidad: analizabilidad | Eficiencia de hardware | 3.2 y 3.12 | Cumplido: seis dependencias de producción, sin librerías de fechas ni utilidades; `npm audit` en 0. |
| 6 | Iconos SVG como componentes | Eficiencia: comportamiento temporal | Eficiencia de carbono | 2.9 y 3.4 | Cumplido: `shared/ui/icons.tsx` define los iconos como componentes React. |
| 7 | Cabeceras de caché y caché de peticiones | Eficiencia: comportamiento temporal | Eficiencia energética | 3.1 y 3.11 | Pendiente: no hay `Cache-Control`, ETag ni caché de peticiones en el cliente. |
| 8 | Compresión de respuestas (GZip o Brotli) | Eficiencia: capacidad | Eficiencia de carbono | 3.1 y 3.11 | Pendiente: FastAPI no tiene `GZipMiddleware`. |

De las ocho áreas, tres están cumplidas, tres parcialmente y dos pendientes; las pendientes y parciales son el insumo del informe de reducción del impacto ambiental (documento 01).

## 5. Referencias

- ISO/IEC 25010:2011, *Systems and software engineering — Systems and software Quality Requirements and Evaluation (SQuaRE) — System and software quality models*.
- Green Software Foundation, *Green Software Principles* y especificación de intensidad de carbono del software (ISO/IEC 21031:2024).
- W3C, [*Web Sustainability Guidelines (WSG)*](https://www.w3.org/TR/web-sustainability-guidelines/) (consultado el 11/11/2026).

## Control de versiones del documento

| Versión | Fecha | Autoría / cambio |
|---|---|---|
| V_1_0_0 | 11/11/2026 | Tovar Sánchez, Carlos Alberto. Emisión inicial: fundamentación en ISO/IEC 25010, GSF y W3C WSG, reglas de código limpio para backend y frontend, guía de desarrollo verde y matriz de mapeo de las ocho optimizaciones, adaptadas al stack del proyecto. |
| V_1_0_0 | 12/11/2026 | Rojas Camayo, Valentino Jhan Pierre. Revisión de formato y redacción, sin cambio de versión porque la rúbrica exige el nombre de archivo con V_1_0_0: metadatos en líneas separadas, como en el resto de la documentación; referencia de la W3C como enlace; referencia cruzada al documento 01; ajustes de puntuación y de estilo formal. Sin cambios de contenido técnico. |

[← Volver al índice correspondiente](README.md)
