import { ROLE_LABELS, homeModule, modulesForRole } from '../../shared/ui/roles'
import type { ModuleId } from '../../shared/ui/roles'
import { DEMO_ACCOUNTS } from '../../infrastructure/demoSession'
import { useSession } from './SessionState'

export function SessionToolbar({ onNavigate }: { onNavigate?: (id: ModuleId, href: string) => void }) {
  const session = useSession()
  if (!session?.user) return null
  const { user } = session
  return <div className="eco-root eco-session-bar">
    <span className="eco-session-user">{user.name} <span className="eco-tag">{ROLE_LABELS[user.role]}</span></span>
    {session.demo ? <label className="eco-session-switch">Perfil demo
      <select className="eco-select eco-select--compact" aria-label="Usuario de demostración" value={user.subjectId} onChange={event => {
        const account = DEMO_ACCOUNTS.find(item => item.subjectId === event.target.value)
        if (account) { window.history.replaceState({}, '', homeModule(account.role).href); session.chooseDemo(account.subjectId) }
      }}>
        {DEMO_ACCOUNTS.map(account => <option key={account.subjectId} value={account.subjectId}>{ROLE_LABELS[account.role]}</option>)}
      </select>
    </label> : null}
    {user.role === 'driver' ? <details className="eco-session-menu"><summary>Consultas</summary><nav aria-label="Consultas del conductor">
      {modulesForRole('driver').filter(module => ['pedidos', 'flota', 'conductores'].includes(module.id)).map(module => <a key={module.id} href={module.href} onClick={event => { if (onNavigate) { event.preventDefault(); onNavigate(module.id, module.href) } }}>{module.label}</a>)}
    </nav></details> : null}
    <button className="eco-btn eco-btn--ghost" type="button" onClick={() => void session.logout()}>Salir</button>
    {session.error ? <span role="alert">{session.error}</span> : null}
  </div>
}

export function SessionGate() {
  const session = useSession()!
  return <main className="eco-root eco-session-gate"><section className="eco-stack">
    <h1 className="eco-h1">{session.loading ? 'Verificando sesión…' : 'Inicia sesión'}</h1>
    {session.error ? <p role="alert">{session.error}</p> : null}
    {!session.loading && session.demo ? <><p className="eco-sub">Selecciona una cuenta de demostración.</p>
      {DEMO_ACCOUNTS.map(account => <button key={account.subjectId} className="eco-btn eco-btn--secondary" type="button" onClick={() => session.chooseDemo(account.subjectId)}>{ROLE_LABELS[account.role]}</button>)}
    </> : !session.loading ? <><p className="eco-sub">Necesitas una sesión verificada para acceder al sistema.</p><button className="eco-btn" type="button" onClick={session.retry}>Verificar sesión</button></> : null}
  </section></main>
}
