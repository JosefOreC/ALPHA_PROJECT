import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { createGenerateRoutes } from '../application/generateRoutes'
import type { RouteOptimizer } from '../domain/ports/routeOptimizer'
import { DemoPlanningSource, DemoRouteOptimizer, UnavailableRouteOptimizer } from '../infrastructure/demoRoutePlanning'
import { DEFAULT_ROUTE_SETTINGS } from '../domain/routePlan'
import { RoutePlanningView } from './RoutePlanningView'

const demo = (planning = new DemoPlanningSource()) => createGenerateRoutes({ optimizer: new DemoRouteOptimizer({ stepMs: 0 }), planning })

describe('RoutePlanningView', () => {
  it('abre con el rol Planificador, el alcance y el estado «Sin generar»', async () => {
    render(<RoutePlanningView service={demo()} />)
    expect(await screen.findByText('pendientes')).toBeInTheDocument()
    expect(screen.getByText('Planificador')).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Alcance de la planificación' })).toHaveTextContent('39pendientes')
    expect(screen.getByRole('region', { name: 'Alcance de la planificación' })).toHaveTextContent('13de 15')
    expect(screen.getByText('Sin generar')).toBeInTheDocument()
    expect(screen.getByText('Todavía no hay rutas para hoy')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Administración/ })).toBeNull()
  })

  it('la configuración cambia la prioridad y el texto de ayuda', async () => {
    const user = userEvent.setup()
    render(<RoutePlanningView service={demo()} />)
    await screen.findByText('pendientes')
    expect(screen.getByText('Minimiza los kg de CO₂ según el consumo y el factor de cada vehículo')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Menos tiempo' }))
    expect(screen.getByRole('button', { name: 'Menos tiempo' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Menos CO₂' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByText('Minimiza la duración total de las rutas')).toBeInTheDocument()
    const windows = screen.getByRole('switch', { name: 'Respetar ventanas de entrega' })
    expect(windows).toHaveAttribute('aria-checked', 'true')
    await user.click(windows)
    expect(windows).toHaveAttribute('aria-checked', 'false')
  })

  it('genera la propuesta con la configuración elegida y muestra el resumen y las rutas', async () => {
    const user = userEvent.setup()
    const optimize = vi.fn<RouteOptimizer['optimize']>((scope, settings, onProgress) => new DemoRouteOptimizer({ stepMs: 0 }).optimize(scope, settings, onProgress))
    render(<RoutePlanningView service={createGenerateRoutes({ optimizer: { optimize }, planning: new DemoPlanningSource() })} />)
    await screen.findByText('pendientes')
    await user.click(screen.getByRole('button', { name: 'Equilibrado' }))
    await user.click(screen.getByRole('switch', { name: 'Priorizar vehículos de bajas emisiones' }))
    await user.click(screen.getByRole('button', { name: 'Generar rutas' }))
    const summary = await screen.findByRole('region', { name: 'Resumen de la propuesta' })
    expect(optimize.mock.calls[0][1]).toEqual({ goal: 'balanced', respectWindows: true, prioritizeLowEmission: false })
    expect(summary).toHaveTextContent('13')
    expect(summary).toHaveTextContent('1 284km')
    expect(summary).toHaveTextContent('−212 km')
    expect(summary).toHaveTextContent('95kg')
    expect(summary).toHaveTextContent('96 %')
    expect(summary).toHaveTextContent('meta 90 %')
    expect(screen.getByText('Propuesta lista · sin aprobar')).toBeInTheDocument()
    const grid = screen.getByRole('grid', { name: 'Rutas propuestas por vehículo' })
    expect(within(grid).getByText('ABC-123')).toBeInTheDocument()
    expect(within(grid).getByText('y 7 rutas más')).toBeInTheDocument()
    expect(within(grid).getAllByText('GNV')[0]).toHaveClass('eco-tag--eco')
    expect(within(grid).getByText('Diésel')).not.toHaveClass('eco-tag--eco')
    expect(screen.getByRole('button', { name: 'Volver a generar' })).toBeInTheDocument()
  })

  it('muestra el avance por pasos mientras calcula', async () => {
    const user = userEvent.setup()
    let release: () => void = () => {}
    const gate = new Promise<void>(resolve => { release = resolve })
    const optimizer: RouteOptimizer = {
      async optimize(scope, settings, onProgress) {
        onProgress?.({ step: 2, fraction: 0.5 })
        await gate
        return new DemoRouteOptimizer({ stepMs: 0 }).optimize(scope, settings)
      },
    }
    render(<RoutePlanningView service={createGenerateRoutes({ optimizer, planning: new DemoPlanningSource() })} />)
    await screen.findByText('pendientes')
    await user.click(screen.getByRole('button', { name: 'Generar rutas' }))
    expect(await screen.findByText('Optimizando 39 pedidos en 13 vehículos…')).toBeInTheDocument()
    expect(screen.getByText('Calculando')).toBeInTheDocument()
    expect(screen.getByRole('progressbar', { name: 'Avance del cálculo' })).toHaveAttribute('aria-valuenow', '50')
    expect(screen.getByText('Mejorar el orden de paradas (2-opt)').closest('li')).toHaveAttribute('aria-current', 'step')
    expect(screen.getByRole('button', { name: 'Generando rutas…' })).toBeDisabled()
    release()
    expect(await screen.findByText('Propuesta lista · sin aprobar')).toBeInTheDocument()
  })

  it('sin avance por pasos del servidor muestra el tiempo usado del máximo, no un porcentaje inventado', async () => {
    const user = userEvent.setup()
    let release: () => void = () => {}
    const gate = new Promise<void>(resolve => { release = resolve })
    const optimizer: RouteOptimizer = {
      async optimize(scope, settings, onProgress) {
        onProgress?.({ step: 0, fraction: null })
        await gate
        return new DemoRouteOptimizer({ stepMs: 0 }).optimize(scope, settings)
      },
    }
    render(<RoutePlanningView service={createGenerateRoutes({ optimizer, planning: new DemoPlanningSource(), timeoutMs: 45_000 })} />)
    await screen.findByText('pendientes')
    await user.click(screen.getByRole('button', { name: 'Generar rutas' }))
    const meter = await screen.findByRole('progressbar', { name: 'Tiempo usado del máximo' })
    expect(meter).toHaveAttribute('aria-valuemax', '45')
    expect(meter).toHaveAttribute('aria-valuenow', '0')
    expect(screen.getByText(/El servidor calcula la propuesta en una sola petición/)).toBeInTheDocument()
    expect(screen.queryByRole('listitem', { current: 'step' })).toBeNull()
    release()
    expect(await screen.findByText('Propuesta lista · sin aprobar')).toBeInTheDocument()
  })

  it('muestra el detalle de cada ruta: paradas en orden, combustible y CO₂', async () => {
    const user = userEvent.setup()
    const proposal = await new DemoRouteOptimizer({ stepMs: 0 }).optimize(await new DemoPlanningSource().scope(), DEFAULT_ROUTE_SETTINGS)
    const optimizer: RouteOptimizer = {
      async optimize() {
        return { ...proposal, routes: [{ ...proposal.routes[0], minutes: 95, co2PerKm: 0.152, fuelUsed: { amount: 7.7, unit: 'm3' },
          sequence: [{ id: '1', customer: 'Bodega Rosa', district: 'Ate', eta: '08:12', onTime: true },
            { id: '2', customer: 'Minimarket Sol', district: 'Ate', eta: '08:40', onTime: false }] }] }
      },
    }
    render(<RoutePlanningView service={createGenerateRoutes({ optimizer, planning: new DemoPlanningSource() })} />)
    await screen.findByText('pendientes')
    await user.click(screen.getByRole('button', { name: 'Generar rutas' }))
    const toggle = await screen.findByRole('button', { name: 'Ver paradas de ABC-123' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    const detail = screen.getByRole('region', { name: 'Detalle de ABC-123' })
    expect(detail).toHaveTextContent('7,7 m³ de GNV')
    expect(detail).toHaveTextContent('0,152 kg CO₂/km')
    expect(detail).toHaveTextContent('1 h 35 min')
    const stops = within(detail).getAllByRole('listitem')
    expect(stops.map(stop => stop.textContent)).toEqual([expect.stringContaining('Bodega Rosa'), expect.stringContaining('Minimarket Sol')])
    expect(stops[0]).toHaveTextContent('08:12')
    expect(stops[1]).toHaveTextContent('Fuera de ventana')
    await user.click(toggle)
    expect(screen.queryByRole('region', { name: 'Detalle de ABC-123' })).toBeNull()
  })

  it('sin ahorro frente a la línea base lo dice en lugar de mostrar un descuento negativo', async () => {
    const user = userEvent.setup()
    const proposal = await new DemoRouteOptimizer({ stepMs: 0 }).optimize(await new DemoPlanningSource().scope(), DEFAULT_ROUTE_SETTINGS)
    const optimizer: RouteOptimizer = { optimize: async () => ({ ...proposal, kmSaved: -3, co2SavedPercent: -2 }) }
    render(<RoutePlanningView service={createGenerateRoutes({ optimizer, planning: new DemoPlanningSource() })} />)
    await screen.findByText('pendientes')
    await user.click(screen.getByRole('button', { name: 'Generar rutas' }))
    const summary = await screen.findByRole('region', { name: 'Resumen de la propuesta' })
    expect(summary).toHaveTextContent('Sin ahorro de distancia frente a la línea base')
    expect(summary).toHaveTextContent('Sin ahorro de CO₂ frente a la línea base')
    expect(summary).not.toHaveTextContent('−-')
  })

  it('sin vehículos disponibles no genera rutas y avisa (US-005)', async () => {
    const user = userEvent.setup()
    const optimize = vi.fn()
    render(<RoutePlanningView service={createGenerateRoutes({ optimizer: { optimize }, planning: new DemoPlanningSource({ availableVehicles: 0 }) })} />)
    await screen.findByText('pendientes')
    await user.click(screen.getByRole('button', { name: 'Generar rutas' }))
    expect(await screen.findByText('No hay vehículos disponibles para generar rutas en este momento')).toBeInTheDocument()
    expect(optimize).not.toHaveBeenCalled()
    expect(screen.getByText('Sin generar')).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'Resumen de la propuesta' })).toBeNull()
  })

  it('si el motor falla muestra el error y permite reintentar', async () => {
    const user = userEvent.setup()
    render(<RoutePlanningView service={createGenerateRoutes({ optimizer: new UnavailableRouteOptimizer(), planning: new DemoPlanningSource() })} />)
    await screen.findByText('pendientes')
    await user.click(screen.getByRole('button', { name: 'Generar rutas' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('EN-01')
    expect(screen.getByRole('button', { name: 'Generar rutas' })).toBeEnabled()
  })

  it('descartar vuelve al estado inicial', async () => {
    const user = userEvent.setup()
    render(<RoutePlanningView service={demo()} />)
    await screen.findByText('pendientes')
    await user.click(screen.getByRole('button', { name: 'Generar rutas' }))
    await screen.findByRole('region', { name: 'Resumen de la propuesta' })
    await user.click(screen.getByRole('button', { name: 'Descartar' }))
    expect(screen.getByText('Todavía no hay rutas para hoy')).toBeInTheDocument()
    expect(screen.getByText('Sin generar')).toBeInTheDocument()
  })

  it('aprobar lleva a Pedidos y rutas', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    render(<RoutePlanningView service={demo()} onNavigate={onNavigate} />)
    await screen.findByText('pendientes')
    await user.click(screen.getByRole('button', { name: 'Generar rutas' }))
    await user.click(await screen.findByRole('link', { name: 'Consultar pedidos' }))
    expect(onNavigate).toHaveBeenCalledWith('pedidos', '/?vista=pedidos')
  })
})
