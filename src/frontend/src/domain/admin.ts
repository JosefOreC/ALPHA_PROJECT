import type { Role } from './role'
import { ROLE_METADATA, ROLES } from './role'

export type UserStatus = 'active' | 'inactive'
export interface NewUser { name: string; email: string; password: string; role: Role }

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

/** Código del rol en la documentación: ROL-01 … ROL-05. */
export const ROLE_CODES = Object.fromEntries(ROLES.map(role => [role, ROLE_METADATA[role].code])) as Record<Role, string>

export const ROLE_DESCRIPTIONS = Object.fromEntries(ROLES.map(role => [role, ROLE_METADATA[role].description])) as Record<Role, string>

export const ROLE_ORDER: Role[] = ROLES

export const INTEGRATION_STATUS_LABELS: Record<IntegrationStatus, string> = { connected: 'Conectado', pending: 'Pendiente', failed: 'Con fallas' }
