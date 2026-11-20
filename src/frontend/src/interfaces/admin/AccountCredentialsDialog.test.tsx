import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeAll, beforeEach, expect, it, vi } from 'vitest'
import type { AdminUser } from '../../domain/admin'
import { requestJson } from '../../infrastructure/httpClient'
import { AccountCredentialsDialog } from './AccountCredentialsDialog'

vi.mock('../../infrastructure/httpClient', () => ({ requestJson: vi.fn() }))
const request = vi.mocked(requestJson)
const account: AdminUser = { id: 'u/1', name: 'Ana', email: 'ana@example.invalid', role: 'driver', status: 'active', lastAccess: '—' }
const save = () => fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))
const set = (label: string, value: string) => fireEvent.change(screen.getByLabelText(label, { exact: true }), { target: { value } })
const show = () => {
  const callbacks = { onClose: vi.fn(), onSaved: vi.fn() }
  render(<AccountCredentialsDialog user={account} {...callbacks} />)
  return callbacks
}

beforeEach(() => request.mockReset())
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', '') }
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open')
    this.dispatchEvent(new Event('close'))
  }
})

it('informa que no hay cambios y permite cerrar sin escribir', () => {
  const callbacks = show()
  save()
  expect(screen.getByRole('alert')).toHaveTextContent('Modifica el correo')
  const dialog = screen.getByRole('dialog')
  const event = new Event('cancel', { cancelable: true })
  fireEvent(dialog, event)
  expect(event.defaultPrevented).toBe(false)
  fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
  expect(callbacks.onClose).toHaveBeenCalledOnce()
  expect(request).not.toHaveBeenCalled()
})

it('normaliza el correo sin enviar contraseña ni permitir un segundo envío', async () => {
  let finish!: () => void
  request.mockImplementationOnce(() => new Promise<void>(resolve => { finish = resolve }))
  const callbacks = show()
  set('Correo electrónico', 'NEW@example.invalid')
  save()
  const dialog = screen.getByRole('dialog')
  const event = new Event('cancel', { cancelable: true })
  fireEvent(dialog, event)
  expect(event.defaultPrevented).toBe(true)
  fireEvent.submit(dialog.querySelector('form')!)
  expect(request).toHaveBeenCalledTimes(1)
  expect(request).toHaveBeenCalledWith('/api/admin/users/u%2F1', { method: 'PATCH', body: { email: 'new@example.invalid' } })
  await act(async () => finish())
  expect(callbacks.onSaved).toHaveBeenCalledOnce()
})

it.each([new Error('Correo en uso'), 'offline'])('conserva abierto el formulario ante un error: %s', async failure => {
  request.mockRejectedValueOnce(failure)
  const callbacks = show()
  set('Nueva contraseña', 'clave-de-prueba-2026')
  set('Repite la contraseña', 'clave-de-prueba-2026')
  save()
  expect(await screen.findByRole('alert')).toHaveTextContent(failure instanceof Error ? failure.message : 'No se pudieron guardar los cambios')
  expect(request).toHaveBeenCalledWith('/api/admin/users/u%2F1', { method: 'PATCH', body: { password: 'clave-de-prueba-2026' } })
  expect(screen.getByRole('dialog')).toBeVisible()
  expect(callbacks.onSaved).not.toHaveBeenCalled()
})
