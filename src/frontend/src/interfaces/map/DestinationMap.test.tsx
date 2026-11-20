import { fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, expect, it, vi } from 'vitest'
import DestinationMap from './DestinationMap'

const fake = vi.hoisted(() => {
  const point = { lat: -12.08, lng: -77.04 }
  const map = { getContainer: vi.fn(), invalidateSize: vi.fn(), setView: vi.fn(), getZoom: vi.fn(),
    zoomIn: vi.fn(), zoomOut: vi.fn(), getCenter: vi.fn() }
  return { point, map, events: { click: (_event: { latlng: { wrap: () => typeof point } }) => {} } }
})
vi.mock('react-leaflet', () => ({
  useMapEvents: (events: { click: (event: { latlng: { wrap: () => typeof fake.point } }) => void }) => {
    fake.events = events
    return fake.map
  },
  MapContainer: ({ children, zoom }: { children: ReactNode; zoom: number }) => <section data-testid="destination" data-zoom={zoom}>{children}</section>,
  Marker: ({ draggable, eventHandlers }: { draggable: boolean; eventHandlers: { dragend: (event: { target: unknown }) => void } }) =>
    <button type="button" data-draggable={draggable} onClick={() => eventHandlers.dragend({ target: { getLatLng: () => ({ wrap: () => fake.point }) } })}>Marcador</button>,
}))
vi.mock('./VectorBasemap', () => ({
  default: ({ onError }: { onError: (message: string) => void }) =>
    <button type="button" onClick={() => onError('Cartografía no disponible')}>Avisar error</button>,
}))

afterEach(() => { vi.clearAllMocks(); vi.unstubAllGlobals() })

it('permite usar clic, centro y marcador, y encuadra el destino elegido', () => {
  const container = document.createElement('div')
  fake.map.getContainer.mockReturnValue(container)
  fake.map.getZoom.mockReturnValue(12)
  fake.map.getCenter.mockReturnValue({ wrap: () => fake.point })
  const onChange = vi.fn()
  const onError = vi.fn()
  const view = render(<DestinationMap value={null} disabled={false} onChange={onChange} onError={onError} />)
  expect(screen.getByTestId('destination')).toHaveAttribute('data-zoom', '12')
  expect(container).toHaveAttribute('aria-label', expect.stringContaining('Seleccionar destino'))
  expect(fake.map.setView).not.toHaveBeenCalled()
  fake.events.click({ latlng: { wrap: () => fake.point } })
  fireEvent.click(screen.getByRole('button', { name: 'Usar centro del mapa' }))
  fireEvent.click(screen.getByRole('button', { name: 'Acercar destino' }))
  fireEvent.click(screen.getByRole('button', { name: 'Alejar destino' }))
  expect(fake.map.zoomIn).toHaveBeenCalledOnce()
  expect(fake.map.zoomOut).toHaveBeenCalledOnce()
  view.rerender(<DestinationMap value={fake.point} disabled={false} onChange={onChange} onError={onError} />)
  expect(fake.map.setView).toHaveBeenLastCalledWith([fake.point.lat, fake.point.lng], 15, { animate: false })
  const marker = screen.getByRole('button', { name: 'Marcador' })
  expect(marker).toHaveAttribute('data-draggable', 'true')
  fireEvent.click(marker)
  expect(onChange.mock.calls).toEqual([[fake.point], [fake.point], [fake.point]])
  fireEvent.click(screen.getByRole('button', { name: 'Avisar error' }))
  expect(onError).toHaveBeenCalledWith('Cartografía no disponible')
})

it('ignora clics y arrastres al guardar y desconecta el observador al salir', () => {
  const observe = vi.fn()
  const disconnect = vi.fn()
  vi.stubGlobal('ResizeObserver', class {
    constructor(resize: () => void) { resize() }
    observe = observe
    disconnect = disconnect
  })
  const container = document.createElement('div')
  fake.map.getContainer.mockReturnValue(container)
  fake.map.getZoom.mockReturnValue(17)
  const onChange = vi.fn()
  const view = render(<DestinationMap value={fake.point} disabled onChange={onChange} onError={vi.fn()} />)
  expect(observe).toHaveBeenCalledWith(container)
  expect(fake.map.invalidateSize).toHaveBeenCalledWith({ pan: false })
  expect(fake.map.setView).toHaveBeenCalledWith([fake.point.lat, fake.point.lng], 17, { animate: false })
  expect(screen.getByRole('button', { name: 'Usar centro del mapa' })).toBeDisabled()
  const marker = screen.getByRole('button', { name: 'Marcador' })
  expect(marker).toHaveAttribute('data-draggable', 'false')
  fireEvent.click(marker)
  fake.events.click({ latlng: { wrap: () => fake.point } })
  expect(onChange).not.toHaveBeenCalled()
  view.unmount()
  expect(disconnect).toHaveBeenCalledOnce()
})
