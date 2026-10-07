import type { MapData } from '../mapData'

/** Fuente de lo que se dibuja en el mapa: almacén, pedidos con coordenadas y rutas. */
export interface MapDataSource {
  load(): Promise<MapData>
}
