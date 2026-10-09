import { useState } from 'react'
import { ROLE_LABELS, modulesForRole } from '../../shared/ui/roles'
import { LogoHojaRuta } from '../../shared/ui/icons'
import type { ModuleId } from '../../shared/ui/roles'
import { useSession } from './SessionState'

export function SessionToolbar({ onNavigate }: { onNavigate?: (id: ModuleId, href: string) => void }) {
  const session = useSession()
  if (!session?.user) return null
  const { user } = session
  return <div className="eco-root eco-session-bar">
    <span className="eco-session-user">{user.name} <span className="eco-tag">{ROLE_LABELS[user.role]}</span></span>
    {user.role === 'driver' ? <details className="eco-session-menu"><summary>Consultas</summary><nav aria-label="Consultas del conductor">
      {modulesForRole('driver').filter(module => ['pedidos', 'flota', 'conductores'].includes(module.id)).map(module => <a key={module.id} href={module.href} onClick={event => { if (onNavigate) { event.preventDefault(); onNavigate(module.id, module.href) } }}>{module.label}</a>)}
    </nav></details> : null}
    <button className="eco-btn eco-btn--ghost" type="button" onClick={() => void session.logout()}>Salir</button>
    {session.error ? <span role="alert">{session.error}</span> : null}
  </div>
}

export function SessionGate() {
  const session = useSession()!
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  return <main className="eco-root eco-login" data-theme="light">
    <section className="eco-login__intro" aria-label="EcoLogística Lima">
      <a href="/" className="eco-login__brand"><LogoHojaRuta /> EcoLogística <span>Lima</span></a>
      <div><span className="eco-login__eyebrow">OPERACIÓN SOSTENIBLE</span><h2>Cada entrega cuenta.<br />Cada ruta, también.</h2><p>Organiza tu operación, acompaña a tu equipo y sigue el impacto de tus entregas desde un solo lugar.</p></div>
      <span className="eco-login__foot">DistriRápido · Lima, Perú</span>
    </section>
    <section className="eco-login__panel">
      <div className="eco-login__form eco-stack eco-stack--loose">
        <div><p className="eco-login__eyebrow">BIENVENIDO A ECOLOGÍSTICA</p><h1 className="eco-h1">Inicia sesión</h1><p className="eco-sub">Ingresa con la cuenta asignada por tu administrador.</p></div>
        {session.loading ? <p role="status">Verificando sesión…</p> : <form className="eco-stack" onSubmit={async event => {
          event.preventDefault(); if (busy) return; setBusy(true)
          try { await session.login(email.trim(), password); setPassword('') } catch { setPassword('') } finally { setBusy(false) }
        }}>
          <div className="eco-field"><label htmlFor="login-email">Correo electrónico</label><input id="login-email" className="eco-input" type="email" autoComplete="username" required maxLength={255} value={email} onChange={event => setEmail(event.target.value)} disabled={busy} placeholder="tu.nombre@empresa.pe" /></div>
          <div className="eco-field"><label htmlFor="login-password">Contraseña</label><div className="eco-login__password"><input id="login-password" className="eco-input" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required maxLength={256} value={password} onChange={event => setPassword(event.target.value)} disabled={busy} /><button type="button" className="eco-btn eco-btn--ghost" aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} onClick={() => setShowPassword(value => !value)}>{showPassword ? 'Ocultar' : 'Mostrar'}</button></div></div>
          {session.error ? <p className="eco-login__error" role="alert">{session.error}</p> : null}
          <button className="eco-btn eco-btn--block" type="submit" disabled={busy}>{busy ? 'Iniciando sesión…' : 'Ingresar'}</button>
        </form>}
        <p className="eco-muted eco-note">Para obtener una cuenta o recuperar el acceso, contacta al administrador de tu organización.</p>
      </div>
    </section>
  </main>
}
