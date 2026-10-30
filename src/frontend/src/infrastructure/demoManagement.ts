import { canEdit, ManagementError, validateOrder } from '../domain/managedOrder'
import type { ManagedOrder, ManagementPort, OrderData, OrderFilters } from '../domain/managedOrder'

type Row = [id: string, customer: string, address: string, district: string, from: string, to: string, kg: number,
  status: ManagedOrder['status'], plate: string, driver: string, note: string, co2: number, instructions: string, atRisk?: true]

// Datos ficticios de la pantalla de diseño (Pedidos.dc.html); ventanas en hora de Lima, 2026-10-01.
const rows: Row[] = [
  ['PED-0021', 'Comercial Hermanos Quispe', 'Jr. Las Gardenias 210', 'San Juan de Lurigancho', '08:00', '10:00', 12, 'ENTREGADO', 'ABC-123', 'Luis Huamán', 'entregado 09:12', 0.36, 'Entregar por la puerta lateral.'],
  ['PED-0026', 'Minimarket Don Lucho', 'Av. Próceres 1450', 'San Juan de Lurigancho', '11:00', '13:00', 15.8, 'EN_CAMINO', 'ABC-123', 'Luis Huamán', 'siguiente parada · 11:05', 0.41, 'Dejar en recepción.'],
  ['PED-0029', 'Panadería San Hilarión', 'Av. Los Jardines 980', 'San Juan de Lurigancho', '12:00', '14:00', 9.4, 'EN_CAMINO', 'ABC-123', 'Luis Huamán', 'parada 3 de 3', 0.29, 'Mercadería refrigerada.'],
  ['PED-0027', 'Librería El Estudiante', 'Av. Riva Agüero 410', 'El Agustino', '08:30', '10:30', 4.1, 'ENTREGADO', 'BCD-456', 'Rosa Mendoza', 'entregado 09:40', 0.15, 'Sin indicaciones.'],
  ['PED-0022', 'Bodega La Esquina', 'Av. Riva Agüero 845', 'El Agustino', '09:00', '11:00', 6.5, 'EN_CAMINO', 'BCD-456', 'Rosa Mendoza', 'llega 10:55 · ventana en riesgo', 0.24, 'Llamar al llegar.', true],
  ['PED-0052', 'Ferretería Cerro San Pedro', 'Jr. Áncash 1203', 'El Agustino', '11:00', '12:00', 7.7, 'PENDIENTE', '', '', 'sin conductor', 0.22, 'Carga pesada: usar carretilla.'],
  ['PED-0031', 'Bodega Santa Rosa', 'Av. Los Ruiseñores 455', 'Santa Anita', '10:00', '12:00', 8.2, 'EN_CAMINO', 'EGH-567', 'Carmen Ríos', 'llega 11:35', 0.31, 'Tocar el timbre del portón verde; recibe el encargado.'],
  ['PED-0024', 'Distribuidora Ñaña', 'Av. Huarochirí 300', 'Santa Anita', '10:30', '12:30', 5, 'PENDIENTE', '', '', 'sin conductor', 0.18, 'Entregar en almacén posterior.'],
  ['PED-0023', 'Ferretería El Sol', 'Calle Los Ruiseñores 77', 'Santa Anita', '09:30', '11:30', 22.4, 'CANCELADO', '', '', 'canceló el cliente', 0, 'Cliente canceló por teléfono.'],
  ['PED-0035', 'Óptica Vitarte', 'Av. Nicolás Ayllón 5800', 'Ate', '08:00', '10:00', 2.2, 'ENTREGADO', 'FHJ-890', 'Jorge Salas', 'entregado 09:05', 0.09, 'Paquete frágil.'],
  ['PED-0044', 'Farmacia Los Ángeles', 'Carretera Central km 3,5', 'Ate', '10:30', '11:30', 3, 'EN_CAMINO', 'FHJ-890', 'Jorge Salas', 'llega 11:25 · ventana en riesgo', 0.12, 'Pedir firma del químico farmacéutico.', true],
  ['PED-0048', 'Mercado Ceres', 'Av. Separadora Industrial 2100', 'Ate', '12:00', '14:00', 18.6, 'EN_CAMINO', 'FHJ-890', 'Jorge Salas', 'parada 3 de 3', 0.44, 'Ingreso por la puerta 4.'],
]

const fixtures: ManagedOrder[] = rows.map(([id, customer, address, district, from, to, weight_kg, status, plate, driver, note, co2_kg, instructions, atRisk]) => ({
  id, customer, address, district, window_start: `2026-10-01T${from}:00-05:00`, window_end: `2026-10-01T${to}:00-05:00`,
  weight_kg, instructions, status, assigned: status !== 'PENDIENTE' && status !== 'CANCELADO',
  confirmed_at: status === 'ENTREGADO' ? `2026-10-01T${note.slice(-5)}:00-05:00` : null, version: 1,
  tracking: { plate: plate || null, driver: driver || null, note, co2_kg, at_risk: atRisk === true },
}))

/** Solo demostración explícita de interfaz. Nada se guarda en disco o en una API. */
export class DemoManagement implements ManagementPort {
  private readonly orders = new Map<string, ManagedOrder>(fixtures.map(order => [order.id, { ...order, tracking: order.tracking && { ...order.tracking } }]))
  async permissions() { return { can_write: true } }
  async list(filters: OrderFilters) {
    const items = [...this.orders.values()].filter(order => (!filters.status || order.status === filters.status) && (!filters.district || order.district === filters.district)).sort((a, b) => a.id.localeCompare(b.id))
    return { items: items.slice(filters.offset, filters.offset + filters.limit).map(order => ({ ...order })),
      limit: filters.limit, offset: filters.offset, has_more: items.length > filters.offset + filters.limit }
  }
  async view(id: string) {
    const order = this.orders.get(id)
    if (!order) throw new ManagementError('Pedido no encontrado.', 404)
    return { ...order }
  }
  async create(data: OrderData) {
    validateOrder(data)
    const order: ManagedOrder = { ...data, customer: data.customer.trim(), address: data.address.trim(), instructions: data.instructions.trim(),
      id: `DEMO-${crypto.randomUUID()}`, status: 'PENDIENTE', confirmed_at: null, assigned: false, version: 1 }
    this.orders.set(order.id, order)
    return { ...order }
  }
  private current(id: string, version: number): ManagedOrder {
    const order = this.orders.get(id)
    if (!order) throw new ManagementError('Pedido no encontrado.', 404)
    if (!canEdit(order) || order.version !== version) throw new ManagementError('El pedido cambió o no admite modificación.', 409)
    return order
  }
  async update(id: string, data: OrderData, version: number) {
    validateOrder(data)
    const order = { ...this.current(id, version), ...data, version: version + 1 }
    this.orders.set(id, order)
    return { ...order }
  }
  async cancel(id: string, version: number) {
    const order: ManagedOrder = { ...this.current(id, version), status: 'CANCELADO', version: version + 1 }
    this.orders.set(id, order)
    return { ...order }
  }
}
