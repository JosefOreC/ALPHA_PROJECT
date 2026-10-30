import { act, render, waitFor } from '@testing-library/react'
import { beforeEach, expect, it, vi } from 'vitest'
import type { Mock } from 'vitest'
import VectorBasemap from './VectorBasemap'

const mocks = vi.hoisted(() => ({ useMap: vi.fn(), maplibreGL: vi.fn(), setWorkerUrl: vi.fn() }))
vi.mock('react-leaflet', () => ({ useMap: mocks.useMap }))
vi.mock('@maplibre/maplibre-gl-leaflet', () => ({ maplibreGL: mocks.maplibreGL }))
vi.mock('maplibre-gl', () => ({ setWorkerUrl: mocks.setWorkerUrl }))

let events: Record<string, (value?: unknown) => void>
let container: HTMLDivElement
let canvasContext: Mock<() => RenderingContext | null>
let layer: { getEvents?: () => Record<string, (value?: unknown) => void>; getSize: ReturnType<typeof vi.fn>; getContainer: ReturnType<typeof vi.fn>; getMaplibreMap: ReturnType<typeof vi.fn>; addTo: ReturnType<typeof vi.fn> }
let map: { getContainer: () => HTMLDivElement; attributionControl?: { addAttribution: ReturnType<typeof vi.fn> }; hasLayer: ReturnType<typeof vi.fn>; removeLayer: ReturnType<typeof vi.fn> }
let base: { on: ReturnType<typeof vi.fn>; resize: ReturnType<typeof vi.fn> }
beforeEach(() => {
  vi.restoreAllMocks()
  events = {}; container = document.createElement('div')
  const move = vi.fn()
  base = { on: vi.fn((name: string, handler: (value?: unknown) => void) => { events[name] = handler }), resize: vi.fn() }
  layer = { getEvents: () => ({ move }), getSize: vi.fn(() => ({ x: 640, y: 480 })), getContainer: vi.fn(() => container), getMaplibreMap: vi.fn(() => base), addTo: vi.fn() }
  map = { getContainer: () => container, attributionControl: { addAttribution: vi.fn() }, hasLayer: vi.fn(() => true), removeLayer: vi.fn() }
  mocks.useMap.mockReturnValue(map); mocks.maplibreGL.mockReturnValue(layer)
  canvasContext = vi.fn(() => ({ getExtension: vi.fn(() => ({ loseContext: vi.fn() })) }) as unknown as WebGL2RenderingContext)
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(canvasContext)
  vi.stubGlobal('fetch', vi.fn(async () => Response.json({ version: 8, sources: {}, layers: [] })))
})

it('monta la cartografía, registra créditos, ajusta tamaño y limpia al desmontar', async () => {
  const onError = vi.fn()
  const view = render(<VectorBasemap onError={onError} />)
  await waitFor(() => expect(layer.addTo).toHaveBeenCalledWith(map))
  expect(container.dataset.basemap).toBe('vector-pastel')
  expect(map.attributionControl?.addAttribution).toHaveBeenCalledWith(expect.stringContaining('OpenStreetMap'))
  act(() => events.load())
  expect(container.dataset.basemapReady).toBe('true')
  act(() => layer.getEvents?.().resize({ type: 'resize' }))
  expect(container.style.width).toBe('640px')
  expect(base.resize).toHaveBeenCalledOnce()
  act(() => events.error({ sourceId: 'openmaptiles' }))
  expect(onError).not.toHaveBeenCalled()
  const resize = layer.getEvents?.().resize
  view.unmount()
  expect(map.removeLayer).toHaveBeenCalledWith(layer)
  expect(container.dataset.basemap).toBeUndefined()
  resize?.({ type: 'resize' })
  expect(base.resize).toHaveBeenCalledOnce()
})

it('solo informa errores de la fuente inicial y usa el callback actualizado', async () => {
  const original = vi.fn(); const updated = vi.fn()
  const view = render(<VectorBasemap onError={original} />)
  await waitFor(() => expect(events.error).toBeDefined())
  view.rerender(<VectorBasemap onError={updated} />)
  act(() => { events.error({}); events.error({ sourceId: 'another' }) })
  expect(updated).not.toHaveBeenCalled()
  act(() => events.error({ sourceId: 'openmaptiles' }))
  expect(updated).toHaveBeenCalledWith(expect.stringContaining('descargar'))
  act(() => events.webglcontextlost())
  expect(updated).toHaveBeenCalledWith(expect.stringContaining('navegador'))
  expect(original).not.toHaveBeenCalled()
  view.unmount()
  events.webglcontextlost()
  expect(updated).toHaveBeenCalledTimes(2)
})

it.each(['http', 'network', 'unknown', 'webgl'])('explica un fallo de cartografía: %s', async scenario => {
  if (scenario === 'http') vi.stubGlobal('fetch', vi.fn(async () => new Response(null, { status: 404 })))
  if (scenario === 'network') vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
  if (scenario === 'unknown') vi.stubGlobal('fetch', vi.fn().mockRejectedValue('offline'))
  if (scenario === 'webgl') canvasContext.mockReturnValue(null)
  const onError = vi.fn()
  render(<VectorBasemap onError={onError} />)
  await waitFor(() => expect(onError).toHaveBeenCalledOnce())
  expect(onError.mock.calls[0][0]).toMatch(/No se pudo/)
})

it('tolera APIs opcionales ausentes y una capa ya retirada', async () => {
  layer.getEvents = undefined
  map.attributionControl = undefined
  map.hasLayer.mockReturnValue(false)
  canvasContext.mockReturnValue({ getExtension: () => null } as unknown as WebGL2RenderingContext)
  const view = render(<VectorBasemap onError={vi.fn()} />)
  await waitFor(() => expect(layer.addTo).toHaveBeenCalled())
  const adapted = layer as { getEvents?: () => Record<string, (value?: unknown) => void> }
  adapted.getEvents?.().resize({})
  expect(base.resize).toHaveBeenCalledOnce()
  view.unmount()
  expect(map.removeLayer).not.toHaveBeenCalled()
})

it.each([false, true])('ignora una carga cancelada aunque la petición termine con error=%s', async failed => {
  let resolve!: (value: Response) => void; let reject!: (reason: unknown) => void
  vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>((done, fail) => { resolve = done; reject = fail })))
  const onError = vi.fn()
  const view = render(<VectorBasemap onError={onError} />)
  view.unmount()
  await act(async () => { if (failed) reject(new Error('aborted')); else resolve(Response.json({})) })
  expect(onError).not.toHaveBeenCalled()
  expect(layer.addTo).not.toHaveBeenCalled()
})
