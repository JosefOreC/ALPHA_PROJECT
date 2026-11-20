import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { RouteSimulationView } from './RouteSimulationView'
import { exampleScenario } from '../../domain/simulation'
import type { SimulationResult } from '../../domain/simulation'

const result: SimulationResult = { simulation: true, routeCount: 1, ordersAssigned: 1, totalKm: 5, co2Kg: 1.34, windowCompliance: 100, elapsedSeconds: 0.01,
  routes: [{ plate: 'Movil-1', driver: 'Movil-1', zone: 'Prueba', fuel: 'DIESEL', stops: 1, km: 5, load: .5, co2Kg: 1.34,
    points: [{ x: 0, y: 0 }, { x: 3, y: 4 }], sequence: [{ id: 'Pedido-1', customer: 'Pedido-1', district: 'Prueba', eta: '08:12', onTime: true }] }] }

describe('Laboratorio de rutas', () => {
  it('calcula los datos editados y descarta resultados al cambiar el escenario', async () => {
    const calculate = vi.fn().mockResolvedValue(result)
    render(<RouteSimulationView calculate={calculate} />)
    fireEvent.change(screen.getByLabelText('Movil-1 x'), { target: { value: '7' } })
    fireEvent.click(screen.getByRole('button', { name: 'Calcular rutas de prueba' }))
    expect(await screen.findByRole('region', { name: 'Resultado de la simulación' })).toBeVisible()
    expect(calculate.mock.calls[0][0].vehicles[0].x).toBe(7)
    expect(screen.getByText(/llegada 08:12/)).toBeVisible()
    fireEvent.change(screen.getByLabelText('Pedido-1 weight'), { target: { value: '9' } })
    expect(screen.queryByRole('region', { name: 'Resultado de la simulación' })).toBeNull()
  })
  it('permite construir un escenario vacío y restaurar el ejemplo', () => {
    render(<RouteSimulationView calculate={vi.fn()} />)
    fireEvent.click(screen.getByText('Limpiar escenario'))
    expect(screen.getByRole('button', { name: 'Calcular rutas de prueba' })).toBeDisabled()
    fireEvent.click(screen.getByText('Agregar móvil'))
    fireEvent.click(screen.getByText('Agregar pedido'))
    expect(screen.getByLabelText('Movil-1 capacity')).toHaveValue(40)
    fireEvent.click(screen.getByLabelText('Eliminar Movil-1'))
    fireEvent.click(screen.getByLabelText('Eliminar Pedido-1'))
    fireEvent.click(screen.getByText('Cargar ejemplo'))
    expect(screen.getByLabelText('Movil-2 capacity')).toHaveValue(exampleScenario().vehicles[1].capacity)
  })
  it('conserva las entradas ante errores y permite reintentar', async () => {
    const calculate = vi.fn().mockRejectedValueOnce(new Error('Capacidad insuficiente')).mockResolvedValue(result)
    render(<RouteSimulationView calculate={calculate} />)
    fireEvent.click(screen.getByText('Calcular rutas de prueba'))
    expect(await screen.findByRole('alert')).toHaveTextContent('Capacidad insuficiente')
    fireEvent.click(screen.getByText('Calcular rutas de prueba'))
    expect(await screen.findByRole('region', { name: 'Resultado de la simulación' })).toBeVisible()
  })
  it('bloquea cambios durante el cálculo y cancela la petición al salir', async () => {
    let finish!: (value: SimulationResult) => void
    const calculate = vi.fn().mockImplementation(() => new Promise(resolve => { finish = resolve }))
    const view = render(<RouteSimulationView calculate={calculate} />)
    fireEvent.click(screen.getByText('Calcular rutas de prueba'))
    expect(screen.getByText('Calculando escenario…')).toBeDisabled()
    expect(screen.getByLabelText('Movil-1 x')).toBeDisabled()
    const signal = calculate.mock.calls[0][1] as AbortSignal
    view.unmount()
    expect(signal.aborted).toBe(true)
    await act(async () => finish(result))
    await waitFor(() => expect(calculate).toHaveBeenCalledOnce())
  })
})
