import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { RouteSimulationView } from './RouteSimulationView'
import { exampleScenario } from '../../domain/simulation'
import type { SimulationResult } from '../../domain/simulation'
import type { ComponentProps } from 'react'
import type SimulationMap from './SimulationMap'

vi.mock('./SimulationMap', () => ({ default: (props: ComponentProps<typeof SimulationMap>) => <div>
  <button type="button" disabled={props.disabled} onClick={() => props.onPlace({ lat: -12.04, lng: -76.96 + (props.scenario.vehicles.length + props.scenario.orders.length) * .002 })}>Punto de prueba</button>
  <button type="button" disabled={props.disabled} onClick={() => props.onPlace({ lat: 0, lng: 0 })}>Punto fuera de Lima</button>
  <button type="button" disabled={props.disabled} onClick={() => props.onMove({ kind: 'vehicle', id: 'Movil-1' }, { lat: -12.05, lng: -76.97 })}>Mover móvil</button>
  <button type="button" disabled={props.disabled} onClick={() => props.onMove({ kind: 'order', id: 'Pedido-1' }, { lat: -12.06, lng: -76.98 })}>Mover pedido</button>
  <button type="button" disabled={props.disabled} onClick={() => props.onMove({ kind: 'order', id: 'Pedido-1' }, { lat: 0, lng: 0 })}>Mover fuera de Lima</button>
</div> }))
const result: SimulationResult = { simulation: true, routeCount: 1, ordersAssigned: 1, totalKm: 5, co2Kg: 1.34, windowCompliance: 100, elapsedSeconds: 0.01,
  routes: [{ plate: 'Movil-1', driver: 'Movil-1', zone: 'Lima', fuel: 'DIESEL', stops: 1, km: 5, load: .5, co2Kg: 1.34,
    path: [{ lat: -12.04, lng: -76.96 }, { lat: -12.05, lng: -76.97 }], sequence: [{ id: 'Pedido-1', customer: 'Pedido-1', district: 'Lima', eta: '08:12', onTime: true }] }] }

async function buildScenario() {
  fireEvent.click(await screen.findByText('Punto de prueba'))
  fireEvent.click(screen.getByText('Colocar pedido'))
  fireEvent.click(screen.getByText('Punto de prueba'))
}

describe('Laboratorio geográfico de rutas', () => {
  it('coloca puntos, calcula y descarta resultados al corregirlos', async () => {
    const calculate = vi.fn().mockResolvedValue(result)
    render(<RouteSimulationView calculate={calculate} />)
    expect(screen.getByRole('button', { name: 'Calcular rutas de prueba' })).toBeDisabled()
    await buildScenario()
    fireEvent.change(screen.getByLabelText('Peso de Pedido-1'), { target: { value: '9' } })
    fireEvent.click(screen.getByText('Calcular rutas de prueba'))
    expect(await screen.findByRole('region', { name: 'Resultado de la simulación' })).toBeVisible()
    expect(calculate.mock.calls[0][0].vehicles[0]).toMatchObject({ lat: -12.04, lng: -76.96 })
    expect(calculate.mock.calls[0][0].orders[0].weight).toBe(9)
    expect(calculate.mock.calls[0][0]).not.toHaveProperty('speedKmh')
    fireEvent.click(screen.getByText('Mover móvil'))
    expect(screen.queryByRole('region', { name: 'Resultado de la simulación' })).toBeNull()
    fireEvent.click(screen.getByText('Mover pedido'))
    fireEvent.click(screen.getByText('Calcular rutas de prueba'))
    await screen.findByRole('region', { name: 'Resultado de la simulación' })
    expect(calculate.mock.calls[1][0].orders[0]).toMatchObject({ lat: -12.06, lng: -76.98 })
  })
  it('carga un ejemplo editable y permite eliminar y limpiar puntos', async () => {
    render(<RouteSimulationView calculate={vi.fn()} />)
    fireEvent.click(screen.getByText('Cargar ejemplo en Lima'))
    expect(screen.getByLabelText('Capacidad de Movil-1')).toHaveValue(exampleScenario().vehicles[0].capacity)
    fireEvent.change(screen.getByLabelText('Capacidad de Movil-1'), { target: { value: '80' } })
    fireEvent.click(screen.getByText('Eliminar Movil-1'))
    expect(screen.queryByLabelText('Capacidad de Movil-1')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Pedido-1 · 8 kg' }))
    fireEvent.change(screen.getByLabelText('Desde (min)'), { target: { value: '60' } })
    fireEvent.change(screen.getByLabelText('Hasta (min)'), { target: { value: '120' } })
    fireEvent.click(screen.getByText('Eliminar Pedido-1'))
    fireEvent.click(screen.getByText('Limpiar escenario'))
    expect(screen.getByText('Calcular rutas de prueba')).toBeDisabled()
  })
  it('conserva puntos tras un error, permite reintentar y rechaza ubicaciones fuera de Lima', async () => {
    const calculate = vi.fn().mockRejectedValueOnce(new Error('Proveedor vial no disponible')).mockResolvedValue(result)
    render(<RouteSimulationView calculate={calculate} />)
    await buildScenario()
    fireEvent.click(screen.getByText('Punto fuera de Lima'))
    expect(await screen.findByRole('alert')).toHaveTextContent('dentro del mapa de Lima')
    fireEvent.click(screen.getByText('Mover fuera de Lima'))
    expect(screen.getByRole('alert')).toHaveTextContent('dentro de Lima')
    fireEvent.click(screen.getByText('Calcular rutas de prueba'))
    expect(await screen.findByRole('alert')).toHaveTextContent('Proveedor vial no disponible')
    expect(screen.getByLabelText('Peso de Pedido-1')).toHaveValue(5)
    fireEvent.click(screen.getByText('Calcular rutas de prueba'))
    expect(await screen.findByRole('region', { name: 'Resultado de la simulación' })).toBeVisible()
  })
  it('bloquea la edición, cancela y descarta una respuesta tardía', async () => {
    let finish!: (value: SimulationResult) => void
    const calculate = vi.fn().mockImplementation(() => new Promise(resolve => { finish = resolve }))
    const view = render(<RouteSimulationView calculate={calculate} />)
    await buildScenario()
    fireEvent.click(screen.getByText('Calcular rutas de prueba'))
    expect(screen.getByText('Punto de prueba')).toBeDisabled()
    const signal = calculate.mock.calls[0][1] as AbortSignal
    fireEvent.click(screen.getByText('Cancelar cálculo'))
    expect(signal.aborted).toBe(true)
    expect(screen.getByText('Calcular rutas de prueba')).toBeEnabled()
    await act(async () => finish(result))
    expect(screen.queryByRole('region', { name: 'Resultado de la simulación' })).toBeNull()
    fireEvent.click(screen.getByText('Calcular rutas de prueba'))
    const second = calculate.mock.calls[1][1] as AbortSignal
    view.unmount()
    expect(second.aborted).toBe(true)
    await act(async () => finish(result))
    await waitFor(() => expect(calculate).toHaveBeenCalledTimes(2))
  })
})
