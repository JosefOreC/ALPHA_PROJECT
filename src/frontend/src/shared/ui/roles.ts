// Vistas por rol según la matriz del documento 08 de Usuarios.
import type { Role } from '../../domain/role'
import { ROLE_METADATA } from '../../domain/role'
import { can } from '../../domain/accessControl'
import type { Permission } from '../../domain/accessControl'

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
  | 'conductores'
  | 'auditoria'

export interface AppModule {
  id: ModuleId
  label: string
  href: string
}

export const ROLE_LABELS = Object.fromEntries(Object.entries(ROLE_METADATA).map(([role, meta]) => [role, meta.label])) as Record<Role, string>

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
  conductores: { id: 'conductores', label: 'Conductores', href: '/?vista=conductores' },
  auditoria: { id: 'auditoria', label: 'Auditoría', href: '/?vista=auditoria' },
}

const ROLE_MODULES: Record<Role, ModuleId[]> = {
  admin: ['dashboard', 'pedidos', 'rutas', 'flota', 'conductores', 'sostenibilidad', 'admin', 'auditoria', 'incidencias'],
  planner: ['dashboard', 'pedidos', 'rutas', 'flota', 'conductores', 'sostenibilidad', 'admin', 'incidencias'],
  driver: ['mi-ruta', 'pedido-actual', 'incidencias', 'pedidos', 'flota', 'conductores'],
  logistics: ['dashboard', 'pedidos', 'rutas', 'flota', 'conductores', 'sostenibilidad', 'incidencias'],
  auditor: ['pedidos', 'flota', 'conductores', 'sostenibilidad', 'admin', 'auditoria', 'incidencias'],
}

const MODULE_PERMISSIONS: Record<ModuleId, Permission[]> = {
  dashboard: ['dashboard.read'], pedidos: ['orders.read'], rutas: ['routes.read'],
  flota: ['fleet.read'], sostenibilidad: ['reports.read'], admin: ['settings.read'],
  'mi-ruta': ['routes.read'], 'pedido-actual': ['deliveries.read'],
  incidencias: ['incidents.read', 'incidents.create'], conductores: ['drivers.read'], auditoria: ['audit.read'],
}

export function modulesForRole(role: Role): AppModule[] {
  const ordered = Object.hasOwn(ROLE_MODULES, role) ? ROLE_MODULES[role] : []
  return ordered.filter(id => MODULE_PERMISSIONS[id].some(permission => can(role, permission))).map((id) => ({ ...MODULES[id],
    ...(id === 'admin' && role !== 'admin' ? { label: 'Parámetros' } : {}),
    ...(id === 'rutas' && !can(role, 'routes.generate') ? { label: 'Rutas del día' } : {}),
    ...(id === 'pedidos' && !can(role, 'map.read') ? { label: 'Pedidos' } : {}),
  }))
}

export function canOpenModule(role: Role, id: ModuleId) {
  return modulesForRole(role).some(module => module.id === id)
}
export function homeModule(role: Role): AppModule {
  return modulesForRole(role)[0]
}
export const canViewMap = (role: Role) => can(role, 'map.read')
