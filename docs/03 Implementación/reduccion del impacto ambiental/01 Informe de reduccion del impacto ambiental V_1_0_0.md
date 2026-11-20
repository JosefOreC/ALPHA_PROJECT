# Informe de reducción del impacto ambiental y optimización del sistema

**Proyecto:** EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Líder del proyecto:** Ore Campos, Josef Pablo.

**Versión del documento:** V_1_0_0.

**Versión semántica de entrega:** v1.0.0.

**Fecha:** 13/11/2026, America/Lima (UTC−05:00).

**Revisión técnica y documental:** Ore Campos, Josef Pablo; Cueva Ricse, Alex.

**Antecedente de estructura:** Rojas Camayo, Valentino Jhan Pierre; guía y plantilla integradas en main.

**Alcance de publicación:** actualización de documentación Markdown. Las implementaciones y las mediciones descritas corresponden al incremento local auditado; sus archivos productivos y nuevos artefactos no se incorporan con esta publicación.

## 1. Informe de reducción del impacto ambiental

### 1.1 Introducción y propósito

El informe documenta la refactorización de EcoLogística Lima en ocho áreas de eficiencia y su evaluación mediante Lighthouse y el Sustainable Web Design Model (SWDM), versión 4. La implementación conserva React/TypeScript/Vite, FastAPI y PostgreSQL/PostGIS. Las equivalencias respecto del stack MERN de la rúbrica se declaran expresamente.

El objetivo consiste en reducir trabajo y transferencia innecesarios, mantener los flujos de operación y cuantificar el efecto bajo condiciones reproducibles. La comparación utiliza la base 6e36e35 y el incremento final identificado por hashes. Los datos son ficticios; las estimaciones digitales no se confunden con emisiones de vehículos.

### 1.2 Diagnóstico inicial y condiciones

El diagnóstico identificó precarga de Pedidos, páginas superiores a 12, ausencia de picture y React Query y negociación HTTP incompleta. Algunas optimizaciones, como lazy y SVG inline, proceden de implementaciones anteriores y se conservan con su historial. La línea base comparable ya contenía parte de esas mejoras; por ello no se le atribuyen los valores demostrativos de la guía HTML.

Se realizaron tres cargas por pantalla y estado con Lighthouse 13.6.0, Chromium 153.0.8010.12, HTTPS/HTTP/2, 150 pedidos sintéticos y perfil móvil 412 × 823; RTT 150 ms, 1638,4 Kbps y CPU ×4. Los estados utilizan el mismo entorno y caché restablecida.

| Métrica inicial, mediana | Acceso | Pedidos |
|---|---|---|
| Rendimiento /100 | 100 | 100 |
| FCP, ms | 778,2259 | 781,9679 |
| LCP, ms | 778,2259 | 1331,9667 |
| TBT, ms | 52 | 85,5 |
| CLS | 0 | 0 |
| Transferencia, bytes | 92870 | 101845 |

### 1.3 Detalle técnico de las ocho optimizaciones

Los siguientes fragmentos se extraen del código y del historial del proyecto. Conservan la sintaxis de su lenguaje y se interpretan dentro del módulo y sus dependencias; no son programas autónomos. Cada par identifica su archivo y alcance. La comparación de imágenes incluye una incorporación nueva; la de SVG muestra la creación del sistema, sin inventar una dependencia o un archivo raster previo.

#### 1.3.1 Consultas magras e índices SQL

**Diagnóstico e implementación:** La planificación consultaba columnas completas y el resumen repetía lecturas. Se incorporaron proyecciones e índices; el incremento añade filtros y agregados SQL antes de paginar.

**Antes:**

```python
orders = query("SELECT * FROM pedidos WHERE estado='PENDIENTE' AND conductor_id IS NULL AND latitud IS NOT NULL AND longitud IS NOT NULL AND (ventana_inicio AT TIME ZONE 'America/Lima')::date=%s ORDER BY ventana_inicio,pedido_id LIMIT 151",(start.date(),))
```

**Después:**

```python
orders = query("SELECT pedido_id,cliente_nombre,distrito,estado,latitud,longitud,ventana_inicio,ventana_fin,peso_kg,version FROM pedidos WHERE estado='PENDIENTE' AND conductor_id IS NULL AND latitud IS NOT NULL AND longitud IS NOT NULL AND (ventana_inicio AT TIME ZONE 'America/Lima')::date=%s ORDER BY ventana_inicio,pedido_id LIMIT 151",(start.date(),))

# Adiciones para filtros operativos y autenticación; no reescribe datos.
```

**Trazabilidad y alcance:** postgres_portal.py y migrations/005_read_indexes.sql; historial 3b5bdae → 9f953d6. La adaptación SQL evita la hidratación de un ORM de documentos; no utiliza .lean() ni MongoDB.

#### 1.3.2 Paginación de 12 en servidor e interfaz

**Diagnóstico e implementación:** Pedidos descargaba páginas de 100 y filtraba después de precargar. El servidor aplica búsqueda y alcance antes de LIMIT/OFFSET; la interfaz solicita una página y conserva conteos.

**Antes:**

```tsx
const PAGE_SIZE = 100
const MAX_PAGES = 20

async function loadAll(service: Management): Promise<ManagedOrder[]> {
  const orders: ManagedOrder[] = []
  for (let page = 0; page < MAX_PAGES; page++) {
    const result = await service.list({ limit: PAGE_SIZE, offset: page * PAGE_SIZE })
    orders.push(...result.items)
    if (!result.has_more) break
  }
  return orders
}
```

**Después:**

```tsx
const PAGE_SIZE = 12

useEffect(() => {
  let active = true
  Promise.all([service.permissions(), service.list({ limit: PAGE_SIZE, offset, ...(query.trim() ? { query: query.trim() } : {}), ...(tab === 'ALL' ? {} : { status: tab }), ...(district ? { district } : {}) })])
    .then(([access, page]) => {
      if (!active) return
      setPermissions(access)
      setOrders(page.items)
      setHasMore(page.has_more)
      setTotal(page.total ?? page.items.length)
      setServerCounts(page.counts ? { ...page.counts, ALL: page.counts.PENDIENTE + page.counts.EN_CAMINO + page.counts.ENTREGADO + page.counts.CANCELADO } : null)
      setServerSummary(page.summary ? { pending: page.summary.PENDIENTE, inTransit: page.summary.EN_CAMINO, delivered: page.summary.ENTREGADO, cancelled: page.summary.CANCELADO } : null)
      if (!page.items.length && offset > 0 && page.total !== undefined) setOffset(Math.max(0, Math.ceil(page.total / PAGE_SIZE) - 1) * PAGE_SIZE)
      setError('')
    })
    .catch(reason => {
      if (!active) return
      setPermissions({ can_write: false })
      setOrders([])
      setError(message(reason, 'No se pudo cargar el listado.'))
    })
    .finally(() => {
      if (active) setLoadedKey(requestKey)
    })
  return () => {
    active = false
  }
}, [service, requestKey, offset, query, tab, district])
```

**Trazabilidad y alcance:** OrderManagementView.tsx y postgres_orders.py; base 6e36e35 frente al incremento. Flota, Conductores y Registros también solicitan 12.

#### 1.3.3 Imagen adaptativa AVIF/WebP

**Diagnóstico e implementación:** El acceso no tenía fotografía ni picture. Se incorporó una imagen con tres tamaños por formato y JPEG de respaldo; las dimensiones se reservan y la descarga espera la resolución de sesión.

**Antes:**

```tsx
// El acceso no incluía una imagen raster ni un elemento picture.
```

**Después:**

```tsx
import avif360 from '../../assets/login-logistica-360.avif?no-inline'
import avif640 from '../../assets/login-logistica-640.avif?no-inline'
import avif960 from '../../assets/login-logistica-960.avif?no-inline'
import webp360 from '../../assets/login-logistica-360.webp?no-inline'
import webp640 from '../../assets/login-logistica-640.webp?no-inline'
import webp960 from '../../assets/login-logistica-960.webp?no-inline'
import jpeg360 from '../../assets/login-logistica-360.jpg?no-inline'
import jpeg640 from '../../assets/login-logistica-640.jpg?no-inline'
import jpeg960 from '../../assets/login-logistica-960.jpg?no-inline'

const sizes = '(max-width: 700px) calc(100vw - 78px), 394px'
export function LoginIllustration({ enabled = true }: { enabled?: boolean }) {
  return <figure className="eco-login__illustration">
    {enabled ? <picture>
      <source type="image/avif" srcSet={`${avif360} 360w, ${avif640} 640w, ${avif960} 960w`} sizes={sizes} />
      <source type="image/webp" srcSet={`${webp360} 360w, ${webp640} 640w, ${webp960} 960w`} sizes={sizes} />
      <img src={jpeg640} srcSet={`${jpeg360} 360w, ${jpeg640} 640w, ${jpeg960} 960w`} sizes={sizes}
        width={960} height={320} alt="Repartidor con un paquete junto a una furgoneta de distribución urbana."
        loading="eager" fetchPriority="high" decoding="async" />
    </picture> : <div className="eco-login__image-placeholder" aria-hidden="true" />}
    <figcaption>Distribución urbana · imagen ilustrativa generada con IA</figcaption>
  </figure>
}
```

**Trazabilidad y alcance:** LoginIllustration.tsx y SessionToolbar.tsx. El registro del recurso documenta su procedencia; el PNG fuente no estuvo desplegado como imagen histórica.

#### 1.3.4 Carga diferida con React.lazy/Suspense

**Diagnóstico e implementación:** Las importaciones directas incorporaban vistas al arranque. Las vistas secundarias y motores de mapas se distribuyen como módulos diferidos.

**Antes:**

```tsx
import { OrderManagementView } from './interfaces/OrderManagementView';
```

**Después:**

```tsx
const OrderManagementView = lazy(() => import('./interfaces/OrderManagementView').then(m => ({ default: m.OrderManagementView })));
<Suspense fallback={<main className="eco-root eco-content"><p role="status">Cargando módulo…</p></main>}><AuthorizedApp key={session.user.subjectId} /></Suspense>;
```

**Trazabilidad y alcance:** App.tsx; historial 3b5bdae → 9f953d6 e implementación conservada. React Query permanece en Registros, fuera de la navegación auditada.

#### 1.3.5 Sustitución auxiliar por APIs nativas

**Diagnóstico e implementación:** El encuadre creaba tuplas y objetos Leaflet para obtener extremos. boundsOf recorre las coordenadas con Math y conserva la cámara de Leaflet.

**Antes:**

```typescript
import L from 'leaflet'
import type { GeoPoint, MapData } from '../../domain/mapData'
import { LIMA_REGION, visiblePoints } from '../../domain/mapPresentation'
import type { MapLayers } from '../../domain/mapPresentation'

export const LIMA_BOUNDS: L.LatLngTuple[] = [[LIMA_REGION.south, LIMA_REGION.west], [LIMA_REGION.north, LIMA_REGION.east]]
export const toTuple = (point: GeoPoint): [number, number] => [point.lat, point.lng]
export function fitVisible(map: L.Map, data: MapData, layers: MapLayers) {
  const points = visiblePoints(data, layers)
  if (points.length) map.fitBounds(L.latLngBounds(points.map(toTuple)), { padding: [32, 64], maxZoom: 15, animate: false })
  else map.setView(toTuple(LIMA_REGION.center), 12, { animate: false })
  map.panInsideBounds(LIMA_BOUNDS, { animate: false })
}
```

**Después:**

```typescript
import type L from 'leaflet'
import type { GeoPoint, MapData } from '../../domain/mapData'
import { LIMA_REGION, visiblePoints } from '../../domain/mapPresentation'
import type { MapLayers } from '../../domain/mapPresentation'

export const LIMA_BOUNDS: L.LatLngTuple[] = [[LIMA_REGION.south, LIMA_REGION.west], [LIMA_REGION.north, LIMA_REGION.east]]
export const toTuple = (point: GeoPoint): [number, number] => [point.lat, point.lng]
/** Native bounds calculation; Leaflet remains responsible for the map camera. */
export function boundsOf(points: GeoPoint[]): [[number, number], [number, number]] {
  if (!points.length) throw new RangeError('Se requiere al menos una ubicación.')
  let south = Infinity, west = Infinity, north = -Infinity, east = -Infinity
  for (const { lat, lng } of points) {
    south = Math.min(south, lat); north = Math.max(north, lat)
    west = Math.min(west, lng); east = Math.max(east, lng)
  }
  return [[south, west], [north, east]]
}
export function fitVisible(map: L.Map, data: MapData, layers: MapLayers) {
  const points = visiblePoints(data, layers)
  if (points.length) map.fitBounds(boundsOf(points), { padding: [32, 64], maxZoom: 15, animate: false })
  else map.setView(toTuple(LIMA_REGION.center), 12, { animate: false })
  map.panInsideBounds(LIMA_BOUNDS, { animate: false })
}
```

**Trazabilidad y alcance:** interfaces/map/viewport.ts. Las pruebas comparan los resultados contra Leaflet. No se retira el paquete completo ni se atribuye ahorro global de bundle.

#### 1.3.6 SVG en línea

**Diagnóstico e implementación:** El antecedente del archivo de iconos corresponde a un estado anterior a su creación. Los iconos se incorporaron como componentes reutilizables.

**Antes:**

```tsx
// El archivo de iconos no existía en el padre de c142f0d.
```

**Después:**

```tsx
import type { ReactNode, SVGProps } from 'react'

type IconProps = Omit<SVGProps<SVGSVGElement>, 'children'> & { size?: 'md' }

function Glyph({ className, size, children, ...rest }: IconProps & { children: ReactNode }) {
  const classes = ['eco-icon', size === 'md' ? 'eco-icon--md' : '', className ?? ''].filter(Boolean).join(' ')
  return (
    <svg className={classes} viewBox="0 0 24 24" aria-hidden="true" {...rest}>
      {children}
    </svg>
  )
}
```

**Trazabilidad y alcance:** shared/ui/icons.tsx; introducción histórica c142f0d y marcadores conservados. No hubo una conversión histórica demostrada desde raster.

#### 1.3.7 Caché HTTP y React Query

**Diagnóstico e implementación:** Registros cargaba manualmente las respuestas. Se incorporó useQuery con claves por identidad, rol, módulo y página, además de invalidación y limpieza de sesión.

**Antes:**

```tsx
useEffect(() => {
  const controller = new AbortController()
  const path = module === 'auditoria' ? '/api/audit' : '/api/incidents'
  requestJson<Record<string, unknown>[]>(`${path}?limit=20&offset=${offset}`, { signal: controller.signal })
    .then(value => { if (!controller.signal.aborted) { setItems(value.slice(0,20)); setHasMore(value.length>20); setError('') } }).catch(reason => { if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : 'No se pudo cargar el listado.') })
  if (user.role === 'driver' && module === 'incidencias') requestJson<DriverRoute>('/api/conductor/ruta', { signal: controller.signal }).then(setRoute).catch(() => undefined)
  return () => controller.abort()
}, [module, reload, user.role, offset])
```

**Después:**

```tsx
const records = useQuery({
  queryKey: ['records', user.subjectId, user.role, module, offset, reload],
  queryFn: ({ signal }) => requestJson<Record<string, unknown>[] | { items: Record<string, unknown>[]; has_more: boolean }>(`${path}?limit=12&offset=${offset}&paged=true`, { signal }),
}, queryClient)
```

**Trazabilidad y alcance:** RecordsView.tsx y http_efficiency.py. JSON privado con ETag débil/304; sesión, mutaciones y errores con no-store; recursos versionados inmutables.

#### 1.3.8 Negociación Brotli/Gzip

**Diagnóstico e implementación:** La selección estática solo evaluaba br/gzip y no añadía Vary al original. Se incorporaron identity, calidad y contingencias; gzip dinámico respeta preferencias.

**Antes:**

```python
def accepted_encodings(header):
    qualities = {}
    for item in header.lower().split(','):
        name, *parameters = item.strip().split(';')
        try:
            quality = next((float(value.strip()[2:]) for value in parameters if value.strip().startswith('q=')), 1.0)
        except ValueError:
            quality = 0
        qualities[name] = quality if 0 <= quality <= 1 else 0
    return sorted((name for name in ('br', 'gzip') if qualities.get(name, qualities.get('*', 0)) > 0),
                  key=lambda name: -qualities.get(name, qualities.get('*', 0)))
```

**Después:**

```python
def representation_order(header):
    """Include identity in quality selection; prefer compression on ties."""
    qualities = {}
    for item in header.lower().split(','):
        name, *parameters = item.strip().split(';')
        try:
            value = next((float(p.strip()[2:]) for p in parameters if p.strip().startswith('q=')), 1.0)
        except ValueError:
            value = 0
        qualities[name] = value if 0 <= value <= 1 else 0
    # An unspecified identity is a fallback, not an explicit preference over gzip.
    identity = qualities.get('identity', 0 if qualities.get('*') == 0 else -1)
    candidates = [(name, qualities.get(name, qualities.get('*', 0))) for name in ('br', 'gzip')]
    candidates.append(('identity', identity))
    return [name for name, quality in sorted(candidates, key=lambda item: -item[1]) if quality != 0]
```

**Trazabilidad y alcance:** static_assets.py, http_efficiency.py y deps.py. La precompresión de build utiliza node:zlib y conserva originales.

### 1.4 Comparación antes y después

La variación se calcula como después − antes y el porcentaje como variación / antes × 100. En tiempos, bytes y emisiones un porcentaje negativo indica reducción; en score, un incremento es favorable. Si la referencia es cero, el porcentaje no es calculable.

| Pantalla / métrica | Antes | Después | Variación absoluta | Variación, % |
|---|---|---|---|---|
| Acceso: Rendimiento /100 | 100 | 100 | 0 | 0,00 |
| Acceso: FCP, ms | 778,2259 | 776,9365 | -1,2894 | -0,17 |
| Acceso: LCP, ms | 778,2259 | 1277,9365 | 499,7106 | 64,21 |
| Acceso: TBT, ms | 52 | 41 | -11 | -21,15 |
| Acceso: CLS | 0 | 0 | 0 | No calculable: base 0 |
| Acceso: Transferencia, bytes | 92870 | 102890 | 10020 | 10,79 |
| Acceso: g CO₂e/carga | 0,01376333400 | 0,01524829800 | 0,00148496400 | 10,79 |
| Pedidos: Rendimiento /100 | 100 | 100 | 0 | 0,00 |
| Pedidos: FCP, ms | 781,9679 | 783,0644 | 1,0965 | 0,14 |
| Pedidos: LCP, ms | 1331,9667 | 1311,0644 | -20,9023 | -1,57 |
| Pedidos: TBT, ms | 85,5 | 66 | -19,5 | -22,81 |
| Pedidos: CLS | 0 | 0 | 0 | No calculable: base 0 |
| Pedidos: Transferencia, bytes | 101845 | 101627 | -218 | -0,21 |
| Pedidos: g CO₂e/carga | 0,015093429000 | 0,015061121400 | -0,000032307600 | -0,21 |

El número de solicitudes se conserva en los resúmenes originales; no se utiliza como sustituto de la transferencia. El tiempo medio de API de la guía no se extrapola al proyecto: la presente auditoría usa métricas de navegación y las mediciones HTTP históricas se conservan con su propio entorno.

### 1.5 Impacto ambiental y eficiencia energética

Se aplicó el [modelo Sustainable Web Design, versión 4](https://sustainablewebdesign.org/estimating-digital-emissions/), con GB decimal, intensidad global de 494 g CO₂e/kWh, proporción de visitantes nuevos igual a 1 y proporciones de visitantes recurrentes, caché y alojamiento verde iguales a 0. Estos parámetros describen un escenario de primera visita.

| Segmento | Energía operativa, kWh/GB | Energía incorporada equivalente, kWh/GB |
|---|---|---|
| Centros de datos | 0,055 | 0,012 |
| Redes | 0,059 | 0,013 |
| Dispositivos | 0,080 | 0,081 |
| Total | 0,194 | 0,106 |

La suma de ambos componentes es 0,300 kWh equivalentes/GB. La energía incorporada equivalente representa el componente del modelo asociado al ciclo de vida de la infraestructura; se diferencia de la electricidad operativa estimada.

```text
GB = bytes / 1 000 000 000
E_operativa = GB × 0,194
E_incorporada_equivalente = GB × 0,106
E_total_equivalente = E_operativa + E_incorporada_equivalente
Emisiones_gCO2e = E_total_equivalente × 494
Ahorro_anual_kgCO2e = (gCO2e_antes − gCO2e_después) × visitas_anuales / 1000
```

El consolidador utiliza `Decimal` y calcula con los valores completos. Las cifras presentadas en las tablas no se vuelven a introducir como datos redondeados.

#### 1.5.1 Energía y emisiones por visita

| Pantalla | kWh operativos después | kWh incorporados equivalentes después | kWh equivalentes totales después | g CO₂e antes | g CO₂e después |
|---|---|---|---|---|---|
| Acceso | 0,00001996066 | 0,00001090634 | 0,00003086700 | 0,01376333400 | 0,01524829800 |
| Pedidos | 0,000019715638 | 0,000010772462 | 0,000030488100 | 0,015093429000 | 0,015061121400 |

Por ejemplo, Acceso transfiere 102890 bytes: 0,000102890 GB × 0,300 kWh/GB = 0,00003086700 kWh equivalentes. Al multiplicar por 494 g CO₂e/kWh se obtienen 0,01524829800 g CO₂e por carga del escenario.

#### 1.5.2 Proyección anual e interpretación

La proyección supone **10000 visitas anuales por pantalla**. Se trata de una hipótesis de uso, no de una medición de actividad empresarial.

| Pantalla | Ahorro algebraico anual, kg CO₂e | Interpretación |
|---|---|---|
| Acceso | −0,01484964000 | Incremento estimado por añadir la imagen. |
| Pedidos | 0,000323076000 | Reducción estimada bajo el escenario declarado. |

El signo negativo de Acceso expresa un incremento. Las diferencias pequeñas de Pedidos no permiten establecer significación estadística con tres cargas. Los resultados se informan por pantalla; su extrapolación al conjunto del sistema requeriría conocer frecuencia de uso, caché y distribución de recorridos.

#### 1.5.3 Comparación de formatos y antecedentes

Para el mismo recorte de imagen a 640 px, AVIF ocupa 9515 bytes, WebP 21010 y JPEG 31480. Elegir AVIF en lugar de servir siempre ese JPEG evita 21965 bytes de contenido por descarga. Bajo los mismos parámetros y 10000 descargas anuales, la diferencia equivale a **0,03255213 kg CO₂e estimados**. Esta comparación excluye cabeceras HTTP y utiliza como referencia el JPEG de la misma imagen, no el sitio anterior sin fotografía.

Los resultados históricos de [bd95dc9 frente a 1d52506](../Sprint%204/evidencias/metricas-bd95dc9/README.md) y del [incremento anterior a la imagen](../Sprint%204/evidencias/fase3-6e36e35/README.md) permanecen disponibles. Cada serie tiene su propia base y entorno; sus ahorros no se trasladan a la versión final.

#### 1.5.4 Verificación matemática

La optimización de formato reduce el coste de incorporar la imagen frente a servir JPEG. En la comparación completa con la base sin fotografía, Acceso aumenta su transferencia y Pedidos presenta una reducción pequeña. El principal resultado funcional de la paginación es evitar la precarga masiva de pedidos; su efecto anual debe evaluarse con un modelo de navegación real.

El [consolidador](https://github.com/JosefOreC/ALPHA_PROJECT/blob/6e36e355e0d39c83c5700a83eb0987b6fd849a10/docs/03%20Implementaci%C3%B3n/Sprint%204/evidencias/metricas-bd95dc9/consolidar_metricas.py) conserva parámetros y desglose por segmento. El validador (`validar.py`, registro local) comprueba 18 igualdades de sumas, conversiones y proyección anual, además de las huellas de los artefactos. Los cálculos son estimaciones del modelo: no representan electricidad medida, inventario corporativo de carbono ni emisiones físicas evitadas del reparto.

### 1.6 Evidencias de validación

Los reportes Lighthouse consolidados (`auditoria-consolidada.html`, registro local) enlazan doce originales: tres cargas por pantalla antes y después. La serie final cumple todos los límites en sus seis cargas posteriores. Los resultados individuales están en el [documento de auditoría](../Sprint%204/06%20Auditor%C3%ADa%20consolidada%20de%20m%C3%A9tricas%20V_1_0_0.md).

La validación comprende 475 pruebas frontend, 447 backend del control ordinario, siete integraciones PostGIS independientes, 12 Node, 56 de navegador y seis regresiones finales de acceso e imagen. Los [recibos](../Sprint%204/01%20Revisi%C3%B3n%20del%20Sprint%20V_1_2_0.md) distinguen ejecuciones, subpruebas y omisiones. La revisión manual completa de accesibilidad se registra por separado.

## 2. Conclusiones

El incremento cumple los límites de rendimiento del banco declarado y completa las ocho áreas dentro del alcance adaptado. La paginación evita la precarga masiva y las pruebas de integración conservan los flujos de pedidos, permisos y rutas. La imagen aumenta el coste de Acceso respecto de una versión sin fotografía; AVIF reduce ese coste frente a servir JPEG, sin convertirlo en un ahorro neto observado del sitio.

La evaluación debe considerar la equivalencia SQL/PostGIS y el alcance auxiliar de la sustitución nativa. Los resultados locales no garantizan valores idénticos en otro despliegue. El workflow, estándares y reglas de mantenimiento se presentan en el documento 02 y en el registro de automatización del sprint.

## 3. Referencias

- Sustainable Web Design, [Estimating Digital Emissions — SWDM v4](https://sustainablewebdesign.org/estimating-digital-emissions/).
- [Guía de estilo documental del proyecto](../Gu%C3%ADas%20t%C3%A9cnicas/Gu%C3%ADa%20de%20estilo%20documental.md).
- [Estándares y guía de desarrollo verde](02%20Estandares%20Ingenier%C3%ADa%20de%20software%20V_1_0_1.md).

## Validación automatizada posterior

La validación LHCI posterior registró un incumplimiento de TBT en Acceso (167 ms frente al límite de 85 ms) y tres cargas conformes en Pedidos. La serie histórica raster-sesion conserva sus seis cargas conformes; el nuevo resultado se presenta por separado y deja pendiente comprobar la estabilidad del gate de Acceso. Véase el [registro de automatización](../Sprint%204/07%20Automatizacion%20CI%20y%20gestion%20de%20versiones%20V_1_0_0.md).

## Control de versiones del documento

| Versión | Fecha | Autoría / cambio |
|---|---|---|
| V_1_0_0 | 12/11/2026 | Rojas Camayo, Valentino Jhan Pierre. Estructura de referencia del informe. |
| V_1_0_0 | 13/11/2026 | Ore Campos, Josef Pablo; Cueva Ricse, Alex. Revisión técnica y documental de diagnóstico, código comparativo, resultados y cálculo SWDM. |

[← Volver al índice correspondiente](README.md)
