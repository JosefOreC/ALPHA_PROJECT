import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { createDriverOrders } from '../application/driverOrders'
import { createDriverRoute } from '../application/driverRoute'
import { currentStop, routeProgress, stopNumber } from '../domain/driverRoute'
import { DemoOrders, UnavailableDriverRoute } from '../infrastructure/demoOrders'
import { DriverOrderView } from './DriverOrderView'
import { DriverRouteView } from './DriverRouteView'

// jsdom no implementa <dialog>.showModal(); basta con reflejar el atributo open.
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute('open', '')
  }
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.removeAttribute('open')
    this.dispatchEvent(new Event('close'))
  }
})

describe('ruta demo del conductor', () => {
  it('deriva las paradas del estado de los pedidos y avanza al confirmar', async () => {
    const demo = new DemoOrders()
    const before = await demo.route()
    expect(before.stops.map(stop => stop.kind)).toEqual(['done', 'done', 'now', 'new', 'next'])
    expect(before).toMatchObject({ delivered: 2, total: 9, remaining_stops: 4, plate: 'ABC-123' })
    expect(currentStop(before)?.order_id).toBe('PED-0026')
    expect(stopNumber(before, 'PED-0026')).toBe(3)
    expect(stopNumber(before, 'PED-9999')).toBeNull()
    expect(routeProgress(before)).toBeCloseTo(2 / 9)

    await demo.confirm('PED-0026')
    const after = await demo.route()
    expect(after.stops.map(stop => stop.kind)).toEqual(['done', 'done', 'done', 'now', 'next'])
    expect(after.delivered).toBe(3)
    expect(currentStop(after)?.order_id).toBe('PED-0055')
  })

  it('sin ruta aprobada avisa en lugar de inventarla', async () => {
    await expect(new UnavailableDriverRoute().route()).rejects.toThrow('aún no está disponible')
  })
})

// Mapa inactivo: no resuelve nunca, así estas pruebas no dibujan Leaflet.
const idleMap = { load: () => new Promise<never>(() => {}) }

describe('DriverRouteView', () => {
  const setup = (props: Partial<Parameters<typeof DriverRouteView>[0]> = {}) =>
    render(<DriverRouteView service={createDriverRoute(new DemoOrders())} mapSource={idleMap} {...props} />)

  it('muestra avance, CO₂, paradas con su estado y el resto de la ruta', async () => {
    setup()
    expect(await screen.findByText('Minimarket Don Lucho →')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: '2 de 9 entregas' })).toBeInTheDocument()
    expect(screen.getByText('2/9')).toBeInTheDocument()
    expect(screen.getByText('−21 %')).toBeInTheDocument()
    const stops = screen.getByRole('list', { name: 'Paradas de hoy' })
    const items = within(stops).getAllByRole('listitem')
    expect(items[0]).toHaveClass('eco-stop--done')
    expect(items[2]).toHaveClass('eco-stop--now')
    expect(items[2]).toHaveAttribute('aria-current', 'step')
    expect(items[3]).toHaveClass('eco-stop--new')
    expect(within(items[3]).getByText('PED-0055 · nueva parada')).toBeInTheDocument()
    expect(within(stops).getByText('4 paradas más')).toBeInTheDocument()
    expect(within(stops).getByText('regreso al almacén de Ate')).toBeInTheDocument()
  })

  it('la alerta de reoptimización se puede descartar', async () => {
    const user = userEvent.setup()
    setup()
    expect(await screen.findByText('Tu ruta cambió · 10:38')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Entendido' }))
    expect(screen.queryByText('Tu ruta cambió · 10:38')).toBeNull()
  })

  it('la barra inferior ofrece las tres secciones y marca Mi ruta', async () => {
    const onNavigate = vi.fn()
    const user = userEvent.setup()
    setup({ onNavigate })
    await screen.findByText('Minimarket Don Lucho →')
    const bar = screen.getByRole('navigation', { name: 'Secciones del conductor' })
    expect(within(bar).getByRole('link', { name: 'Mi ruta' })).toHaveAttribute('aria-current', 'page')
    expect(within(bar).getByRole('link', { name: 'Incidencias' })).not.toHaveAttribute('aria-disabled')
    await user.click(within(bar).getByRole('link', { name: 'Incidencias' }))
    expect(onNavigate).toHaveBeenCalledWith('incidencias', '/?vista=incidencias')
    await user.click(within(bar).getByRole('link', { name: 'Pedido actual' }))
    expect(onNavigate).toHaveBeenCalledWith('pedido-actual', '/?vista=conductor')
  })

  it('tocar la parada actual abre su pedido', async () => {
    const onOpenOrder = vi.fn()
    const user = userEvent.setup()
    setup({ onOpenOrder })
    await user.click(await screen.findByRole('link', { name: 'Minimarket Don Lucho →' }))
    expect(onOpenOrder).toHaveBeenCalledWith('PED-0026')
  })

  it('si la ruta no está disponible muestra el error y permite reintentar', async () => {
    const user = userEvent.setup()
    render(<DriverRouteView service={createDriverRoute(new UnavailableDriverRoute())} mapSource={idleMap} />)
    expect(await screen.findByRole('alert')).toHaveTextContent('aún no está disponible')
    expect(screen.getByRole('button', { name: 'Volver a cargar' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Volver a cargar' }))
    expect(await screen.findByRole('alert')).toBeInTheDocument()
  })
})

describe('DriverOrderView', () => {
  const setup = (props: Partial<Parameters<typeof DriverOrderView>[0]> = {}) => {
    const demo = new DemoOrders()
    return render(
      <DriverOrderView service={createDriverOrders(demo)} routeService={createDriverRoute(demo)} orderId="PED-0026" demo {...props} />,
    )
  }

  it('muestra el pedido, su parada, el impacto de CO₂ y el avance de la jornada', async () => {
    setup()
    expect(await screen.findByRole('heading', { name: 'Minimarket Don Lucho' })).toBeInTheDocument()
    expect(screen.getByText('PED-0026 · parada 3')).toBeInTheDocument()
    expect(screen.getByText('En camino')).toBeInTheDocument()
    expect(screen.getByText('11:00–13:00')).toBeInTheDocument()
    expect(screen.getByText('15,8 kg')).toBeInTheDocument()
    expect(screen.getByText('Dejar en recepción; firma el encargado de turno.')).toBeInTheDocument()
    expect(await screen.findByText('−21 %')).toBeInTheDocument()
    expect(screen.getByText('34 km restantes')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Confirmar entrega' })).toBeEnabled()
    expect(screen.queryByText(/Modo demostración/)).toBeNull()
  })

  it('confirmar pide confirmación, registra la hora y ofrece la siguiente parada', async () => {
    const user = userEvent.setup()
    const onOpenOrder = vi.fn()
    setup({ onOpenOrder })
    await user.click(await screen.findByRole('button', { name: 'Confirmar entrega' }))
    const dialog = screen.getByRole('dialog', { name: '¿Ya entregaste el pedido?' })
    await user.click(within(dialog).getByRole('button', { name: 'Volver' }))
    expect(screen.queryByText('Entrega confirmada')).toBeNull()

    await user.click(screen.getByRole('button', { name: 'Confirmar entrega' }))
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Sí, confirmar entrega' }))
    expect(await screen.findByText('Entrega confirmada')).toBeInTheDocument()
    expect(screen.getByText('Entregado')).toBeInTheDocument()
    expect(await screen.findByText('3/9')).toBeInTheDocument()
    await user.click(await screen.findByRole('link', { name: 'Siguiente parada →' }))
    expect(onOpenOrder).toHaveBeenCalledWith('PED-0055')
  })

  it('un pedido ya entregado no se puede confirmar de nuevo', async () => {
    setup({ orderId: 'PED-0021' })
    expect(await screen.findByRole('heading', { name: 'Comercial Hermanos Quispe' })).toBeInTheDocument()
    expect(screen.getByText('Entrega confirmada')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Confirmar entrega' })).toBeNull()
  })

  it('el pedido sigue siendo utilizable si la ruta no carga', async () => {
    const demo = new DemoOrders()
    render(<DriverOrderView service={createDriverOrders(demo)} routeService={createDriverRoute(new UnavailableDriverRoute())} orderId="PED-0026" demo={false} />)
    expect(await screen.findByRole('heading', { name: 'Minimarket Don Lucho' })).toBeInTheDocument()
    expect(screen.queryByText('−21 %')).toBeNull()
    expect(screen.queryByText(/Modo demostración/)).toBeNull()
  })

  it('un pedido inexistente muestra el error y permite recargar', async () => {
    setup({ orderId: 'PED-9999' })
    expect(await screen.findByRole('alert')).toHaveTextContent('Pedido no encontrado.')
    expect(screen.getByRole('button', { name: 'Volver a cargar' })).toBeInTheDocument()
  })

  it('el botón de regreso lleva a Mi ruta', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    setup({ onNavigate })
    await user.click(await screen.findByRole('link', { name: '← Mi ruta' }))
    expect(onNavigate).toHaveBeenCalledWith('mi-ruta', '/?vista=mi-ruta')
  })
})
