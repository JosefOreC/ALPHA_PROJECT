import policy from '../../../shared/rbac.json'
import type { Role } from './role'
import { isRole } from './role'

export type Permission = keyof typeof policy.permissions
export type AccessScope = 'all' | 'own'

export function scopeFor(role: Role, permission: Permission): AccessScope | null {
  if (!isRole(role) || !Object.hasOwn(policy.permissions, permission)) return null
  const grants = policy.permissions[permission] as Partial<Record<Role, AccessScope>>
  const scope = Object.hasOwn(grants, role) ? grants[role] : null
  return scope === 'all' || scope === 'own' ? scope : null
}
export const can = (role: Role, permission: Permission) => scopeFor(role, permission) !== null
export class AccessDenied extends Error {
  constructor() { super('Tu perfil no tiene permiso para esta operación.') }
}
export function requirePermission(role: Role, permission: Permission) {
  if (!can(role, permission)) throw new AccessDenied()
}
