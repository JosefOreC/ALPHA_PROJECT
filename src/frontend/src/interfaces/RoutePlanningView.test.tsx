import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { createGenerateRoutes } from '../application/generateRoutes'
import type { RouteOptimizer } from '../domain/ports/routeOptimizer'
import { DemoPlanningSource, DemoRouteOptimizer, UnavailableRouteOptimizer } from '../infrastructure/demoRoutePlanning'
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
    expect(screen.getByText('Prioriza los vehículos de menor factor de emisión')).toBeInTheDocument()
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
    expect(screen.getByText('Ordenar paradas (VRPTW)').closest('li')).toHaveAttribute('aria-current', 'step')
    expect(screen.getByRole('button', { name: 'Generando rutas…' })).toBeDisabled()
    release()
    expect(await screen.findByText('Propuesta lista · sin aprobar')).toBeInTheDocument()
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
