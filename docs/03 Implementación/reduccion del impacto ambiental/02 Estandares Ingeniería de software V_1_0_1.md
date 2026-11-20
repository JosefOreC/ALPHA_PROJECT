# Estándares de Ingeniería de Software y Guía de Desarrollo Verde

**Proyecto:** EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Líder del proyecto:** Ore Campos, Josef Pablo.

**Sprint:** 4.

**Versión del documento:** V_1_0_1.

**Versión de entrega:** v1.0.0.

**Fecha de actualización:** 13/11/2026, America/Lima (UTC−05:00).

**Responsable documental:** Equipo del proyecto.

**Revisión técnica y documental:** Ore Campos, Josef Pablo; Cueva Ricse, Alex.

**Rama de trabajo:** `refactor/mern`.

**Base de comparación vigente:** `6e36e35`.

**Alcance de publicación:** actualización de documentación Markdown. Las implementaciones y las mediciones descritas corresponden al incremento local auditado; sus archivos productivos y nuevos artefactos no se incorporan con esta publicación.

## 1. Arquitectura y alcance

La aplicación conserva React/TypeScript/Vite en presentación, FastAPI en servicios y PostgreSQL/PostGIS en persistencia. La organización por dominio, casos de uso, puertos y adaptadores permite optimizar las consultas y la interfaz sin trasladar reglas de negocio al transporte HTTP.

La rúbrica se aplica mediante equivalencias tecnológicas explícitas. Las proyecciones e índices SQL cubren el propósito de consultas magras solicitado para MongoDB/Mongoose. Esta adaptación mantiene las transacciones, la autorización y las operaciones geográficas existentes.

## 2. Matriz de las ocho áreas

| Área | Implementación del proyecto | Verificación |
|---|---|---|
| 1. Consultas magras e índices | Proyecciones SQL, parámetros enlazados, índices B-tree/GiST y reducción de consultas repetidas | Historial SQL, planes aislados y pruebas de persistencia. |
| 2. Paginación de 12 | Pedidos, Flota, Conductores y Registros; filtros y permisos antes de LIMIT/OFFSET | Pruebas de contratos, navegación y búsqueda; integración real. |
| 3. Imágenes modernas | picture AVIF/WebP/JPEG, tamaños 360/640/960 y espacio reservado | Selección de fuente, decodificación y fallback en móvil/escritorio. |
| 4. Carga diferida | React.lazy/Suspense en vistas y mapas | Diff histórico y build con módulos separados. |
| 5. APIs nativas | Cálculo de extremos geográficos con Math.min/Math.max | Comparación directa de resultados con el auxiliar Leaflet anterior. |
| 6. SVG en línea | Iconos React y marcadores SVG | Código, historial y comprobaciones automatizadas de interfaz/accesibilidad. |
| 7. Caché | Cache-Control, ETag/304 y React Query en Registros | Aislamiento por identidad, invalidación y pruebas HTTP. |
| 8. Compresión | Brotli/Gzip de recursos y gzip dinámico | Descompresión, negociación de calidad y respuestas de contingencia. |

La adaptación del punto 1 utiliza PostgreSQL/PostGIS; la del punto 5 sustituye un uso auxiliar de Leaflet, conservando el paquete para operar el mapa. El documento 05 establece estos alcances frente a la redacción literal de la rúbrica.

## 3. Reglas de implementación

1. Aplicar permisos y filtros en el servidor antes de paginar; mantener separados el total filtrado y los indicadores globales.
2. Proyectar columnas y enlazar parámetros SQL. Revisar índices mediante planes representativos cuando cambien consultas o volumen.
3. Mantener estable el contenido durante la carga y verificar sesión antes de habilitar escrituras.
4. Cargar vistas de forma diferida y comprobar qué módulos entran realmente en cada navegación.
5. Identificar las entradas de caché por usuario, rol, módulo y página; invalidarlas después de una modificación.
6. Reservar dimensiones de imágenes y conservar una representación compatible de respaldo.
7. Negociar compresión respetando calidades, MIME, Vary y validadores; conservar los originales.
8. Medir cada umbral de rendimiento y calcular emisiones con unidades, parámetros y escenario anual explícitos.

## 4. Contratos y funcionamiento

La paginación conserva los puertos de aplicación y adapta sus contratos de consulta. Pedidos devuelve la página solicitada, metadatos de navegación y conteos; las operaciones de creación, edición y cancelación mantienen sus comprobaciones de autorización. Los catálogos de selección se distinguen de los listados paginados.

La búsqueda compartida se ubica en `domain/managedOrder.ts`; `application/orderBoard.ts` mantiene la exportación anterior para conservar compatibilidad con sus consumidores. El adaptador de demostración reutiliza esa regla desde dominio.

React Query permanece en el módulo diferido de Registros. Las claves incluyen identidad, rol, módulo, desplazamiento y recarga; el cliente define 15 s de frescura y 60 s de retención inactiva. La limpieza al desmontar evita reutilizar consultas entre sesiones, y las mutaciones invalidan los datos correspondientes. Pedidos conserva su carga nativa de una página.

Las respuestas JSON privadas admiten ETag semántico débil y 304; sesión, mutaciones y errores usan no-store. Los recursos con nombre versionado se sirven con caché inmutable. Los validadores y la negociación de compresión se verifican también cuando la respuesta es 304.

## 5. Reglas de medición y despliegue

El build se genera mediante `npm run build`. El banco medido sirve React y API en el mismo origen mediante HTTPS/HTTP/2; el [README del backend](https://github.com/JosefOreC/ALPHA_PROJECT/blob/6e36e355e0d39c83c5700a83eb0987b6fd849a10/src/backend/README.md#https-y-http2) describe la configuración. El despliegue deberá usar un certificado válido de su dominio y repetir la auditoría en condiciones representativas.

El perfil, las réplicas, las versiones y los datos se registran junto con cada reporte. Los criterios se comprueban sobre valores originales y se conserva el peor resultado además de la mediana. Los informes ambientales distinguen energía estimada, energía incorporada equivalente y tráfico anual hipotético.

## 6. Trazabilidad del diagnóstico

El diagnóstico inicial identificó precarga masiva de Pedidos, páginas de tamaño distinto de 12, ausencia de picture y React Query, y casos de negociación HTTP sin cubrir. El incremento resolvió esos puntos y conservó la arquitectura. Los informes previos se mantienen como antecedentes, identificados por su base y entorno.

La reducción histórica de cinco a dos lecturas por resumen y las proyecciones SQL se revisan en los antecedentes de código (`antecedentes.patch`, registro local). Los cambios del incremento (`cambios-producto.patch`, registro local) documentan paginación, caché y compresión. La [evidencia de imagen y cálculo nativo](../Sprint%204/evidencias/raster-native/README.md) completa las áreas 3 y 5.

## 7. Implementación adaptada posterior a la fase 2

### 7.1 Procedencia de los fragmentos

Los fragmentos siguientes resumen código real y omiten contexto mediante puntos suspensivos. El historial distingue las mejoras introducidas durante el sprint de implementaciones anteriores que se conservan. La creación de SVG inline se presenta como incorporación del sistema de iconos, no como una conversión histórica desde imágenes raster.

### 7.2 Código comparativo por área

| Área | Antes | Después | Código y procedencia |
|---|---|---|---|
| 1. Consultas SQL | `SELECT * FROM pedidos ...`; lecturas repetidas para el resumen | `SELECT pedido_id, cliente_nombre, distrito, estado, latitud, longitud, ventana_inicio, ventana_fin, peso_kg, version ...`; resumen reutilizado por petición | Diff 3b5bdae → 9f953d6 de postgres_portal/postgres_dashboard e índices de migración 005. La proyección de planificación es distinta del listado paginado. |
| 2. Paginación | `const PAGE_SIZE = 100`; bucle `loadAll(service)` antes de filtrar | `const PAGE_SIZE = 12`; `service.list({ limit: PAGE_SIZE, offset, ... })`; filtros SQL antes de `LIMIT %s OFFSET %s` | OrderManagementView, postgres_orders y contratos frontend/backend; comparación sobre 6e36e35. |
| 3. Imagen adaptativa | Acceso sin fotografía ni elemento picture | `<picture><source type="image/avif" ... /><source type="image/webp" ... /><img ... /></picture>` | LoginIllustration.tsx; recurso incorporado y variantes del mismo recorte. |
| 4. Carga diferida | `import { OrderManagementView } from './interfaces/OrderManagementView'` | `lazy(() => import('./interfaces/OrderManagementView').then(...))` con `<Suspense ...>` | Diff histórico 3b5bdae → 9f953d6 de App.tsx; implementación conservada. |
| 5. API nativa | `L.latLngBounds(points.map(toTuple))` | `boundsOf(points)` con `Math.min/Math.max`; importación Leaflet solo de tipos en viewport.ts | viewport.ts y pruebas de equivalencia; Leaflet sigue gestionando la cámara. |
| 6. SVG inline | Sistema de iconos todavía no existente en el padre de c142f0d | `function Glyph(...) { return (<svg ... aria-hidden="true">{children}</svg>) }` | Introducción del sistema de iconos en c142f0d y marcadores inline conservados. |
| 7. Caché de consultas | Carga manual de Registros con `requestJson(...).then(...)`, sin React Query | `useQuery({ queryKey: ['records', user.subjectId, user.role, module, offset, reload], queryFn: ... }, queryClient)`; `invalidateQueries(...)` | RecordsView; Cache-Control y ETag conservados; validador semántico ajustado a `W/"..."`. |
| 8. Compresión | Selección de `('br', 'gzip')`; original de respaldo sin Vary | `representation_order(...)` incluye identity; `add_vary_header('Accept-Encoding')`; 406 si ninguna variante es aceptable | static_assets, http_efficiency y deps; precompresión nativa de Node conservada. |

### 7.3 Integridad funcional y validación

Las pruebas verifican búsqueda sobre más de 2000 pedidos, normalización de tildes, literales `%` y `_`, parámetros SQL, conteos globales/filtrados, reinicio de página, creación, edición, cancelación, permisos y comportamiento de caché en StrictMode. Las integraciones con PostgreSQL/PostGIS comprueban persistencia y rutas en una base desechable.

El arranque de React se ejecuta mediante `setTimeout(() => { createRoot(...).render(...) }, 0)` para separar su inicialización de la evaluación del módulo principal. La auditoría comprueba su comportamiento sobre series completas. La regresión de interfaz conserva el formulario y bloquea el envío mientras se verifica la sesión.

## 8. Cierre adaptado de imagen y sustitución auxiliar nativa

La imagen dispone de fuentes 360/640/960, atributo sizes, dimensiones 960 × 320 y texto alternativo. AVIF se ofrece primero, WebP como segunda opción y JPEG como respaldo. La carga se habilita al resolver la sesión; durante la espera se reserva el mismo espacio. Las pruebas retiran fuentes para verificar cada formato y comprueban decodificación, formulario y ausencia de desbordamiento horizontal.

El recurso es ilustrativo y su procedencia se conserva en el registro del recurso (`generation.json`, registro local). A 640 px, AVIF ocupa 9515 bytes, WebP 21010 y JPEG 31480. La conversión se realiza offline con Pillow; esa herramienta no forma parte del navegador ni del backend productivo.

El cálculo nativo recorre las coordenadas para obtener los extremos sur, oeste, norte y este. Evita crear tuplas y objetos LatLng por punto para ese cálculo y conserva padding, zoom, animación y límites de Lima al llamar a `map.fitBounds`. Se comparan resultados con Leaflet sobre puntos individuales, repetidos, negativos y conjuntos de 150 puntos. Esta sustitución es auxiliar y no implica eliminar el motor cartográfico ni una reducción global de bundle medida.

## 9. Fundamentación en estándares internacionales

### 9.1 Calidad del producto: ISO/IEC 25010:2023

Se utiliza el modelo de calidad de producto ISO/IEC 25010:2023 para relacionar decisiones técnicas con atributos evaluables. El mapeo representa una justificación de ingeniería; no constituye una certificación.

| Característica / subcaracterística | Relación con la refactorización | Evidencia del proyecto |
|---|---|---|
| Eficiencia de desempeño / comportamiento temporal | Menos trabajo inicial y módulos diferidos | FCP, LCP y TBT; seis cargas finales. |
| Eficiencia de desempeño / utilización de recursos | Proyecciones, caché, formatos y compresión | Consultas, bytes y validadores HTTP. |
| Eficiencia de desempeño / capacidad | Cargas acotadas por página | Páginas de 12 y prueba de escala de planificación. |
| Mantenibilidad / modularidad | Separación de dominio, casos de uso y adaptadores | Estructura por capas y prueba de arquitectura. |
| Mantenibilidad / reusabilidad | Reglas y componentes compartidos | Búsqueda en dominio; iconos en shared/ui. |
| Mantenibilidad / analizabilidad | Tipos, lint y trazabilidad | Compilación, diagnósticos y manifiestos. |
| Mantenibilidad / modificabilidad | Cambios mediante contratos y configuración | Puertos de repositorios y adaptadores intercambiables. |
| Mantenibilidad / capacidad de prueba | Regresiones e integración aislada | Cobertura, Playwright y PostGIS real. |

### 9.2 Principios de la Green Software Foundation

La Green Software Foundation (GSF) aporta cuatro principios relacionados con el análisis solicitado. Su aplicación se diferencia de la medición eléctrica y de las capacidades de despliegue aún no implementadas.

| Principio | Aplicación y justificación | Alcance |
|---|---|---|
| Eficiencia de carbono | SWDM permite comparar el coste estimado por carga; formatos, caché y compresión limitan transferencia. | Se informa también el incremento de Acceso; no se supone reducción neta del sitio. |
| Eficiencia energética | Proyecciones, índices y paginación evitan trabajo y datos innecesarios. | La mejora se fundamenta en operaciones y transferencia; no hay medición eléctrica directa. |
| Eficiencia de hardware | Menor trabajo inicial y mapa diferido reducen requisitos de arranque del cliente. | Las pruebas móviles no demuestran por sí solas prolongación de vida útil del hardware. |
| Conciencia de carbono | Las tareas diferibles podrán programarse con señales de intensidad de carbono regional. | Es una regla de evolución: no hay planificador conectado a señales de red eléctrica ni ahorro temporal acreditado. |

La especificación Software Carbon Intensity (SCI) relaciona energía, intensidad de carbono, carbono incorporado y unidad funcional. Este informe usa SWDM para cargas web; no presenta el resultado como una medición SCI de una ruta o pedido.

### 9.3 Correspondencia con W3C WSG

Se consultó la versión de las Web Sustainability Guidelines (WSG) publicada como borrador de nota de grupo el 16/10/2026. La rúbrica menciona los numerales 1.2, 2.4 y 3.1; se conserva su correspondencia con el texto oficial, evitando atribuirles los títulos diferentes del ejemplo HTML.

| Numeral citado | Contenido oficial y aplicación |
|---|---|
| 1.2 | Describe las capas de orientación de WSG; sirve para separar principios, pautas y criterios comprobables. No es la pauta de optimización de imágenes. |
| 2.4 | Trata recorridos de uso eficientes; se relaciona con navegación por rol y consulta paginada. |
| 3.1 | Establece objetivos de rendimiento e impacto energético; se relaciona con umbrales, auditorías y estimaciones. |

Para medios se utiliza además 2.9; para modularización, 3.3; para dependencias, 3.12; y para complejidad de consultas, 3.16. Las reglas se aplican según su contenido y la versión consultada. La referencia WSG es un documento en desarrollo, no una certificación del producto.

### 9.4 Matriz directa de las ocho optimizaciones

| Área | ISO/IEC 25010 | Principio GSF | WSG | Comprobación |
|---|---|---|---|---|
| 1. Proyecciones e índices SQL | Utilización de recursos | Energía y hardware | 3.16 | Consultas, índices y planes aislados. |
| 2. Paginación de 12 | Capacidad | Energía | 2.4, 3.1 | Contratos, navegación y conteos. |
| 3. AVIF/WebP adaptativas | Comportamiento temporal | Carbono | 2.9 | Fuentes, tamaños y decodificación. |
| 4. React.lazy/Suspense | Modularidad | Hardware y energía | 3.3 | Chunks y solicitudes de arranque. |
| 5. Cálculo nativo | Analizabilidad y modificabilidad | Energía | 3.12 | Comparación con el auxiliar anterior. |
| 6. SVG inline | Reusabilidad | Carbono | 2.9 | Iconos y marcadores integrados. |
| 7. Caché y React Query | Comportamiento temporal | Energía | 2.4, 3.1 | 304, aislamiento e invalidación. |
| 8. Brotli/Gzip | Utilización de recursos | Carbono | 3.1 | Negociación y transferencia. |

## 10. Código limpio y reglas verificables

| Principio | Backend | Frontend | Verificación |
|---|---|---|---|
| Clean Code | Casos de uso con propósito explícito y consultas legibles | Vistas y componentes por responsabilidad | Revisión, tipos y lint. |
| SOLID: responsabilidad única | Casos de uso separados de persistencia | Presentación separada de adaptadores HTTP | Estructura y pruebas por capa. |
| SOLID: abierto/cerrado | Puertos permiten incorporar adaptadores | Servicios se consumen por contrato | Dobles y adaptadores de demostración. |
| SOLID: sustitución e interfaces | Repositorios mantienen sus contratos | Adaptadores HTTP y demo comparten tipos | Regresiones de contratos; excepciones documentadas. |
| SOLID: inversión de dependencias | Dominio independiente de FastAPI/psycopg | Dominio independiente de UI y transporte | Prueba de arquitectura e inspección de importaciones. |
| DRY | Agregados y reglas de negocio reutilizados | Regla de búsqueda y componentes compartidos | Pruebas de resultados y consumidores existentes. |
| YAGNI | Sin incorporar servicios de caché que el alcance no requiere | APIs nativas cuando resuelven el problema; Query acotado a Registros | Revisión del uso y coste de cada dependencia. |

En backend se exige autorización antes de consultar listados, parámetros SQL enlazados, límites acotados, índices justificados por consultas y transacciones en escrituras. La regla de proyección se aplica a las consultas auditadas; no se interpreta como una afirmación de que todo el repositorio carece de SELECT *.

En frontend se exige paginación bajo demanda, dimensiones reservadas, texto alternativo, carga diferida de vistas pesadas y separación de caché por identidad. Las imágenes fuera del primer contenido visible usarán carga diferida; la imagen principal de Acceso conserva carga prioritaria por su papel en LCP. Las dependencias se justifican y el build minimizado se audita.

Los cambios deben conservar cobertura mínima del 90 %, verificaciones de seguridad y accesibilidad automatizada, además de los controles de formato documental. Cada nueva medición identifica versión, entorno, datos y límites. La revisión manual de accesibilidad se registra de forma independiente.

## 11. Referencias

- ISO, [ISO/IEC 25010:2023 — Product quality model](https://www.iso.org/standard/78176.html).
- Green Software Foundation, [formación y principios de software verde](https://greensoftware.foundation/education/).
- Green Software Foundation, [Software Carbon Intensity Specification](https://sci.greensoftware.foundation/).
- W3C, [Web Sustainability Guidelines, versión del 16/10/2026](https://www.w3.org/TR/2026/DNOTE-web-sustainability-guidelines-20261016/).
- Sustainable Web Design, [Estimating Digital Emissions, SWDM v4](https://sustainablewebdesign.org/estimating-digital-emissions/).

Las fuentes se consultaron el 13/11/2026. Las relaciones de las tablas constituyen el análisis del proyecto sobre estos marcos.

## 12. Automatización y gestión de versiones

El [registro CI/Git del Sprint 4](../Sprint%204/07%20Automatizacion%20CI%20y%20gestion%20de%20versiones%20V_1_0_0.md) documenta el workflow LHCI, las rutas exactas, la versión v1.0.0 y la secuencia de publicación. Los resultados locales y la ejecución remota se mantienen separados.

## Validación automatizada posterior

La validación LHCI posterior registró un incumplimiento de TBT en Acceso (167 ms frente al límite de 85 ms) y tres cargas conformes en Pedidos. La serie histórica raster-sesion conserva sus seis cargas conformes; el nuevo resultado se presenta por separado y deja pendiente comprobar la estabilidad del gate de Acceso. Véase el [registro de automatización](../Sprint%204/07%20Automatizacion%20CI%20y%20gestion%20de%20versiones%20V_1_0_0.md).

## Control de versiones del documento

| Versión | Fecha | Autoría / cambio |
|---|---|---|
| V_1_0_0 | 11/11/2026 | Tovar Sánchez, Carlos Alberto. Fundamentación inicial en estándares y reglas verdes. |
| V_1_0_1, antecedente | 12/11/2026 | Rojas Camayo, Valentino Jhan Pierre. Revisión de redacción y formato. |
| V_1_0_1 | 13/11/2026 | Ore Campos, Josef Pablo; Cueva Ricse, Alex. Revisión técnica y documental del estado final; se conserva la versión documental vigente integrada en main. |

[← Volver al índice correspondiente](README.md)
