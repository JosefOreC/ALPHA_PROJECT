import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import type { ReactNode } from 'react'
import L from 'leaflet'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import type { MapData } from '../../domain/mapData'
import { MAP_PROFILES } from '../../domain/mapPresentation'
import LeafletCanvas from './LeafletCanvas'

const fake = vi.hoisted(() => ({
  map: {
    getSize: vi.fn(), invalidateSize: vi.fn(), setMinZoom: vi.fn(), getBoundsZoom: vi.fn(), panInsideBounds: vi.fn(),
    eachLayer: vi.fn(), getCenter: vi.fn(), getContainer: vi.fn(), getZoom: vi.fn(), on: vi.fn(), off: vi.fn(),
  },
  events: { click: vi.fn(), keydown: vi.fn<(event: { originalEvent: { key: string } }) => void>() },
}))
vi.mock('react-leaflet', () => ({
  useMap: () => fake.map,
  useMapEvents: (events: typeof fake.events) => { fake.events = events; return fake.map },
  MapContainer: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  Pane: () => null,
  Polyline: ({ className, eventHandlers }: { className: string; eventHandlers?: { click: () => void } }) =>
    <button type="button" aria-label={className} onClick={eventHandlers?.click} />,
  Marker: ({ title, children, eventHandlers }: { title?: string; children?: ReactNode; eventHandlers?: { click: () => void } }) =>
    <div>{title ? <button type="button" onClick={eventHandlers?.click}>{title}</button> : null}{children}</div>,
  Popup: ({ children, autoPan }: { children: ReactNode; autoPan: boolean }) =>
    <div role="group" aria-label="Tarjeta del mapa" data-autopan={autoPan}>{children}</div>,
  Tooltip: ({ children }: { children: ReactNode }) => <span>{children}</span>,
}))
vi.mock('./VectorBasemap', () => ({ default: () => null }))
vi.mock('./RouteDirections', () => ({ RouteDirections: () => null }))
vi.mock('./viewport', () => ({
  fitVisible: vi.fn(),
  LIMA_BOUNDS: [[-12.5, -77.4], [-11.5, -76.5]],
  toTuple: ({ lat, lng }: { lat: number; lng: number }) => [lat, lng],
}))

const depot = { lat: -12.04, lng: -76.97 }
const stop = { lat: -12.06, lng: -76.93 }
const uuid = 'cecc3dbc-f35e-47b2-90b7-3d9e380ab2d9'
const data: MapData = {
  depot: { name: 'Depósito', position: depot },
  routes: [
    { id: 'r1', driver: 'Ana', plate: 'ABC-123', color: 1, path: [depot, stop], done_until: 1 },
    { id: 'r2', plate: 'BCD-456', color: 2, path: [depot, stop], done_until: 0 },
  ],
  orders: [{ id: uuid, customer: 'Panadería', district: 'Ate', status: 'ENTREGADO',
    position: stop, window: '10:00–12:00', route_id: 'r1', co2_kg: 1.5, stop_number: 1 }],
  vehicles: [
    { id: 'v1', plate: 'ABC-123', position: stop, status: 'En ruta', color: 1, route_id: 'r1' },
    { id: 'v2', plate: 'LIB-002', position: depot, status: 'Disponible', color: 2, route_id: null },
  ],
}
const props = () => ({
  data, otherStops: [], layers: MAP_PROFILES.operations, compact: false, card: true, compareDrivers: false,
  onSelect: vi.fn(), onDismiss: vi.fn(), onReady: vi.fn(), onBasemapError: vi.fn(),
})

beforeEach(() => {
  fake.map.getCenter.mockReturnValue(depot)
  fake.map.getContainer.mockReturnValue(document.createElement('div'))
  fake.map.getZoom.mockReturnValue(12)
  fake.map.getSize.mockReturnValue({ x: 640, y: 480 })
  fake.map.getBoundsZoom.mockReturnValue(12.4)
  fake.map.eachLayer.mockImplementation(() => {})
})
afterEach(() => { vi.clearAllMocks(); vi.unstubAllGlobals() })

it('usa datos visibles para la tarjeta del pedido y oculta su identificador interno', () => {
  const callbacks = props()
  render(<LeafletCanvas {...callbacks} selection={{ kind: 'order', id: uuid }} />)
  const marker = screen.getByRole('button', { name: 'Panadería · Entregado' })
  fireEvent.click(marker)
  expect(callbacks.onSelect).toHaveBeenCalledWith({ kind: 'order', id: uuid })
  const card = within(screen.getByRole('group', { name: 'Tarjeta del mapa' }))
  expect(card.getByRole('status')).not.toHaveTextContent(uuid)
  expect(card.getByText('Conductor: Ana')).toBeVisible()
  expect(card.getByText('1,5 kg CO₂')).toBeVisible()
  expect(card.getByText('Parada 1')).toBeVisible()
  fireEvent.click(card.getByRole('button', { name: 'Cerrar tarjeta' }))
  expect(callbacks.onDismiss).toHaveBeenCalledOnce()
})

it('distingue las tarjetas de rutas y camiones, incluso sin asignación', () => {
  const callbacks = props()
  const view = render(<LeafletCanvas {...callbacks} selection={{ kind: 'vehicle', id: 'v1' }} />)
  expect(screen.getByRole('status')).toHaveTextContent('Recorrido del vehículo ABC-123')
  fireEvent.click(screen.getByRole('button', { name: 'Camión LIB-002 · Disponible' }))
  expect(callbacks.onSelect).toHaveBeenCalledWith({ kind: 'vehicle', id: 'v2' })
  view.rerender(<LeafletCanvas {...callbacks} selection={{ kind: 'vehicle', id: 'v2' }} />)
  expect(screen.getByRole('status')).toHaveTextContent('Sin ruta asignada')
  view.rerender(<LeafletCanvas {...callbacks} selection={{ kind: 'route', id: 'r1' }} />)
  expect(screen.getByRole('status')).toHaveTextContent('Conductor: Ana')
  view.rerender(<LeafletCanvas {...callbacks} selection={{ kind: 'route', id: 'r2' }} />)
  expect(screen.getByRole('status')).toHaveTextContent('Ruta BCD-456')
  expect(screen.getByRole('status')).not.toHaveTextContent('Conductor:')
})

it('reencuadra al medir el contenedor y actualiza solo las ventanas abiertas', async () => {
  const observe = vi.fn()
  const disconnect = vi.fn()
  let resize!: () => void
  vi.stubGlobal('ResizeObserver', class {
    constructor(callback: () => void) { resize = callback }
    observe = observe
    disconnect = disconnect
  })
  const open = new L.Popup()
  const closed = new L.Popup()
  vi.spyOn(open, 'isOpen').mockReturnValue(true)
  vi.spyOn(closed, 'isOpen').mockReturnValue(false)
  const update = vi.spyOn(open, 'update').mockImplementation(() => undefined)
  const skip = vi.spyOn(closed, 'update').mockImplementation(() => undefined)
  fake.map.eachLayer.mockImplementation(fn => [open, closed, L.layerGroup()].forEach(fn))
  const callbacks = props()
  const view = render(<LeafletCanvas {...callbacks} selection={null} />)
  expect(observe).toHaveBeenCalledWith(fake.map.getContainer())
  expect(fake.map.setMinZoom).toHaveBeenCalledWith(13)
  expect(fake.map.getContainer().dataset.mapZoom).toBe('12')
  const first = update.mock.calls.length
  resize()
  expect(update.mock.calls.length).toBe(first + 1)
  await waitFor(() => expect(update.mock.calls.length).toBeGreaterThan(first + 1))
  expect(skip).not.toHaveBeenCalled()
  fake.events.keydown({ originalEvent: { key: 'Enter' } })
  expect(callbacks.onDismiss).not.toHaveBeenCalled()
  fake.events.keydown({ originalEvent: { key: 'Escape' } })
  expect(callbacks.onDismiss).toHaveBeenCalledOnce()
  view.unmount()
  expect(disconnect).toHaveBeenCalledOnce()
  expect(fake.map.off).toHaveBeenCalledWith('moveend zoomend', expect.any(Function))
})
