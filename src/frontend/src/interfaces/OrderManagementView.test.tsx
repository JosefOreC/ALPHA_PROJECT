import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it } from 'vitest'
import { createManagement } from '../application/manageOrders'
import { formatDecimal } from '../domain/format'
import { formatKg, formatWindow } from '../domain/managedOrder'
import { DemoManagement } from '../infrastructure/demoManagement'
import { OrderManagementView } from './OrderManagementView'

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

// Mapa inactivo: no resuelve nunca, así estas pruebas no dibujan Leaflet (se prueba aparte en RouteMap.test).
const idleMap = { load: () => new Promise<never>(() => {}) }
const setup = () => render(<OrderManagementView service={createManagement(new DemoManagement())} demo mapSource={idleMap} />)

describe('formateo', () => {
  it('muestra la ventana en hora de Lima y 24 h', () => {
    expect(formatWindow('2026-10-01T10:30:00-05:00', '2026-10-01T12:30:00-05:00')).toBe('10:30–12:30')
    expect(formatWindow('2026-10-01T15:00:00Z', '2026-10-01T17:00:00Z')).toBe('10:00–12:00')
    expect(formatWindow('nada', '10:00')).toBe('—–10:00')
  })

  it('muestra el peso con coma decimal', () => {
    expect(formatKg(12)).toBe('12,0 kg')
    expect(formatKg(15.8)).toBe('15,8 kg')
    expect(formatKg(1284.25)).toBe('1 284,25 kg')
    expect(formatDecimal(0.256, 2)).toBe('0,26')
  })
})

describe('OrderManagementView', () => {
  it('abre con el rol Planificador, el resumen y los pedidos agrupados por estado', async () => {
    setup()
    expect(await screen.findByRole('button', { name: /En camino/ })).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Planificador')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Flota/ })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Administración/ })).toBeNull()
    expect(screen.getByRole('region', { name: 'Resumen de pedidos' })).toHaveTextContent('6en 4 rutas')
    expect(screen.getByText('PED-0026')).toBeInTheDocument()
    expect(screen.getByText('de 12 pedidos')).toBeInTheDocument()
  })

  it('el buscador filtra por placa y por distrito, y muestra el estado vacío', async () => {
    const user = userEvent.setup()
    setup()
    await screen.findByText('PED-0026')
    await user.type(screen.getByRole('searchbox', { name: 'Buscar pedidos' }), 'fhj-890')
    expect(screen.getByText('PED-0044')).toBeInTheDocument()
    expect(screen.queryByText('PED-0026')).toBeNull()
    await user.clear(screen.getByRole('searchbox', { name: 'Buscar pedidos' }))
    await user.type(screen.getByRole('searchbox', { name: 'Buscar pedidos' }), 'santa anita')
    expect(screen.getByText('PED-0024')).toBeInTheDocument()
    expect(screen.queryByText('PED-0044')).toBeNull()
    await user.clear(screen.getByRole('searchbox', { name: 'Buscar pedidos' }))
    await user.type(screen.getByRole('searchbox', { name: 'Buscar pedidos' }), 'inexistente')
    expect(screen.getByText('Sin resultados.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Limpiar filtros' }))
    expect(screen.getByText('PED-0026')).toBeInTheDocument()
  })

  it('las pestañas filtran por estado y llevan su conteo', async () => {
    const user = userEvent.setup()
    setup()
    await screen.findByText('PED-0026')
    const tab = screen.getByRole('tab', { name: /Pendientes/ })
    expect(tab).toHaveTextContent('2')
    await user.click(tab)
    expect(tab).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByText('PED-0024')).toBeInTheDocument()
    expect(screen.queryByText('PED-0026')).toBeNull()
  })

  it('al elegir un pedido muestra su detalle y los pedidos con conductor no se pueden cancelar', async () => {
    const user = userEvent.setup()
    setup()
    await screen.findByText('PED-0026')
    await user.click(screen.getByRole('row', { name: /PED-0026/ }))
    const detail = screen.getByRole('article', { name: 'Detalle del pedido seleccionado' })
    expect(within(detail).getByRole('heading', { name: 'Minimarket Don Lucho' })).toBeInTheDocument()
    expect(detail).toHaveTextContent('ABC-123 · Luis Huamán')
    expect(within(detail).queryByRole('button', { name: 'Cancelar pedido' })).toBeNull()
    expect(within(detail).getByText('Este pedido ya no se puede modificar.')).toBeInTheDocument()
    expect(within(detail).getByRole('button', { name: 'Seguir en el mapa' })).toBeInTheDocument()
  })

  it('cancelar un pedido pendiente pide confirmación y conserva el historial', async () => {
    const user = userEvent.setup()
    setup()
    await screen.findByText('PED-0024')
    await user.click(screen.getByRole('row', { name: /PED-0024/ }))
    await user.click(screen.getByRole('button', { name: 'Cancelar pedido' }))
    const dialog = screen.getByRole('dialog', { name: '¿Cancelar el pedido PED-0024?' })
    await user.click(within(dialog).getByRole('button', { name: 'Volver' }))
    expect(screen.getByRole('row', { name: /PED-0024/ })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Cancelar pedido' }))
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Sí, cancelar pedido' }))
    expect(await screen.findByText('Pedido cancelado. Su historial se conserva.')).toBeInTheDocument()
    await user.click(screen.getByRole('tab', { name: /Cancelados/ }))
    expect(await screen.findByText('PED-0024')).toBeInTheDocument()
  })

  it('el selector de vista conmuta lista, lista + mapa y mapa', async () => {
    const user = userEvent.setup()
    setup()
    await screen.findByText('PED-0026')
    expect(screen.getByRole('group', { name: /Mapa de rutas/ })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Lista', pressed: false }))
    expect(screen.queryByRole('group', { name: /Mapa de rutas/ })).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Mapa', pressed: false }))
    expect(screen.queryByRole('region', { name: 'Lista de pedidos' })).toBeNull()
    expect(screen.getByRole('group', { name: /Mapa de rutas/ })).toBeInTheDocument()
  })

  it('registrar un pedido valida y agrega el pedido a la lista', async () => {
    const user = userEvent.setup()
    setup()
    await screen.findByText('PED-0026')
    await user.click(screen.getByRole('button', { name: 'Registrar pedido' }))
    await user.type(screen.getByLabelText('Destinatario *'), 'Cliente nuevo ficticio')
    await user.type(screen.getByLabelText('Dirección de entrega *'), 'Calle ficticia 1')
    await user.selectOptions(screen.getByLabelText('Distrito *'), 'Ate')
    await user.type(screen.getByLabelText('Inicio de ventana · Lima *'), '2026-10-02T10:00')
    await user.type(screen.getByLabelText('Fin de ventana · Lima *'), '2026-10-02T12:00')
    await user.type(screen.getByLabelText('Peso del paquete (kg) *'), '2.5')
    await user.click(screen.getByRole('button', { name: 'Registrar pedido' }))
    expect(await screen.findByText('Pedido guardado correctamente.')).toBeInTheDocument()
    expect((await screen.findAllByText('Cliente nuevo ficticio')).length).toBeGreaterThan(0)
  })
})
