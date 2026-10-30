import { describe, expect, it } from 'vitest'
import type { MapData } from './mapData'
import { filterMapOrders, inLima, LIMA_REGION, MAP_PROFILES, prepareMap, selectionVisible, visiblePoints } from './mapPresentation'

const local = { lat: -12.04, lng: -76.96 }
const truck = { id: 'truck', plate: 'ECO-001', color: 1 as const, status: 'Disponible' as const, position: local, route_id: null }
const empty: MapData = { depot: null, routes: [], orders: [], vehicles: [] }

describe('filtros de pedidos en el mapa', () => {
  const r1 = { id: 'r1', plate: 'ABC-123', color: 1 as const, path: [local, { lat: -12.05, lng: -76.95 }], done_until: 0 }
  const r2 = { ...r1, id: 'r2', plate: 'BCD-456', color: 2 as const }
  const order = { id: 'p1', customer: 'Panadería Uno', district: 'Ate', status: 'EN_CAMINO' as const, position: local, window: '10:00–12:00', co2_kg: null, route_id: 'r1' }
  const data: MapData = { depot: { name: 'Almacén', position: local }, routes: [r1, r2], orders: [
    order, { ...order, id: 'p2', status: 'PENDIENTE', route_id: 'r2', district: 'Santa Anita' },
    { ...order, id: 'p3', status: 'ENTREGADO', route_id: 'r1' },
    { ...order, id: 'p4', status: 'PENDIENTE', route_id: null },
  ], vehicles: [{ ...truck, id: 'v1', route_id: 'r1', plate: r1.plate }, { ...truck, id: 'v2', route_id: 'r2', plate: r2.plate }, truck] }

  it('sin filtros conserva las rutas y los camiones sin pedido', () => {
    expect(filterMapOrders(data, {})).toBe(data)
  })

  it('filtra por estado y distrito sin mezclar pedidos de otra ruta', () => {
    const filtered = filterMapOrders(data, { status: 'PENDIENTE', district: 'Santa Anita' })
    expect(filtered.orders.map(item => item.id)).toEqual(['p2'])
    expect(filtered.routes.map(item => item.id)).toEqual(['r2'])
    expect(filtered.vehicles?.map(item => item.id)).toEqual(['v2'])
    expect(filtered.depot).toBe(data.depot)
    expect(data.orders).toHaveLength(4)
  })

  it('el pedido específico conserva solo su ruta y vehículo', () => {
    const filtered = filterMapOrders(data, { orderId: 'p1', status: 'EN_CAMINO' })
    expect(filtered.orders.map(item => item.id)).toEqual(['p1'])
    expect(filtered.routes.map(item => item.id)).toEqual(['r1'])
    expect(filtered.vehicles?.map(item => item.id)).toEqual(['v1'])
  })

  it('un pedido sin asignar sigue visible y no muestra rutas ajenas', () => {
    const filtered = filterMapOrders(data, { orderId: 'p4' })
    expect(filtered.orders.map(item => item.id)).toEqual(['p4'])
    expect(filtered.routes).toEqual([])
    expect(filtered.vehicles).toEqual([])
  })

  it('combina la búsqueda por placa y cliente con el estado', () => {
    expect(filterMapOrders(data, { queries: ['abc-123', 'panaderia'], status: 'EN_CAMINO' }).orders.map(item => item.id)).toEqual(['p1'])
  })

  it('un filtro sin resultados elimina líneas y marcadores pero conserva el almacén', () => {
    const filtered = filterMapOrders(data, { queries: ['no existe'] })
    expect(filtered.orders).toEqual([])
    expect(filtered.routes).toEqual([])
    expect(filtered.vehicles).toEqual([])
    expect(filtered.depot).toBe(data.depot)
  })
})

describe('contexto cartográfico', () => {
  it('extiende los cuatro lados 10 km respecto a la ventana anterior', () => {
    // Comprobación en metros con los radios de curvatura WGS84 locales.
    const radians = (degrees: number) => degrees * Math.PI / 180
    const a = 6378137
    const f = 1 / 298.257223563
    const e2 = f * (2 - f)
    const meridian = (latitude: number) => a * (1 - e2) / (1 - e2 * Math.sin(radians(latitude)) ** 2) ** 1.5
    const latitude = (-12.40 - 11.65) / 2
    const parallel = a * Math.cos(radians(latitude)) / Math.sqrt(1 - e2 * Math.sin(radians(latitude)) ** 2)
    const distances = [
      radians(-12.40 - LIMA_REGION.south) * meridian((-12.40 + LIMA_REGION.south) / 2),
      radians(LIMA_REGION.north + 11.65) * meridian((-11.65 + LIMA_REGION.north) / 2),
      radians(-77.25 - LIMA_REGION.west) * parallel,
      radians(LIMA_REGION.east + 76.60) * parallel,
    ]
    for (const meters of distances) expect(Math.abs(meters - 10000)).toBeLessThan(1)
  })

  it('conserva elementos en el margen ampliado y excluye coordenadas lejanas', () => {
    const positions = [
      { lat: -12.05, lng: -77.33 },
      { lat: -11.57, lng: -77.02 },
      { lat: -12.48, lng: -76.85 },
      { lat: -11.95, lng: -76.52 },
    ]
    const vehicles = positions.map((position, index) => ({ ...truck, id: `margin-${index}`, position }))
    const result = prepareMap({ ...empty, vehicles })
    expect(result.data.vehicles).toEqual(vehicles)
    expect(result.omitted).toBe(0)
    expect(inLima({ lat: -13, lng: -77 })).toBe(false)
    expect(inLima({ lat: -12, lng: -75 })).toBe(false)
  })

  it('permite camiones sin ruta y los incluye en encuadre de solo camiones', () => {
    const result = prepareMap({ ...empty, vehicles: [truck] })
    expect(result.data.routes).toEqual([])
    expect(result.data.vehicles).toEqual([truck])
    expect(visiblePoints(result.data, MAP_PROFILES.vehicles)).toEqual([local])
  })

  it('omitir una geometría inválida no une puntos a través del vacío', () => {
    const route = { id: 'r', plate: truck.plate, color: 1 as const, path: [local, { lat: NaN, lng: -76.95 }, local], done_until: 0 }
    const result = prepareMap({ ...empty, routes: [route], vehicles: [truck, { ...truck, id: 'outside', position: { lat: 0, lng: 0 } }] })
    expect(result.omitted).toBe(2)
    expect(result.data.routes).toEqual([])
    expect(result.data.vehicles).toEqual([truck])
  })

  it('el contexto del conductor falla cerrado sin placa y excluye rutas/pedidos ajenos', () => {
    const r = { id: 'r', plate: truck.plate, color: 1 as const, path: [local, { lat: -12.05, lng: -76.95 }], done_until: 0 }
    const other = { ...r, id: 'other', plate: 'OTRO-002' }
    const order = { id: 'pedido', customer: 'Ejemplo', district: 'Ate', status: 'PENDIENTE' as const, position: local, window: '10:00–12:00', co2_kg: null, route_id: r.id }
    const data: MapData = { ...empty, routes: [r, other], orders: [order, { ...order, id: 'ajeno', route_id: other.id }], vehicles: [truck, { ...truck, id: 'other', plate: other.plate }] }
    expect(prepareMap(data, '').data.routes).toEqual([])
    expect(prepareMap(data, '').data.vehicles).toEqual([])
    expect(prepareMap(data, truck.plate).data.routes.map(item => item.id)).toEqual(['r'])
    expect(prepareMap(data, truck.plate).data.vehicles).toEqual([truck])
    expect(prepareMap(data, truck.plate).data.orders.map(item => item.id)).toEqual(['pedido'])
  })

  it('una capa oculta no mantiene un popup aunque el id exista', () => {
    const data = { ...empty, vehicles: [truck] }
    expect(selectionVisible({ kind: 'vehicle', id: truck.id }, data, MAP_PROFILES.vehicles)).toBe(true)
    expect(selectionVisible({ kind: 'vehicle', id: truck.id }, data, MAP_PROFILES.routes)).toBe(false)
  })

  it('una colección explícita vacía no crea vehículos a partir de rutas', () => {
    const data = { ...empty, routes: [{ id: 'r', plate: truck.plate, color: 1 as const, path: [local, { lat: -12.05, lng: -76.95 }], done_until: 0 }] }
    expect(prepareMap(data).data.vehicles).toEqual([])
    const { vehicles: _vehicles, ...legacy } = data
    expect(prepareMap(legacy).data.vehicles).toHaveLength(1)
  })
})
