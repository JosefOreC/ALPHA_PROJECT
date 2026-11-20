import { describe, expect, it } from 'vitest'
import type { ManagedOrder } from '../domain/managedOrder'
import { filterOrders, groupByStatus, matchesQuery, summarize, tabCounts } from './orderBoard'

const order = (id: string, status: ManagedOrder['status'], extra: Partial<ManagedOrder> = {}): ManagedOrder => ({
  id, customer: 'Cliente ficticio', address: 'Dirección ficticia 1', district: 'Ate', window_start: '2026-10-01T10:00:00-05:00',
  window_end: '2026-10-01T12:00:00-05:00', weight_kg: 1, instructions: '', status, confirmed_at: null, assigned: false, version: 1, ...extra,
})
const tracking = (plate: string | null, extra: Partial<NonNullable<ManagedOrder['tracking']>> = {}) =>
  ({ plate, driver: null, note: null, co2_kg: null, at_risk: false, ...extra })

const orders = [
  order('PED-1', 'EN_CAMINO', { district: 'Santa Anita', customer: 'Panadería Ñaña', tracking: tracking('ABC-123', { co2_kg: 0.4, at_risk: true }) }),
  order('PED-2', 'PENDIENTE'),
  order('PED-3', 'ENTREGADO', { tracking: tracking('ABC-123', { co2_kg: 0.2 }) }),
  order('PED-4', 'CANCELADO', { tracking: tracking(null, { co2_kg: 0 }) }),
  order('PED-5', 'EN_CAMINO', { tracking: tracking('FHJ-890', { co2_kg: 0.6 }) }),
]

describe('matchesQuery', () => {
  it('busca por los datos del pedido sin depender de su vehículo', () => {
    expect(matchesQuery(orders[0], 'ped-1')).toBe(true)
    expect(matchesQuery(orders[0], 'panadería')).toBe(true)
    expect(matchesQuery(orders[0], 'dirección ficticia')).toBe(true)
    expect(matchesQuery(orders[0], 'santa anita')).toBe(true)
    expect(matchesQuery(orders[0], 'abc-123')).toBe(false)
    expect(matchesQuery(orders[0], 'zzz')).toBe(false)
  })

  it('ignora tildes y mayúsculas', () => {
    expect(matchesQuery(orders[0], 'PANADERIA NANA')).toBe(true)
    expect(matchesQuery(orders[0], '  ')).toBe(true)
  })
})

describe('filterOrders y tabCounts', () => {
  it('combina búsqueda, estado y distrito', () => {
    expect(filterOrders(orders, { query: '', status: 'EN_CAMINO', district: '' }).map(o => o.id)).toEqual(['PED-1', 'PED-5'])
    expect(filterOrders(orders, { query: 'panaderia', status: 'ALL', district: '' }).map(o => o.id)).toEqual(['PED-1'])
    expect(filterOrders(orders, { query: '', status: 'ALL', district: 'Santa Anita' }).map(o => o.id)).toEqual(['PED-1'])
  })

  it('cuenta por pestaña respetando búsqueda y distrito', () => {
    expect(tabCounts(orders, { query: '', district: '' })).toEqual({ ALL: 5, PENDIENTE: 1, EN_CAMINO: 2, ENTREGADO: 1, CANCELADO: 1 })
    expect(tabCounts(orders, { query: 'panaderia', district: '' })).toMatchObject({ ALL: 1, EN_CAMINO: 1, ENTREGADO: 0, PENDIENTE: 0 })
  })
})

describe('groupByStatus', () => {
  it('ordena los grupos y omite los vacíos', () => {
    expect(groupByStatus(orders).map(g => g.status)).toEqual(['EN_CAMINO', 'PENDIENTE', 'ENTREGADO', 'CANCELADO'])
    expect(groupByStatus(orders.filter(o => o.status !== 'PENDIENTE')).map(g => g.status)).toEqual(['EN_CAMINO', 'ENTREGADO', 'CANCELADO'])
    expect(groupByStatus([])).toEqual([])
  })
})

describe('summarize', () => {
  it('resume los estados del pedido sin métricas de rutas', () => {
    expect(summarize(orders)).toEqual({ pending: 1, inTransit: 2, delivered: 1, cancelled: 1 })
  })

  it('funciona sin una asignación de ruta', () => {
    const summary = summarize([order('PED-9', 'PENDIENTE')])
    expect(summary).toEqual({pending:1,inTransit:0,delivered:0,cancelled:0})
  })
})
