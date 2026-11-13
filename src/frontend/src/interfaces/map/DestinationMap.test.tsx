import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import DestinationMap from './DestinationMap'

const state = vi.hoisted(() => ({ events: {} as Record<string, (event: unknown) => void>, drag: null as null | ((event: unknown) => void),
  map: { getContainer: vi.fn(), invalidateSize: vi.fn(), setView: vi.fn(), getZoom: () => 12, zoomIn: vi.fn(), zoomOut: vi.fn(),
    getCenter: () => ({ wrap: () => ({ lat: -12.04, lng: -76.96 }) }) } }))
vi.mock('react-leaflet', () => ({ MapContainer: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  useMapEvents: (events: typeof state.events) => { state.events = events; return state.map },
  Marker: ({ eventHandlers, draggable }: { eventHandlers: { dragend: typeof state.drag }; draggable: boolean }) => {
    state.drag = eventHandlers.dragend; return <span data-testid="destination-marker" data-draggable={draggable} />
  } }))
vi.mock('./VectorBasemap', () => ({ default: () => null }))
beforeEach(() => { vi.clearAllMocks(); state.map.getContainer.mockReturnValue(document.createElement('div')) })

it('permite seleccionar un destino por clic o centro y acercar o alejar', () => {
  const change = vi.fn()
  const { rerender } = render(<DestinationMap value={null} disabled={false} onChange={change} onError={vi.fn()} />)
  expect(screen.queryByTestId('destination-marker')).toBeNull()
  state.events.click({ latlng: { wrap: () => ({ lat: -12, lng: -77 }) } })
  expect(change).toHaveBeenCalledWith({ lat: -12, lng: -77 })
  fireEvent.click(screen.getByRole('button', { name: 'Usar centro del mapa' }))
  expect(change).toHaveBeenCalledWith({ lat: -12.04, lng: -76.96 })
  fireEvent.click(screen.getByRole('button', { name: 'Acercar destino' }))
  fireEvent.click(screen.getByRole('button', { name: 'Alejar destino' }))
  expect(state.map.zoomIn).toHaveBeenCalled(); expect(state.map.zoomOut).toHaveBeenCalled()
  rerender(<DestinationMap value={{ lat: -12, lng: -77 }} disabled={false} onChange={change} onError={vi.fn()} />)
  expect(state.map.setView).toHaveBeenCalledWith([-12,-77],15,{ animate:false })
  state.drag?.({ target: { getLatLng: () => ({ wrap: () => ({ lat:-12.1,lng:-77.1 }) }) } })
  expect(change).toHaveBeenLastCalledWith({ lat:-12.1,lng:-77.1 })
  change.mockClear()
  rerender(<DestinationMap value={{ lat:-12,lng:-77 }} disabled onChange={change} onError={vi.fn()} />)
  state.events.click({})
  state.drag?.({})
  expect(change).not.toHaveBeenCalled()
  expect(screen.getByTestId('destination-marker')).toHaveAttribute('data-draggable','false')
  expect(screen.getByRole('button', { name:'Usar centro del mapa' })).toBeDisabled()
})
