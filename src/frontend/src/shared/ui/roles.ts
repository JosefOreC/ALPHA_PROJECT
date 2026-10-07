// Vistas por rol (GUIA.md, tabla «Vistas por rol»): cada rol ve solo sus módulos.
import type { Role } from '../../domain/role'

export type { Role }

export type ModuleId =
  | 'dashboard'
  | 'pedidos'
  | 'rutas'
  | 'flota'
  | 'sostenibilidad'
  | 'admin'
  | 'mi-ruta'
  | 'pedido-actual'
  | 'incidencias'

export interface AppModule {
  id: ModuleId
  label: string
  href: string
}

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Administrador',
  planner: 'Planificador',
  driver: 'Conductor',
  logistics: 'Resp. de Logística',
}

const MODULES: Record<ModuleId, AppModule> = {
  dashboard: { id: 'dashboard', label: 'Dashboard del día', href: '/' },
  pedidos: { id: 'pedidos', label: 'Pedidos y rutas', href: '/?vista=pedidos' },
  rutas: { id: 'rutas', label: 'Generar rutas', href: '/?vista=rutas' },
  flota: { id: 'flota', label: 'Flota', href: '/?vista=flota' },
  sostenibilidad: { id: 'sostenibilidad', label: 'Sostenibilidad', href: '/?vista=sostenibilidad' },
  admin: { id: 'admin', label: 'Administración', href: '/?vista=admin' },
  'mi-ruta': { id: 'mi-ruta', label: 'Mi ruta', href: '/?vista=mi-ruta' },
  'pedido-actual': { id: 'pedido-actual', label: 'Pedido actual', href: '/?vista=conductor' },
  incidencias: { id: 'incidencias', label: 'Incidencias', href: '/?vista=incidencias' },
}

const ROLE_MODULES: Record<Role, ModuleId[]> = {
  admin: ['dashboard', 'pedidos', 'rutas', 'flota', 'sostenibilidad', 'admin'],
  planner: ['pedidos', 'rutas', 'flota'],
  driver: ['mi-ruta', 'pedido-actual', 'incidencias'],
  logistics: ['dashboard', 'sostenibilidad'],
}

export function modulesForRole(role: Role): AppModule[] {
  return ROLE_MODULES[role].map((id) => MODULES[id])
}
