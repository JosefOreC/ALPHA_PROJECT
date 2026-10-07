import type { Role } from './role'

export type UserStatus = 'active' | 'inactive'

export interface AdminUser {
  id: string
  name: string
  email: string
  role: Role
  status: UserStatus
  /** Texto ya listo: «hoy 08:02», «12 sep». */
  lastAccess: string
}

export interface UserPage {
  items: AdminUser[]
  total: number
  /** Usuarios por rol en toda la organización, no solo los de esta página. */
  roleCounts: Record<Role, number>
}

export type IntegrationStatus = 'connected' | 'pending' | 'failed'

export interface Integration {
  id: string
  name: string
  description: string
  status: IntegrationStatus
}

/** Código del rol en la documentación: ROL-01 … ROL-04. */
export const ROLE_CODES: Record<Role, string> = { admin: 'ROL-01', planner: 'ROL-02', driver: 'ROL-03', logistics: 'ROL-04' }

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  admin: 'Configuración, usuarios, flota y parámetros. Acceso a todo.',
  planner: 'Pedidos, flota, conductores y generación de rutas.',
  driver: 'Su ruta, confirmar entregas, incidencias y alertas.',
  logistics: 'Dashboard, sostenibilidad y cumplimiento.',
}

export const ROLE_ORDER: Role[] = ['admin', 'planner', 'driver', 'logistics']

export const INTEGRATION_STATUS_LABELS: Record<IntegrationStatus, string> = { connected: 'Conectado', pending: 'Pendiente', failed: 'Con fallas' }
