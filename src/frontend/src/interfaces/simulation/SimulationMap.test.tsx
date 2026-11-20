import type { ComponentProps, ReactNode } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import SimulationMap from './SimulationMap'
import { emptyScenario, exampleScenario } from '../../domain/simulation'
import type { SimulationResult } from '../../domain/simulation'

const fake = vi.hoisted(() => ({
  events: {} as Record<string, (event: never) => void>,
  map: { getContainer: vi.fn(), getCenter: vi.fn(), invalidateSize: vi.fn(), fitBounds: vi.fn(), setView: vi.fn(), zoomIn: vi.fn(), zoomOut: vi.fn() },
}))
vi.mock('react-leaflet', () => ({
  useMap: () => fake.map,
  useMapEvents: (events: typeof fake.events) => { fake.events = events; return fake.map },
  MapContainer: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  Tooltip: ({ children }: { children: ReactNode }) => <span>{children}</span>,
  Polyline: ({ positions }: { positions: unknown }) => <div data-testid="road-geometry">{JSON.stringify(positions)}</div>,
  Marker: ({ title, draggable, eventHandlers, children }: { title: string; draggable: boolean; eventHandlers: { click: () => void; dragend: (event: unknown) => void }; children: ReactNode }) => <div>
    <button type="button" onClick={eventHandlers.click}>{title}</button><button type="button" data-draggable={draggable} onClick={() => eventHandlers.dragend({ target: { getLatLng: () => ({ lat: -12.05, lng: -76.97 }) } })}>Mover {title}</button>{children}
  </div>,
}))
vi.mock('../map/VectorBasemap', () => ({ default: ({ onError }: { onError: (value: string) => void }) => <button type="button" onClick={() => onError('Sin conexión')}>Fallo cartográfico</button> }))

function props(): ComponentProps<typeof SimulationMap> {
  fake.map.getContainer.mockReturnValue(document.createElement('div'))
  fake.map.getCenter.mockReturnValue({ lat: -12.04, lng: -76.96 })
  vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} })
  return { scenario: exampleScenario(), result: null, selection: null, disabled: false, onPlace: vi.fn(), onMove: vi.fn(), onSelect: vi.fn() }
}
afterEach(() => { vi.clearAllMocks(); vi.unstubAllGlobals() })

it('permite colocar por clic, teclado y centro, y seleccionar o mover marcadores', () => {
  const values = props()
  render(<SimulationMap {...values} />)
  fake.events.click({ latlng: { lat: -12.04, lng: -76.96 } } as never)
  fake.events.keydown({ originalEvent: { key: 'Enter', target: fake.map.getContainer(), preventDefault: vi.fn() } } as never)
  fireEvent.click(screen.getByText('Colocar en el centro del mapa'))
  expect(values.onPlace).toHaveBeenCalledTimes(3)
  fireEvent.click(screen.getByText('Movil-1: origen del móvil'))
  fireEvent.click(screen.getByText('Pedido-1: destino del pedido'))
  expect(values.onSelect).toHaveBeenCalledWith({ kind: 'order', id: 'Pedido-1' })
  fireEvent.click(screen.getByText('Mover Movil-1: origen del móvil'))
  fireEvent.click(screen.getByText('Mover Pedido-1: destino del pedido'))
  expect(values.onMove).toHaveBeenCalledWith({ kind: 'vehicle', id: 'Movil-1' }, { lat: -12.05, lng: -76.97 })
  fireEvent.click(screen.getByRole('button', { name: 'Acercar mapa' }))
  fireEvent.click(screen.getByRole('button', { name: 'Alejar mapa' }))
  expect(fake.map.zoomIn).toHaveBeenCalledOnce()
  expect(fake.map.zoomOut).toHaveBeenCalledOnce()
})

it('bloquea colocación y movimiento durante el cálculo, y no acepta puntos exteriores', () => {
  const values = props()
  const view = render(<SimulationMap {...values} disabled />)
  fake.events.click({ latlng: { lat: -12.04, lng: -76.96 } } as never)
  fireEvent.click(screen.getByText('Movil-1: origen del móvil'))
  fireEvent.click(screen.getByText('Mover Pedido-1: destino del pedido'))
  expect(values.onPlace).not.toHaveBeenCalled()
  expect(values.onSelect).not.toHaveBeenCalled()
  expect(values.onMove).not.toHaveBeenCalled()
  expect(screen.getByText('Colocar en el centro del mapa')).toBeDisabled()
  view.rerender(<SimulationMap {...values} />)
  fake.events.click({ latlng: { lat: 0, lng: 0 } } as never)
  fake.map.getCenter.mockReturnValue({ lat: 0, lng: 0 })
  fireEvent.click(screen.getByText('Colocar en el centro del mapa'))
  expect(values.onPlace).not.toHaveBeenCalled()
})

it('dibuja la geometría del proveedor, conserva el orden de paradas y comunica un fallo de cartografía', () => {
  const values = props()
  const path = [{ lat: -12.04, lng: -76.96 }, { lat: -12.041, lng: -76.958 }, { lat: -12.045, lng: -76.956 }]
  const result = { routes: [{ plate: 'Movil-1', path, km: 2, sequence: [{ id: 'Pedido-1' }] }] } as unknown as SimulationResult
  const view = render(<SimulationMap {...values} result={result} selection={{ kind: 'order', id: 'Pedido-1' }} />)
  expect(screen.getByTestId('road-geometry')).toHaveTextContent('[[-12.04,-76.96],[-12.041,-76.958],[-12.045,-76.956]]')
  expect(fake.map.fitBounds).toHaveBeenCalled()
  fireEvent.click(screen.getByText('Fallo cartográfico'))
  expect(screen.getByText('Cartografía no disponible')).toBeVisible()
  fireEvent.click(screen.getByText('Reintentar mapa'))
  expect(screen.queryByText('Cartografía no disponible')).toBeNull()
  view.rerender(<SimulationMap {...values} scenario={emptyScenario()} />)
  expect(fake.map.setView).toHaveBeenCalled()
})
