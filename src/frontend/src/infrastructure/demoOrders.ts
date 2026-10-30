import type { DriverRoute, DriverRoutePort, RouteStop } from '../domain/driverRoute'
import type { Order, OrdersPort } from '../domain/order'

// Datos ficticios de la ruta de ABC-123 (ConductorRuta.dc.html y Conductor.dc.html); horas de Lima, 2026-10-01.
const at = (time: string) => `2026-10-01T${time}:00-05:00`
const order = (id: string, customer: string, address: string, from: string, to: string, weight_kg: number, instructions: string, status: Order['status'], confirmed?: string): Order => ({
  id, customer, address, district: 'San Juan de Lurigancho', window_start: at(from), window_end: at(to), weight_kg, instructions,
  status, confirmed_at: confirmed ? at(confirmed) : null,
})

const ORDERS: Order[] = [
  order('PED-0018', 'Bodega Mi Barrio', 'Av. Santa Rosa 340', '07:30', '09:30', 5.2, 'Entregar al encargado.', 'ENTREGADO', '08:20'),
  order('PED-0021', 'Comercial Hermanos Quispe', 'Jr. Las Gardenias 210', '08:00', '10:00', 12, 'Entregar por la puerta lateral.', 'ENTREGADO', '09:12'),
  order('PED-0026', 'Minimarket Don Lucho', 'Av. Próceres 1450', '11:00', '13:00', 15.8, 'Dejar en recepción; firma el encargado de turno.', 'EN_CAMINO'),
  order('PED-0055', 'Botica San Martín', 'Av. Los Álamos 215', '11:00', '13:00', 3.4, 'Entregar en mostrador.', 'EN_CAMINO'),
  order('PED-0029', 'Panadería San Hilarión', 'Av. Los Jardines 980', '12:00', '14:00', 9.4, 'Mercadería refrigerada.', 'EN_CAMINO'),
]

// Horas previstas por parada y paradas agregadas por reoptimización.
const SCHEDULE: Record<string, { time: string; added?: true }> = {
  'PED-0018': { time: '08:20' }, 'PED-0021': { time: '09:12' }, 'PED-0026': { time: '11:05' },
  'PED-0055': { time: '11:30', added: true }, 'PED-0029': { time: '12:10' },
}
const TOTAL_STOPS = 9
const REMAINING_STOPS = 4

const limaTime = new Intl.DateTimeFormat('es-PE', { timeZone: 'America/Lima', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })

/** Solo demostración: pedidos y ruta del conductor comparten estado, así que confirmar una entrega avanza la ruta. */
export class DemoOrders implements OrdersPort, DriverRoutePort {
  private orders = new Map<string, Order>(ORDERS.map(item => [item.id, { ...item }]))

  async view(id: string) {
    const found = this.orders.get(id)
    if (!found) throw new Error('Pedido no encontrado.')
    return { ...found }
  }

  async confirm(id: string) {
    const found = await this.view(id)
    if (found.status === 'ENTREGADO') return found
    const confirmed = { ...found, status: 'ENTREGADO' as const, confirmed_at: new Date().toISOString() }
    this.orders.set(id, confirmed)
    return { ...confirmed }
  }

  async route(): Promise<DriverRoute> {
    const items = ORDERS.map(item => this.orders.get(item.id) as Order)
    const firstOpen = items.findIndex(item => item.status !== 'ENTREGADO')
    const stops: RouteStop[] = items.map((item, index) => {
      const plan = SCHEDULE[item.id]
      const done = item.status === 'ENTREGADO'
      return {
        order_id: item.id, customer: item.customer, address: item.address,
        time: done && item.confirmed_at ? limaTime.format(new Date(item.confirmed_at)) : plan.time,
        kind: done ? 'done' : index === firstOpen ? 'now' : plan.added ? 'new' : 'next',
      }
    })
    const delivered = stops.filter(stop => stop.kind === 'done').length
    const open = stops.length - delivered
    return {
      plate: 'ABC-123', driver: 'Luis Huamán', initials: 'LH',
      delivered, total: TOTAL_STOPS, co2_saved_percent: 21, co2_saved_kg: 1.6, km_remaining: 34,
      stops, remaining_stops: open === 0 ? 0 : REMAINING_STOPS, return_time: '12:40', depot: 'almacén de Ate',
      change: { at: '10:38', message: 'Se agregó PED-0055 como parada 4 por tráfico en Av. Próceres. Terminas 12:40.' },
    }
  }
}

/** Sin un motor de rutas aprobado no hay ruta del día que mostrar; se avisa en lugar de inventarla. */
export class UnavailableDriverRoute implements DriverRoutePort {
  async route(): Promise<DriverRoute> {
    throw new Error('Tu ruta del día aún no está disponible: se publica cuando el planificador aprueba las rutas.')
  }
}
