import type { ManagedOrder } from '../domain/managedOrder'
import type { OrderStatus } from '../domain/order'

export type StatusTab = 'ALL' | OrderStatus

export interface BoardFilters { query: string; status: StatusTab; district: string }

/** Orden de los grupos en la lista: lo que se mueve primero. */
export const GROUP_ORDER: OrderStatus[] = ['EN_CAMINO', 'PENDIENTE', 'ENTREGADO', 'CANCELADO']
export const TAB_ORDER: StatusTab[] = ['ALL', 'PENDIENTE', 'EN_CAMINO', 'ENTREGADO', 'CANCELADO']

const fold = (value: string) => value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/** Busca por pedido, cliente, dirección, distrito y placa; ignora mayúsculas y tildes. */
export function matchesQuery(order: ManagedOrder, query: string): boolean {
  const needle = fold(query.trim())
  if (!needle) return true
  const haystack = [order.id, order.customer, order.address, order.district, order.tracking?.plate ?? ''].join(' ')
  return fold(haystack).includes(needle)
}

const inDistrict = (order: ManagedOrder, district: string) => !district || order.district === district

export function filterOrders(orders: ManagedOrder[], filters: BoardFilters): ManagedOrder[] {
  return orders.filter(order => matchesQuery(order, filters.query) && inDistrict(order, filters.district)
    && (filters.status === 'ALL' || order.status === filters.status))
}

/** Conteo por pestaña: respeta búsqueda y distrito, pero no la pestaña elegida. */
export function tabCounts(orders: ManagedOrder[], filters: Pick<BoardFilters, 'query' | 'district'>): Record<StatusTab, number> {
  const scoped = orders.filter(order => matchesQuery(order, filters.query) && inDistrict(order, filters.district))
  return Object.fromEntries(TAB_ORDER.map(tab => [tab, tab === 'ALL' ? scoped.length : scoped.filter(order => order.status === tab).length])) as Record<StatusTab, number>
}

export function groupByStatus(orders: ManagedOrder[]): { status: OrderStatus; orders: ManagedOrder[] }[] {
  return GROUP_ORDER.map(status => ({ status, orders: orders.filter(order => order.status === status) })).filter(group => group.orders.length > 0)
}

export interface BoardSummary {
  pending: number
  inTransit: number
  routes: number
  delivered: number
  cancelled: number
  atRisk: string[]
  averageCo2Kg: number | null
}

export function summarize(orders: ManagedOrder[]): BoardSummary {
  const count = (status: OrderStatus) => orders.filter(order => order.status === status).length
  const transit = orders.filter(order => order.status === 'EN_CAMINO')
  const plates = new Set(transit.map(order => order.tracking?.plate).filter((plate): plate is string => Boolean(plate)))
  const measured = orders.flatMap(order => (order.status !== 'CANCELADO' && order.tracking?.co2_kg != null ? [order.tracking.co2_kg] : []))
  return {
    pending: count('PENDIENTE'),
    inTransit: transit.length,
    routes: plates.size,
    delivered: count('ENTREGADO'),
    cancelled: count('CANCELADO'),
    atRisk: orders.filter(order => order.tracking?.at_risk && order.status === 'EN_CAMINO').map(order => order.id),
    averageCo2Kg: measured.length ? measured.reduce((sum, value) => sum + value, 0) / measured.length : null,
  }
}
