import { isRole } from './role'
import type { Role } from './role'

export interface SessionUser {
  subjectId: string
  name: string
  role: Role
  driverId: string | null
  plate: string | null
}
export interface SessionSource {
  load(signal?: AbortSignal): Promise<SessionUser | null>
  logout(): Promise<void>
}
export function decodeSession(value: unknown): SessionUser {
  if (!value || typeof value !== 'object') throw new Error('La sesión recibida no es válida.')
  const item = value as Record<string, unknown>
  if (typeof item.subject_id !== 'string' || !item.subject_id.trim() || typeof item.name !== 'string' || !item.name.trim() || !isRole(item.role)
    || (item.driver_id != null && typeof item.driver_id !== 'string') || (item.plate != null && typeof item.plate !== 'string')) {
    throw new Error('La sesión recibida no es válida.')
  }
  return { subjectId: item.subject_id, name: item.name, role: item.role, driverId: item.driver_id as string | null ?? null, plate: item.plate as string | null ?? null }
}
