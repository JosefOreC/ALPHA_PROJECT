import { createContext, useContext } from 'react'
import type { Role } from '../../domain/role'
import type { SessionUser } from '../../domain/session'

export type SessionState = {
  user: SessionUser | null; loading: boolean; error: string
  login: (email: string, password: string) => Promise<void>; logout: () => Promise<void>; retry: () => void
}
export const SessionContext = createContext<SessionState | null>(null)
export const useSession = () => useContext(SessionContext)
/** Standalone stories/tests declare their actor; the App requires a verified session. */
export function useActor(defaultRole: Role) {
  return useSession()?.user?.role ?? defaultRole
}
