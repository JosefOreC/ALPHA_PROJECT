import type { GeoPoint, MapData, MapOrder, MapRoute } from '../domain/mapData'
import type { MapDataSource } from '../domain/ports/mapDataSource'

const p = (lat: number, lng: number): GeoPoint => ({ lat, lng })

// Coordenadas ficticias de Lima Este; solo ilustran la distribución por distrito (Mapa.dc.html).
const DEPOT = p(-12.038, -76.948)

const ROUTES: MapRoute[] = [
  { id: 'r1', plate: 'ABC-123', color: 1, path: [DEPOT, p(-12.0, -76.993), p(-11.988, -77.005), p(-11.976, -77.012)], done_until: 1 },
  { id: 'r2', plate: 'BCD-456', color: 2, path: [DEPOT, p(-12.042, -77.0), p(-12.048, -77.01)], done_until: 1 },
  { id: 'r3', plate: 'EGH-567', color: 3, path: [DEPOT, p(-12.045, -76.965)], done_until: 0 },
  { id: 'r4', plate: 'FHJ-890', color: 4, path: [DEPOT, p(-12.03, -76.91), p(-12.026, -76.9), p(-12.035, -76.89)], done_until: 1 },
]

type Row = [id: string, customer: string, district: string, status: MapOrder['status'], route: string | null, at: GeoPoint, window: string, co2: number]
const ROWS: Row[] = [
  ['PED-0021', 'Comercial Hermanos Quispe', 'San Juan de Lurigancho', 'ENTREGADO', 'r1', p(-12.0, -76.993), '08:00–10:00', 0.36],
  ['PED-0026', 'Minimarket Don Lucho', 'San Juan de Lurigancho', 'EN_CAMINO', 'r1', p(-11.988, -77.005), '11:00–13:00', 0.41],
  ['PED-0029', 'Panadería San Hilarión', 'San Juan de Lurigancho', 'EN_CAMINO', 'r1', p(-11.976, -77.012), '12:00–14:00', 0.29],
  ['PED-0027', 'Librería El Estudiante', 'El Agustino', 'ENTREGADO', 'r2', p(-12.042, -77.0), '08:30–10:30', 0.15],
  ['PED-0022', 'Bodega La Esquina', 'El Agustino', 'EN_CAMINO', 'r2', p(-12.048, -77.01), '09:00–11:00', 0.24],
  ['PED-0052', 'Ferretería Cerro San Pedro', 'El Agustino', 'PENDIENTE', null, p(-12.052, -77.005), '11:00–12:00', 0.22],
  ['PED-0031', 'Bodega Santa Rosa', 'Santa Anita', 'EN_CAMINO', 'r3', p(-12.045, -76.965), '10:00–12:00', 0.31],
  ['PED-0024', 'Distribuidora Ñaña', 'Santa Anita', 'PENDIENTE', null, p(-12.048, -76.97), '10:30–12:30', 0.18],
  ['PED-0023', 'Ferretería El Sol', 'Santa Anita', 'CANCELADO', null, p(-12.044, -76.98), '09:30–11:30', 0],
  ['PED-0035', 'Óptica Vitarte', 'Ate', 'ENTREGADO', 'r4', p(-12.03, -76.91), '08:00–10:00', 0.09],
  ['PED-0044', 'Farmacia Los Ángeles', 'Ate', 'EN_CAMINO', 'r4', p(-12.026, -76.9), '10:30–11:30', 0.12],
  ['PED-0048', 'Mercado Ceres', 'Ate', 'EN_CAMINO', 'r4', p(-12.035, -76.89), '12:00–14:00', 0.44],
]

/** Solo demostración: datos ficticios, coherentes con los pedidos y la flota de demostración. */
export class DemoMapData implements MapDataSource {
  async load(): Promise<MapData> {
    return {
      depot: { name: 'Almacén Ate', position: DEPOT },
      orders: ROWS.map(([id, customer, district, status, route_id, position, window, co2_kg]) => ({ id, customer, district, status, route_id, position, window, co2_kg })),
      routes: ROUTES.map(route => ({ ...route, path: [...route.path] })),
    }
  }
}

/** Fuera del modo demostración la API aún no entrega coordenadas: se avisa en lugar de dibujar datos inventados. */
export class UnavailableMapData implements MapDataSource {
  async load(): Promise<MapData> {
    throw new Error('Los datos geográficos de pedidos y rutas aún no están disponibles en la API.')
  }
}
