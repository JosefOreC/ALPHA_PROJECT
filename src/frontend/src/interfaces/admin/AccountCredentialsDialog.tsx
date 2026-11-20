import { useEffect, useRef, useState } from 'react'
import type { AdminUser } from '../../domain/admin'
import { requestJson } from '../../infrastructure/httpClient'

export function AccountCredentialsDialog({ user, onClose, onSaved }: {
  user: AdminUser
  onClose: () => void
  onSaved: () => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => { dialog.current?.showModal() }, [])

  return <dialog ref={dialog} className="eco-dialog eco-dialog--form" aria-labelledby="edit-account-title"
    onClose={onClose} onCancel={event => { if (busy) event.preventDefault() }}>
    <form className="eco-stack" onSubmit={async event => {
      event.preventDefault()
      if (busy) return
      const form = new FormData(event.currentTarget)
      const email = String(form.get('email') ?? '').trim().toLowerCase()
      const password = String(form.get('password') ?? '')
      if (password !== form.get('confirmation')) {
        setError('Las contraseñas no coinciden.')
        return
      }
      const changes = {
        ...(email !== user.email.toLowerCase() ? { email } : {}),
        ...(password ? { password } : {}),
      }
      if (!changes.email && !changes.password) {
        setError('Modifica el correo o ingresa una contraseña nueva.')
        return
      }
      setBusy(true)
      setError('')
      try {
        await requestJson(`/api/admin/users/${encodeURIComponent(user.id)}`, { method: 'PATCH', body: changes })
        dialog.current?.close()
        onSaved()
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : 'No se pudieron guardar los cambios de la cuenta.')
      } finally {
        setBusy(false)
      }
    }}>
      <h2 id="edit-account-title" className="eco-dialog__title">Editar cuenta</h2>
      <p className="eco-muted">Cuenta de {user.name}. Al guardar, se cerrarán sus sesiones abiertas.</p>
      <div className="eco-field">
        <label htmlFor="edit-account-email">Correo electrónico</label>
        <input id="edit-account-email" name="email" type="email" className="eco-input" defaultValue={user.email} maxLength={255} required disabled={busy} />
      </div>
      <div className="eco-field">
        <label htmlFor="edit-account-password">Nueva contraseña</label>
        <input id="edit-account-password" name="password" type="password" className="eco-input" autoComplete="new-password" minLength={12} maxLength={256} aria-describedby="edit-password-hint" disabled={busy} />
        <span className="eco-field__hint" id="edit-password-hint">Déjala en blanco para conservar la actual. Si la cambias, usa al menos 12 caracteres.</span>
      </div>
      <div className="eco-field">
        <label htmlFor="edit-account-confirmation">Repite la contraseña</label>
        <input id="edit-account-confirmation" name="confirmation" type="password" className="eco-input" autoComplete="new-password" minLength={12} maxLength={256} disabled={busy} />
      </div>
      {error ? <p role="alert">{error}</p> : null}
      <div className="eco-dialog__actions">
        <button type="button" className="eco-btn eco-btn--secondary" disabled={busy} onClick={() => dialog.current?.close()}>Cancelar</button>
        <button type="submit" className="eco-btn" disabled={busy}>{busy ? 'Guardando…' : 'Guardar cambios'}</button>
      </div>
    </form>
  </dialog>
}
