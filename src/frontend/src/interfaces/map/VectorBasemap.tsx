import { maplibreGL } from '@maplibre/maplibre-gl-leaflet'
import { setWorkerUrl } from 'maplibre-gl'
import type { StyleSpecification } from 'maplibre-gl'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'

setWorkerUrl(workerUrl)

type Props = { onError: (message: string) => void }
const DRAW_ERROR = 'No se pudo dibujar la cartografía en este navegador.'

/** Vector base only. Leaflet retains camera, limits, routes and selectable markers. */
export default function VectorBasemap({ onError }: Props) {
  const map = useMap()
  const report = useRef(onError)
  useEffect(() => { report.current = onError }, [onError])
  useEffect(() => {
    const controller = new AbortController()
    let active = true
    let loaded = false
    let layer: ReturnType<typeof maplibreGL> | undefined
    const container = map.getContainer()
    const fail = (message: string) => { if (active) report.current(message) }
    const start = async () => {
      const response = await fetch(`${import.meta.env.BASE_URL}maps/lima-pastel.json`, { signal: controller.signal })
      if (!response.ok) throw new Error('No se pudo cargar el estilo del mapa.')
      const style: StyleSpecification = await response.json()
      if (!active) return
      const probe = document.createElement('canvas')
      const context = probe.getContext('webgl2')
      if (!context) throw new Error(DRAW_ERROR)
      context.getExtension('WEBGL_lose_context')?.loseContext()
      layer = maplibreGL({ style, attributionControl: false, renderWorldCopies: false, canvasContextAttributes: { antialias: true } })
      const vectorLayer = layer
      const events = vectorLayer.getEvents?.() ?? {}
      // The adapter queues resize callbacks that can outlive a removed Leaflet map.
      // Resize synchronously using public APIs; camera movement keeps its normal handler.
      vectorLayer.getEvents = () => ({ ...events, resize: event => {
        if (!active) return
        const size = vectorLayer.getSize()
        Object.assign(vectorLayer.getContainer().style, { width: `${size.x}px`, height: `${size.y}px` })
        vectorLayer.getMaplibreMap().resize()
        events.move?.call(vectorLayer, event)
      } })
      layer.addTo(map)
      const base = layer.getMaplibreMap()
      const credit = '<a href="https://openfreemap.org/">OpenFreeMap</a> · <a href="https://openmaptiles.org/">© OpenMapTiles</a> · <a href="https://www.openstreetmap.org/copyright">© OpenStreetMap</a>'
      map.attributionControl?.addAttribution(credit)
      base.on('load', () => { loaded = true; if (active) container.dataset.basemapReady = 'true' })
      base.on('error', event => {
        if (!loaded && 'sourceId' in event && event.sourceId === 'openmaptiles') fail('No se pudo descargar la cartografía. Revisa tu conexión.')
      })
      base.on('webglcontextlost', () => fail(DRAW_ERROR))
      container.dataset.basemap = 'vector-pastel'
    }
    void start().catch(reason => {
      if (controller.signal.aborted) return
      fail(reason instanceof Error && [DRAW_ERROR, 'No se pudo cargar el estilo del mapa.'].includes(reason.message)
        ? reason.message : 'No se pudo dibujar la cartografía. Revisa tu conexión o reintenta el mapa.')
    })
    return () => {
      active = false
      controller.abort()
      if (layer && map.hasLayer(layer)) map.removeLayer(layer)
      delete container.dataset.basemap
      delete container.dataset.basemapReady
    }
  }, [map])
  return null
}
