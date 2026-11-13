# Informe de reducción del impacto ambiental y optimización del sistema

**Nombre del Proyecto:** EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Líder del Proyecto:** Ore Campos, Josef Pablo

**Sprint:** Sprint 4, en curso.

**Versión del documento:** V_1_0_0

**Autoría:** elaboración técnica asistida por Codex, por solicitud del usuario; revisión del equipo pendiente.

**Fecha y hora de corte:** 12/11/2026, 20:56:09, America/Lima (UTC−05:00).

**Actualización documental:** 12/11/2026, 21:11:30, America/Lima.

**Rama y commit de software:** `refactor/mern`, `7ea33a185619d5c06ab8ce8c090b3e334b45a9ce`.

**Estado del informe:** diagnóstico e inventario inicial comprobados; comparación ambiental antes/después pendiente. No se declara reducción de energía ni de CO₂e demostrada.

## 1. Introducción y propósito

La eficiencia del software puede reducir recursos de ejecución y transferencia, pero una mejora de apariencia no prueba un ahorro ambiental. Este informe separa la sostenibilidad digital del sistema de las emisiones logísticas de los vehículos. Los kilogramos de CO₂ del dashboard provienen de la operación modelada; no miden el consumo eléctrico del frontend, del backend ni de la infraestructura.

Se utiliza la [plantilla ambiental existente](../reduccion%20del%20impacto%20ambiental/Plantilla%20del%20informe%20de%20reduccion%20del%20impacto%20ambiental.md) y la [evaluación de ocho áreas del Sprint 4](04%20Est%C3%A1ndares%20arquitectura%20y%20gu%C3%ADa%20de%20desarrollo%20verde%20V_1_0_0.md). El objetivo inmediato es conservar una línea base reproducible antes de modificar consultas, paginación, carga diferida, caché o compresión.

El stack comprobado es React/TypeScript/Vite, FastAPI/Python y PostgreSQL/PostGIS. No se cambiaron estas tecnologías para que el nombre de la rama coincida con MERN. La adaptación de la rúbrica al stack proviene del documento de estándares existente; la aceptación de esa adaptación por el evaluador no está acreditada.

## 2. Entorno y alcance de las mediciones

| Elemento | Valor observado | Fuente |
|---|---|---|
| Inventario de artefactos | 12/11/2026, 20:59:03, Lima. | [inventario.json](evidencias/inventario.json). |
| Sistema local | Windows 11; versión informada por Python `Windows-11-10.0.26200-SP0`. | Inventario. |
| Python y Node | Python 3.14.2; Node v24.11.1. | Inventario. |
| Paquetes Python instalados | FastAPI 0.142.2; Starlette 1.7.0; pytest 9.1.1; pytest-cov 7.1.0; psycopg 3.3.6. | Metadatos de distribución del entorno, no auditoría de vulnerabilidades. |
| Build | `npm run build`, con TypeScript y Vite 8.3.5; código de salida 0. | [Salida](evidencias/compilacion.txt), [horas](evidencias/compilacion.json). |
| Estado del código fuente | `git diff --name-only HEAD -- src scripts` vacío al inventariar. | Inventario; los cambios de esta entrega son documentales. |
| Datos y servicios de pruebas | Fixtures y dobles; integración PostgreSQL desactivada explícitamente. | [Ejecutor reproducible](evidencias/verificar_corte.py) y salidas de pruebas. |
| Navegador | Chromium mediante el canal local Microsoft Edge, sin interfaz visible; configuración de Playwright en escritorio y móvil. | [playwright.config.ts](../../../src/frontend/playwright.config.ts). No se conservó el número exacto del navegador; debe añadirse a una medición Lighthouse. |

No se ejecutaron Lighthouse, análisis de consumo eléctrico, medición de latencia de una API operativa ni un servicio externo de cálculo de carbono. El tiempo de ejecución de pytest o del build no sustituye el tiempo de respuesta de usuario o de API.

## 3. Diagnóstico inicial

### 3.1 Código y consultas

La paginación de pedidos ya selecciona columnas explícitas mediante `COLUMNS`, ordena por ID y aplica `LIMIT`/`OFFSET` en [postgres_orders.py](../../../src/backend/infrastructure/persistence/postgres_orders.py). No se presenta esa optimización como nueva de esta sesión.

Continúan consultas `SELECT *` en [postgres_fleet.py](../../../src/backend/infrastructure/persistence/postgres_fleet.py), [postgres_dashboard.py](../../../src/backend/infrastructure/persistence/postgres_dashboard.py), [postgres_portal.py](../../../src/backend/infrastructure/persistence/postgres_portal.py) y [security.py](../../../src/backend/infrastructure/security.py). El dashboard vuelve a cargar pedidos para sus conteos y cumplimiento, y vuelve a consultar métricas de rutas para distancia, emisiones y disponibilidad. La inspección muestra candidatos a consolidación; no cuantifica su coste sin medirlos.

El [esquema](../../../src/backend/infrastructure/persistence/schema.sql) declara diez índices explícitos, incluidos dos GIST. Su presencia en el archivo no acredita que estén aplicados ni que el planificador SQL los use en la base operativa. No se ejecutó `EXPLAIN ANALYZE` contra datos reales.

### 3.2 Cliente y recursos

En [App.tsx](../../../src/frontend/src/App.tsx), las vistas principales se importan estáticamente. Los mapas [LeafletCanvas](../../../src/frontend/src/interfaces/map/RouteMap.tsx) y [DestinationMap](../../../src/frontend/src/interfaces/orders/OrderDestinationPicker.tsx) ya utilizan carga diferida. El build advierte sobre paquetes de más de 500 kB; esto identifica una oportunidad, no una mejora aplicada.

Los iconos son SVG. El mapa usa cartografía vectorial y dispone de respaldo de teselas ráster en [VectorBasemap.tsx](../../../src/frontend/src/interfaces/map/VectorBasemap.tsx); por tanto no sería correcto afirmar que el sistema no usa ningún recurso ráster. El [HTML de entrada](../../../src/frontend/index.html) solicita Geist y Geist Mono a Google Fonts, aunque el token sans actual prioriza Segoe UI. Debe medirse el uso y decidirse su conservación con la identidad visual.

La composición [create_app](../../../src/backend/interfaces/api/deps.py) incorpora CORS y cabeceras de seguridad, pero no GZip ni Brotli. El [cliente HTTP](../../../src/frontend/src/infrastructure/httpClient.ts) hace `fetch` por llamada y no implementa una caché de peticiones. No se observaron implementaciones de `Cache-Control` o ETag en el código API inspeccionado; esto no demuestra la configuración de un proxy externo no inspeccionado.

## 4. Inventario cuantitativo del build

Los siguientes tamaños se miden sobre archivos de producción generados a partir del commit indicado. La unidad es el byte exacto. Gzip corresponde a compresión local con Python, nivel predeterminado 9 y `mtime=0`; no es una respuesta HTTP y puede diferir del cálculo informativo de Vite por parámetros de compresión.

| Artefacto | Archivo sin comprimir (bytes) | Gzip local (bytes) | Interpretación |
|---|---|---|---|
| JavaScript principal `index-Bh8rZZLG.js` | 393292 | 114792 | Contiene las vistas importadas estáticamente y dependencias asociadas. |
| Paquete `markers--dK1sG2F.js` | 1041410 | 279277 | Nombre generado por Vite; no se atribuye todo su contenido a los iconos sin inspeccionar el grafo. |
| Trabajador `maplibre-gl-worker-CEzvAyZY.js` | 507694 | 144244 | Recurso del motor cartográfico. |
| Leaflet `leaflet-src-Dtl8lBO1.js` | 148604 | 42897 | Biblioteca cartográfica. |
| CSS principal `index-BtZM_Mrz.css` | 75635 | 14542 | Estilos empaquetados de la aplicación. |

El [inventario completo](evidencias/inventario.json) incluye los once archivos JS/CSS/HTML encontrados y su SHA-256. No incluye el peso de teselas o fuentes descargadas en una visita. Sumar todos los paquetes de `dist` no equivale a medir una navegación: algunos se cargan bajo demanda.

## 5. Comparación antes y después

| Métrica requerida por la plantilla | Antes de optimizar | Después de optimizar | Diferencia verificable |
|---|---|---|---|
| Puntaje Lighthouse | No medido. | No medido. | No calculable. |
| First Contentful Paint, FCP | No medido. | No medido. | No calculable. |
| Largest Contentful Paint, LCP | No medido. | No medido. | No calculable. |
| Total Blocking Time, TBT | No medido. | No medido. | No calculable. |
| Cumulative Layout Shift, CLS | No medido. | No medido. | No calculable. |
| Transferencia HTTP por visita | No medida. | No medida. | No calculable; no sustituir por tamaño del build. |
| Solicitudes HTTP por escenario | No medidas. | No medidas. | No calculable. |
| Latencia media y P95 de API | No medidas. | No medidas. | No calculable; las pruebas simuladas no son un benchmark de producción. |
| Emisiones digitales estimadas por visita | No calculadas. | No calculadas. | No calculable sin transferencia y modelo aplicable. |

Esta edición no incorpora una optimización de rendimiento posterior a la línea base. Por tanto no existe un commit «después» ni un porcentaje de reducción justificable. Los cambios visuales y los círculos de otras paradas no se contabilizan como ahorro de CO₂e.

## 6. Protocolo reproducible de continuación

1. Resolver las incidencias funcionales y de accesibilidad de la revisión. Identificar el nuevo commit y registrar su entorno; no sobrescribir las evidencias de este corte.
2. Preparar datos de prueba aislados y una cuenta por rol necesario; registrar volumen, fechas, restricciones viales y servicios externos. No guardar contraseñas en los reportes.
3. Medir el build de producción servido en la misma máquina, con navegador y versión identificados. Conservar escenarios separados para acceso, dashboard, pedidos, rutas y sostenibilidad.
4. Ejecutar tres mediciones Lighthouse por escenario y estado, con igual viewport, CPU/red, condiciones de caché y servicios. Conservar cada JSON/HTML y calcular la mediana; no mezclar modo desarrollo con producción.
5. Capturar la transferencia HTTP y el número de solicitudes por navegación, separando aplicación, fuentes, teselas y API. Conservar escenarios de primera visita y visita repetida. No publicar cookies ni cabeceras de autorización.
6. Medir la API sobre los mismos endpoints, carga y datos antes/después; conservar distribución, media y P95. Registrar planes SQL antes de crear o cambiar índices.
7. Implementar las acciones del documento 04 en cambios revisables, ejecutando regresión y medición tras cada grupo. Guardar un commit posterior distinto para comparar.
8. Calcular la estimación digital con una versión identificada del modelo, factores citados y supuestos explícitos. Justificar visitas anuales con datos de uso, no con una cifra arbitraria.

## 7. Método ambiental y límites

La plantilla interna propone Sustainable Web Design Model (SWDM), versión 4. Sus factores deben verificarse con la fuente vigente y registrarse con fecha antes del cálculo final. En esta edición no se consultó una fuente externa ni se validaron esos factores; no se copian valores de un ejemplo MERN como si fueran mediciones del proyecto.

La relación general que se evaluará es:

```text
Energía estimada por visita = transferencia medida × factor energético del modelo
Emisiones estimadas por visita = energía estimada × intensidad de carbono documentada
Ahorro anual estimado = (emisiones antes − emisiones después) × visitas anuales justificadas
```

Una estimación basada en bytes no es una medición eléctrica del servidor, ni certifica toda la huella de fabricación del hardware. Se deberá declarar qué componentes operativos e incorporados cubre la versión elegida, cómo trata la caché y si usa intensidad global o del país. No se proyecta un ahorro anual sin esos datos.

## 8. Conclusiones y referencias

El corte dispone de diagnóstico de código y tamaños reproducibles, pero aún no prueba una reducción ambiental. Las prioridades son estabilizar la regresión, medir una línea base de uso real controlado y completar las áreas parciales o pendientes de la [evaluación técnica](04%20Est%C3%A1ndares%20arquitectura%20y%20gu%C3%ADa%20de%20desarrollo%20verde%20V_1_0_0.md). El criterio de informe ambiental queda parcial.

Fuentes utilizadas: código del commit indicado; [estándares del proyecto](../reduccion%20del%20impacto%20ambiental/02%20Estandares%20Ingenier%C3%ADa%20de%20software%20V_1_0_1.md); [plantilla ambiental](../reduccion%20del%20impacto%20ambiental/Plantilla%20del%20informe%20de%20reduccion%20del%20impacto%20ambiental.md); [registros de ejecución](evidencias/README.md). Las referencias normativas de esos documentos son antecedentes, no una nueva auditoría de conformidad.

## Control de versiones del documento

| Versión | Fecha | Autoría / cambio |
|---|---|---|
| V_1_0_0 | 12/11/2026 | Elaboración asistida por Codex a solicitud del usuario. Diagnóstico del commit `7ea33a1`, medición exacta de artefactos y protocolo antes/después; sin cifras ambientales inventadas. |

[← Volver al índice correspondiente](README.md)
