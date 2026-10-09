import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { SessionProvider } from './SessionContext'
import { SessionGate, SessionToolbar } from './SessionToolbar'
import { useSession } from './SessionState'
import type { SessionSource } from '../../domain/session'

function Screen() {
  const session = useSession()!
  return session.user ? <SessionToolbar /> : <SessionGate />
}
afterEach(() => { cleanup(); sessionStorage.clear() })

describe('Origen de identidad y cierre de sesión', () => {
  it('permite cambiar y cerrar únicamente cuentas demo sin consultar HTTP', async () => {
    const source: SessionSource = { load: vi.fn(), logout: vi.fn() }
    render(<SessionProvider source={source} demo><Screen /></SessionProvider>)
    fireEvent.change(screen.getByRole('combobox', { name: 'Usuario de demostración' }), { target: { value: 'demo-auditor' } })
    expect(screen.getByText('Auditoría · Demo')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Salir' }))
    expect(await screen.findByRole('heading', { name: 'Inicia sesión' })).toBeInTheDocument()
    expect(source.load).not.toHaveBeenCalled()
    expect(source.logout).not.toHaveBeenCalled()
    expect(sessionStorage.getItem('ecologistica.demo-account')).toBe('signed-out')
  })
  it('ignora preferencias demo en HTTP y conserva sesión si la revocación falla', async () => {
    sessionStorage.setItem('ecologistica.demo-account', 'demo-admin')
    const source: SessionSource = {
      load: vi.fn().mockResolvedValue({ subjectId: 'u1', name: 'Auditor verificado', role: 'auditor', driverId: null, plate: null }),
      logout: vi.fn().mockRejectedValue(new Error('No se pudo revocar.')),
    }
    render(<SessionProvider source={source} demo={false}><Screen /></SessionProvider>)
    expect(await screen.findByText('Auditor verificado')).toBeInTheDocument()
    expect(screen.queryByRole('combobox')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Salir' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo revocar.')
    expect(screen.getByText('Auditor verificado')).toBeInTheDocument()
  })
})
