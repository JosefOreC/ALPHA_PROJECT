import type { AlgorithmParameters } from '../domain/algorithmSettings'
import type { Integration, UserPage } from '../domain/admin'
import type { IntegrationCatalog, UserDirectory } from '../domain/ports/adminDirectory'
import type { AlgorithmSettings } from '../domain/ports/algorithmSettings'

// Valores de arranque de Admin.dc.html. Solo diésel y gasolina tienen un valor de referencia en el diseño;
// el resto queda sin definir (null) hasta que el proyecto confirme la fuente oficial: no se inventan.
export const DEFAULT_PARAMETERS: AlgorithmParameters = {
  co2Weight: 70,
  maxSeconds: 45,
  maxLoadPercent: 95,
  windowSlackMinutes: 10,
  autoReoptimize: true,
  emissionFactors: { DIESEL: 2.68, GASOLINA: 2.31, GLP: null, GNV: null, ELECTRICO: null, HIBRIDO: null },
}

const clone = (parameters: AlgorithmParameters): AlgorithmParameters => ({ ...parameters, emissionFactors: { ...parameters.emissionFactors } })

/** Solo demostración: se guarda en memoria y se reinicia al recargar. */
export class DemoAlgorithmSettings implements AlgorithmSettings {
  private stored = clone(DEFAULT_PARAMETERS)
  async load() {
    return clone(this.stored)
  }
  async save(parameters: AlgorithmParameters) {
    this.stored = clone(parameters)
    return clone(this.stored)
  }
}

/** Sin almacenamiento en la API los parámetros no se pueden guardar: se avisa en lugar de aparentar que se guardaron. */
export class UnavailableAlgorithmSettings implements AlgorithmSettings {
  async load(): Promise<AlgorithmParameters> {
    throw new Error('Los parámetros del algoritmo aún no tienen almacenamiento en la API.')
  }
  async save(): Promise<AlgorithmParameters> {
    throw new Error('Los parámetros del algoritmo aún no tienen almacenamiento en la API.')
  }
}

const DEMO_USERS: UserPage = {
  total: 19,
  roleCounts: { admin: 1, planner: 3, driver: 13, logistics: 2 },
  items: [
    { id: 'u1', name: 'Sistemas DistriRápido', email: 'sistemas@distrirapido.pe', role: 'admin', status: 'active', lastAccess: 'hoy 08:02' },
    { id: 'u2', name: 'Beto P.', email: 'planificacion@distrirapido.pe', role: 'planner', status: 'active', lastAccess: 'hoy 10:40' },
    { id: 'u3', name: 'Daniel Rojas', email: 'drojas@distrirapido.pe', role: 'planner', status: 'active', lastAccess: 'ayer 18:15' },
    { id: 'u4', name: 'Mariela Vargas', email: 'mvargas@distrirapido.pe', role: 'logistics', status: 'active', lastAccess: 'hoy 09:12' },
    { id: 'u5', name: 'Luis Huamán', email: 'lhuaman@distrirapido.pe', role: 'driver', status: 'active', lastAccess: 'hoy 10:41' },
    { id: 'u6', name: 'Rosa Mendoza', email: 'rmendoza@distrirapido.pe', role: 'driver', status: 'active', lastAccess: 'hoy 10:38' },
    { id: 'u7', name: 'Raúl Campos', email: 'rcampos@distrirapido.pe', role: 'driver', status: 'inactive', lastAccess: '12 sep' },
  ],
}

export class DemoUserDirectory implements UserDirectory {
  async list(): Promise<UserPage> {
    return { ...DEMO_USERS, items: DEMO_USERS.items.map((user) => ({ ...user })), roleCounts: { ...DEMO_USERS.roleCounts } }
  }
}

const DEMO_INTEGRATIONS: Integration[] = [
  { id: 'osm', name: 'Mapas · OpenStreetMap + Leaflet', description: 'Visualización de rutas (US-006)', status: 'connected' },
  { id: 'db', name: 'Base de datos · PostgreSQL + PostGIS', description: 'Pedidos, flota, rutas', status: 'connected' },
  { id: 'traffic', name: 'Tráfico en tiempo real', description: 'Reoptimización dinámica · Iteración 3', status: 'pending' },
]

export class DemoIntegrationCatalog implements IntegrationCatalog {
  async list() {
    return DEMO_INTEGRATIONS.map((item) => ({ ...item }))
  }
}

/** Sin una API de administración no hay usuarios ni integraciones que listar. */
export class UnavailableUserDirectory implements UserDirectory {
  async list(): Promise<UserPage> {
    throw new Error('La gestión de usuarios aún no tiene fuente de datos en la API.')
  }
}

export class UnavailableIntegrationCatalog implements IntegrationCatalog {
  async list(): Promise<Integration[]> {
    throw new Error('El estado de las integraciones aún no tiene fuente de datos en la API.')
  }
}
