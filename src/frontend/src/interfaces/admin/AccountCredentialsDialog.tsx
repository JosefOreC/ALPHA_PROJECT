import { useEffect, useRef, useState } from 'react'
import type { AdminUser } from '../../domain/admin'
import { requestJson } from '../../infrastructure/httpClient'

export function AccountCredentialsDialog({ user, field, onClose, onSaved }: {
  user: AdminUser
  field: 'email' | 'password'
  onClose: () => void
  onSaved: () => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const changingEmail = field === 'email'
  const title = changingEmail ? 'Cambiar correo' : 'Cambiar contraseña'
  useEffect(() => { dialog.current?.showModal() }, [])

  return <dialog ref={dialog} className="eco-dialog eco-dialog--form" aria-labelledby="reset-password-title"
    onClose={onClose} onCancel={event => { if (busy) event.preventDefault() }}>
    <form className="eco-stack" onSubmit={async event => {
      event.preventDefault()
      if (busy) return
      const form = new FormData(event.currentTarget)
      const password = form.get('password')
      if (!changingEmail && password !== form.get('confirmation')) {
        setError('Las contraseñas no coinciden.')
        return
      }
      setBusy(true)
      setError('')
      try {
        await requestJson(`/api/admin/users/${encodeURIComponent(user.id)}/${field}`, {
          method: 'PUT', body: changingEmail ? { email: form.get('email') } : { password },
        })
        dialog.current?.close()
        onSaved()
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : 'No se pudieron guardar los cambios de la cuenta.')
      } finally {
        setBusy(false)
      }
    }}>
      <h2 id="reset-password-title" className="eco-dialog__title">{title}</h2>
      <p className="eco-muted">Cuenta {user.email}. Se cerrarán sus sesiones abiertas.</p>
      {changingEmail ? <div className="eco-field"><label htmlFor="reset-email">Nuevo correo electrónico</label><input id="reset-email" name="email" type="email" className="eco-input" defaultValue={user.email} maxLength={255} required disabled={busy} /></div> : <>
      <div className="eco-field"><label htmlFor="reset-password">Nueva contraseña</label><input id="reset-password" name="password" type="password" className="eco-input" autoComplete="new-password" minLength={12} maxLength={256} required disabled={busy} /></div>
      <div className="eco-field"><label htmlFor="reset-confirmation">Repite la contraseña</label><input id="reset-confirmation" name="confirmation" type="password" className="eco-input" autoComplete="new-password" minLength={12} maxLength={256} required disabled={busy} /></div>
      </>}
      {error ? <p role="alert">{error}</p> : null}
      <div className="eco-dialog__actions">
        <button type="button" className="eco-btn eco-btn--secondary" disabled={busy} onClick={() => dialog.current?.close()}>Cancelar</button>
        <button type="submit" className="eco-btn" disabled={busy}>{busy ? 'Guardando…' : title}</button>
      </div>
    </form>
  </dialog>
}
