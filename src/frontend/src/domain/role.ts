import policy from '../../../shared/rbac.json'

/** ROL-01…ROL-05. ROL-06 revisa entregables, sin acceso a producción. */
export type Role = keyof typeof policy.roles
export const ROLES = Object.keys(policy.roles) as Role[]
export const ROLE_METADATA = policy.roles
export function isRole(value: unknown): value is Role {
  return typeof value === 'string' && Object.hasOwn(policy.roles, value)
}
