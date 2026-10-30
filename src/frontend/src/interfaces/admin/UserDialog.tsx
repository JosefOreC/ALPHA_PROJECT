import { useEffect, useRef, useState } from 'react'
import type { NewUser } from '../../domain/admin'
import { ROLE_ORDER } from '../../domain/admin'
import { ROLE_LABELS } from '../../shared/ui'
import type { Role } from '../../domain/role'

export function UserDialog({ onCreate, onClose }: { onCreate: (data: NewUser) => Promise<void>; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>('planner')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => { dialog.current?.showModal() }, [])
  return <dialog ref={dialog} className="eco-dialog eco-dialog--form" aria-labelledby="new-user-title" onClose={onClose} onCancel={event => { if (busy) event.preventDefault() }}>
    <form className="eco-stack" aria-busy={busy} onSubmit={async event => {
      event.preventDefault(); if (busy) return; setBusy(true); setError('')
      try { await onCreate({ name: name.trim(), email: email.trim(), password, role }); setPassword(''); dialog.current?.close() }
      catch (reason) { setError(reason instanceof Error ? reason.message : 'No se pudo crear el usuario.') }
      finally { setBusy(false) }
    }}>
      <h2 id="new-user-title" className="eco-dialog__title">Crear usuario</h2>
      <p className="eco-muted eco-flush">Asigna el acceso y comparte las credenciales con la persona responsable.</p>
      <div className="eco-field"><label htmlFor="new-user-name">Nombre completo</label><input id="new-user-name" autoFocus className="eco-input" required minLength={2} maxLength={200} value={name} onChange={event => setName(event.target.value)} disabled={busy} /></div>
      <div className="eco-field"><label htmlFor="new-user-email">Correo electrónico</label><input id="new-user-email" className="eco-input" type="email" autoComplete="off" required maxLength={255} value={email} onChange={event => setEmail(event.target.value)} disabled={busy} /></div>
      <div className="eco-field"><label htmlFor="new-user-role">Rol</label><select id="new-user-role" className="eco-select" value={role} onChange={event => setRole(event.target.value as Role)} disabled={busy}>{ROLE_ORDER.map(value => <option key={value} value={value}>{ROLE_LABELS[value]}</option>)}</select></div>
      <div className="eco-field"><label htmlFor="new-user-password">Contraseña inicial</label><input id="new-user-password" className="eco-input" type="password" autoComplete="new-password" required minLength={12} maxLength={256} value={password} onChange={event => setPassword(event.target.value)} disabled={busy} /><span className="eco-muted eco-note">Mínimo 12 caracteres.</span></div>
      {error ? <p role="alert">{error}</p> : null}
      <div className="eco-dialog__actions"><button className="eco-btn eco-btn--secondary" type="button" disabled={busy} onClick={() => dialog.current?.close()}>Cancelar</button><button className="eco-btn" type="submit" disabled={busy}>{busy ? 'Creando…' : 'Crear usuario'}</button></div>
    </form>
  </dialog>
}
