import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { doneSegment, orderMatches, pendingSegment, vehiclePosition } from '../../domain/mapData'
import { DemoMapData, UnavailableMapData } from '../../infrastructure/demoMapData'
import { depotHtml, pinHtml, vehicleHtml } from './markers'
import { RouteMap } from './RouteMap'

// jsdom has no WebGL. The actual renderer is exercised in Playwright.
vi.mock('./VectorBasemap', () => ({ default: () => null }))

// Leaflet llama a window.scrollTo, que jsdom no implementa.
beforeAll(() => {
  window.scrollTo = vi.fn()
})

const data = await new DemoMapData().load()

// La primera vez Leaflet se importa de forma diferida: se le da más margen que el de por defecto.
const SLOW = { timeout: 10_000 }

describe('geometría del mapa', () => {
  it('parte cada ruta en tramo recorrido y tramo por recorrer, y ubica al vehículo', () => {
    const route = data.routes[0]
    expect(doneSegment(route)).toHaveLength(route.done_until + 1)
    expect(pendingSegment(route)).toHaveLength(route.path.length - route.done_until)
    expect(vehiclePosition(route)).toEqual(route.path[route.done_until])
    expect(doneSegment(route).at(-1)).toEqual(pendingSegment(route)[0])
  })

  it('la búsqueda mira pedido, cliente, distrito y placa del vehículo', () => {
    const order = data.orders.find(item => item.id === 'PED-0026')!
    expect(orderMatches(order, data.routes, '')).toBe(true)
    expect(orderMatches(order, data.routes, 'don lucho')).toBe(true)
    expect(orderMatches(order, data.routes, 'lurigancho')).toBe(true)
    expect(orderMatches(order, data.routes, 'abc-123')).toBe(true)
    expect(orderMatches(order, data.routes, 'fhj-890')).toBe(false)
  })

  it('los datos demo son coherentes: cada pedido con ruta existe en ella', () => {
    for (const order of data.orders.filter(item => item.route_id)) {
      expect(data.routes.some(route => route.id === order.route_id)).toBe(true)
    }
    expect(data.orders.filter(item => item.route_id === null).every(item => item.status === 'PENDIENTE' || item.status === 'CANCELADO')).toBe(true)
  })
})

describe('marcado de los pines', () => {
  it('cada estado usa la clase de su forma y marca selección y atenuado', () => {
    expect(pinHtml('PENDIENTE', false, false)).toContain('pin--pending')
    expect(pinHtml('EN_CAMINO', false, false)).toContain('pin--transit')
    expect(pinHtml('ENTREGADO', false, false)).toContain('pin--delivered')
    expect(pinHtml('CANCELADO', false, false)).toContain('pin--cancelled')
    expect(pinHtml('EN_CAMINO', true, false)).toContain('is-sel')
    expect(pinHtml('EN_CAMINO', false, true)).toContain('is-dim')
    expect(pinHtml('EN_CAMINO', false, false)).not.toMatch(/is-sel|is-dim/)
  })

  it('el vehículo usa el color de su ruta y escapa la placa', () => {
    const route = { ...data.routes[1], plate: '<b>&' }
    const html = vehicleHtml(route, false)
    expect(html).toContain('veh r2')
    expect(html).toContain('&lt;b&gt;&amp;')
    expect(depotHtml('A&B')).toContain('A&amp;B')
  })
})

describe('RouteMap', () => {
  it('dibuja el mapa con las capas conmutables y los controles de zoom', { timeout: 30_000 }, async () => {
    const user = userEvent.setup()
    const { container } = render(<RouteMap source={new DemoMapData()} selectedId="PED-0026" />)
    const map = await screen.findByRole('group', { name: /Mapa de rutas de Lima Este/ })
    await waitFor(() => expect(container.querySelector('.leaflet-container')).not.toBeNull(), SLOW)
    await waitFor(() => expect(container.querySelectorAll('.eco-map__marker svg.pin')).toHaveLength(data.orders.length), SLOW)

    expect(container.querySelectorAll('.eco-map__marker svg.veh')).toHaveLength(data.routes.length)
    expect(container.querySelector('.pin.is-sel')).not.toBeNull()
    expect(within(map).getByRole('button', { name: 'Acercar' })).toBeInTheDocument()
    expect(within(map).getByLabelText('Leyenda')).toHaveTextContent('tramo por recorrer')

    expect(within(map).queryByRole('group', { name: 'Capas del mapa' })).toBeNull()
    await user.click(within(map).getByRole('button', { name: 'Capas' }))
    const layers = within(map).getByRole('group', { name: 'Capas del mapa' })
    await user.click(within(layers).getByRole('button', { name: 'Pedidos' }))
    expect(within(layers).getByRole('button', { name: 'Pedidos' })).toHaveAttribute('aria-pressed', 'false')
    await waitFor(() => expect(container.querySelectorAll('svg.pin')).toHaveLength(0))
    await user.click(within(layers).getByRole('button', { name: 'Rutas' }))
    expect(within(layers).getByRole('button', { name: 'Rutas' })).toHaveAttribute('aria-pressed', 'false')
    await user.click(within(layers).getByRole('button', { name: 'Camiones' }))
    await waitFor(() => expect(container.querySelectorAll('svg.veh')).toHaveLength(0))
  })

  // Las líneas de ruta (SVG) no se dibujan en jsdom; su atenuado se comprueba en el navegador (tests/ui/map.spec.ts).
  it('los vehículos de otras rutas se atenúan cuando hay un pedido elegido', { timeout: 20_000 }, async () => {
    const { container } = render(<RouteMap source={new DemoMapData()} selectedId="PED-0026" />)
    await waitFor(() => expect(container.querySelectorAll('svg.veh')).toHaveLength(data.routes.length), SLOW)
    expect(container.querySelectorAll('svg.veh.r1.is-dim')).toHaveLength(0)
    expect(container.querySelectorAll('svg.veh.is-dim')).toHaveLength(data.routes.length - 1)
  })

  it('la búsqueda oculta pedidos, rutas y vehículos que no coinciden', { timeout: 20_000 }, async () => {
    const { container } = render(<RouteMap source={new DemoMapData()} query="fhj-890" />)
    await waitFor(() => expect(container.querySelectorAll('svg.pin')).toHaveLength(data.orders.filter(order => order.route_id === 'r4').length), SLOW)
    expect(container.querySelectorAll('svg.pin.is-dim')).toHaveLength(0)
    expect(container.querySelectorAll('svg.veh')).toHaveLength(1)
  })

  it('elegir un pin avisa con el id del pedido', { timeout: 20_000 }, async () => {
    const onSelect = vi.fn()
    const user = userEvent.setup()
    render(<RouteMap source={new DemoMapData()} onSelect={onSelect} />)
    const pin = await screen.findByTitle('PED-0029 · Panadería San Hilarión · En camino', {}, SLOW)
    await user.click(pin)
    expect(onSelect).toHaveBeenCalledWith('PED-0029')
  })

  it('cerrar una tarjeta no reaparece con la selección externa y se puede abrir de nuevo', { timeout: 20_000 }, async () => {
    const source = new DemoMapData()
    // jsdom has no pointer type; Leaflet otherwise mistakes quick clicks for a touch double click.
    const user = userEvent.setup({ delay: 210 })
    const onSelect = vi.fn()
    const { container, rerender } = render(<RouteMap source={source} selectedId="PED-0029" onSelect={onSelect} />)
    await user.click(await screen.findByRole('button', { name: 'Cerrar tarjeta' }, SLOW))
    expect(container.querySelector('.eco-map__card')).toBeNull()
    expect(container.querySelector('.pin.is-sel')).toBeNull()
    expect(onSelect).not.toHaveBeenCalled()
    rerender(<RouteMap source={source} selectedId="PED-0029" onSelect={onSelect} query="panadería" />)
    expect(container.querySelector('.eco-map__card')).toBeNull()
    await user.click(screen.getByTitle('PED-0029 · Panadería San Hilarión · En camino'))
    expect(await screen.findByRole('button', { name: 'Cerrar tarjeta' })).toBeInTheDocument()
    expect(onSelect).toHaveBeenCalledWith('PED-0029')
    await user.click(screen.getByRole('button', { name: 'Cerrar tarjeta' }))
    rerender(<RouteMap source={source} selectedId="PED-0044" onSelect={onSelect} />)
    await waitFor(() => expect(container.querySelector('.eco-map__card')).toHaveTextContent('Farmacia Los Ángeles'))
    rerender(<RouteMap source={source} selectedId="PED-0029" onSelect={onSelect} />)
    await waitFor(() => expect(container.querySelector('.eco-map__card')).toHaveTextContent('Panadería San Hilarión'))
  })

  it('la versión compacta no muestra leyenda ni zoom', async () => {
    const user = userEvent.setup()
    render(<RouteMap source={new DemoMapData()} compact />)
    const map = await screen.findByRole('group', { name: /Mapa de rutas/ })
    expect(map).toHaveClass('eco-map--compact')
    expect(within(map).queryByLabelText('Leyenda')).toBeNull()
    expect(within(map).queryByRole('button', { name: 'Acercar' })).toBeNull()
    expect(within(map).queryByRole('group', { name: 'Capas del mapa' })).toBeNull()
    await user.click(within(map).getByRole('button', { name: 'Capas' }))
    expect(within(map).getByRole('group', { name: 'Capas del mapa' })).toBeInTheDocument()
  })

  it('si los datos no cargan avisa con claridad y no dibuja el mapa (US-006)', async () => {
    render(<RouteMap source={new UnavailableMapData()} />)
    expect(await screen.findByText('No se pudo cargar el mapa.')).toBeInTheDocument()
    expect(screen.getByText(/Los datos geográficos de pedidos y rutas aún no están disponibles/)).toBeInTheDocument()
    expect(screen.getByText(/Puedes seguir usando la lista de pedidos/)).toBeInTheDocument()
    expect(screen.queryByRole('group', { name: /Mapa de rutas de Lima Este/ })).toBeNull()
  })

  it('mientras llegan los datos muestra «Cargando mapa…»', () => {
    render(<RouteMap source={{ load: () => new Promise(() => {}) }} />)
    expect(screen.getByText('Cargando mapa…')).toBeInTheDocument()
  })

  it('combina estado y pedido, y limpiar restaura el conjunto completo', { timeout: 30_000 }, async () => {
    const user = userEvent.setup()
    const { container } = render(<RouteMap source={new DemoMapData()} />)
    const filters = screen.getByRole('group', { name: 'Filtros del mapa' })
    const status = within(filters).getByRole('combobox', { name: 'Estado de los pedidos en el mapa' })
    await waitFor(() => expect(status).toBeEnabled(), SLOW)
    await user.selectOptions(status, 'PENDIENTE')
    await waitFor(() => expect(container.querySelectorAll('svg.pin')).toHaveLength(2), SLOW)
    expect(container.querySelectorAll('svg.veh')).toHaveLength(0)
    const order = within(filters).getByRole('combobox', { name: 'Filtrar por pedido en el mapa' })
    await user.selectOptions(order, 'PED-0052')
    await waitFor(() => expect(container.querySelectorAll('svg.pin')).toHaveLength(1))
    expect(within(filters).getByRole('status')).toHaveTextContent('1 de 12 pedidos · 0 rutas')
    await user.click(within(filters).getByRole('button', { name: 'Limpiar filtros del mapa' }))
    await waitFor(() => expect(container.querySelectorAll('svg.pin')).toHaveLength(data.orders.length))
    expect(container.querySelectorAll('svg.veh')).toHaveLength(data.routes.length)
    expect(status).toHaveValue('ALL')
    expect(order).toHaveValue('')
  })
})
