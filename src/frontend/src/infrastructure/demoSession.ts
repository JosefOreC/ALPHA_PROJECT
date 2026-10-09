import type { SessionUser } from '../domain/session'

export const DEMO_ACCOUNTS: SessionUser[] = [
  { subjectId: 'demo-admin', name: 'Sistemas · Demo', role: 'admin', driverId: null, plate: null },
  { subjectId: 'demo-planner', name: 'Planificación · Demo', role: 'planner', driverId: null, plate: null },
  { subjectId: 'demo-driver', name: 'Luis Huamán · Demo', role: 'driver', driverId: 'd1', plate: 'ABC-123' },
  { subjectId: 'demo-logistics', name: 'Logística · Demo', role: 'logistics', driverId: null, plate: null },
  { subjectId: 'demo-auditor', name: 'Auditoría · Demo', role: 'auditor', driverId: null, plate: null },
]
const KEY = 'ecologistica.demo-account'
export function readDemoSession() {
  try {
    const id = sessionStorage.getItem(KEY)
    return id === 'signed-out' ? null : DEMO_ACCOUNTS.find(account => account.subjectId === id) ?? DEMO_ACCOUNTS[0]
  } catch { return DEMO_ACCOUNTS[0] }
}
export function saveDemoSession(user: SessionUser | null) {
  try { sessionStorage.setItem(KEY, user?.subjectId ?? 'signed-out') } catch { /* Session remains usable in memory. */ }
}
