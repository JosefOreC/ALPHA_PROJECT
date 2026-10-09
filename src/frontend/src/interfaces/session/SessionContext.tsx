import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { SessionSource, SessionUser } from '../../domain/session'
import { SessionContext } from './SessionState'

export function SessionProvider({ source, children }: { source: SessionSource; children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    source.load(controller.signal).then(value => { if (!controller.signal.aborted) { setUser(value); setError('') } })
      .catch(reason => { if (!controller.signal.aborted) { setUser(null); setError(reason instanceof Error ? reason.message : 'No se pudo verificar la sesión.') } })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [source, attempt])
  const login = async (email: string, password: string) => {
    setError('')
    try { setUser(await source.login(email, password)) }
    catch (reason) { const message = reason instanceof Error ? reason.message : 'No se pudo iniciar sesión.'; setError(message); throw new Error(message) }
  }
  const logout = async () => {
    try { await source.logout(); setUser(null); setError(''); window.history.replaceState({}, '', window.location.pathname) }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'No se pudo cerrar la sesión.') }
  }
  return <SessionContext.Provider value={{ user, loading, error, login, logout, retry: () => { setLoading(true); setAttempt(value => value + 1) } }}>{children}</SessionContext.Provider>
}
