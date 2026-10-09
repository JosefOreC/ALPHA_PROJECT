import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { SessionSource, SessionUser } from '../../domain/session'
import { DEMO_ACCOUNTS, readDemoSession, saveDemoSession } from '../../infrastructure/demoSession'
import { SessionContext } from './SessionState'

export function SessionProvider({ source, demo, children }: { source: SessionSource; demo: boolean; children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(() => demo ? readDemoSession() : null)
  const [loading, setLoading] = useState(!demo)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    if (demo) return
    const controller = new AbortController()
    source.load(controller.signal).then(value => { if (!controller.signal.aborted) { setUser(value); setError('') } })
      .catch(reason => { if (!controller.signal.aborted) { setUser(null); setError(reason instanceof Error ? reason.message : 'No se pudo verificar la sesión.') } })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [source, demo, attempt])
  const chooseDemo = (id: string) => {
    if (!demo) return
    const next = DEMO_ACCOUNTS.find(account => account.subjectId === id)
    if (next) { saveDemoSession(next); setUser(next); setError('') }
  }
  const logout = async () => {
    try {
      if (!demo) await source.logout()
      else saveDemoSession(null)
      setUser(null); setError('')
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'No se pudo cerrar la sesión.') }
  }
  return <SessionContext.Provider value={{ user, loading, error, demo, chooseDemo, logout, retry: () => { setLoading(true); setAttempt(value => value + 1) } }}>{children}</SessionContext.Provider>
}
