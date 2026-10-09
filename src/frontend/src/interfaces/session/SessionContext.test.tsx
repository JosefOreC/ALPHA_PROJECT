import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { SessionProvider } from './SessionContext'
import { SessionGate, SessionToolbar } from './SessionToolbar'
import { useSession } from './SessionState'
import type { SessionSource } from '../../domain/session'

function Screen() { const session = useSession()!; return session.user ? <SessionToolbar /> : <SessionGate /> }
afterEach(() => { cleanup(); sessionStorage.clear() })
const account = { subjectId: 'u1', name: 'Administrador verificado', role: 'admin' as const, driverId: null, plate: null }

describe('Inicio y cierre de sesión', () => {
  it('solo entra con credenciales verificadas y cierra la sesión en el servidor', async () => {
    sessionStorage.setItem('ecologistica.demo-account', 'demo-admin')
    const source: SessionSource = { load: vi.fn().mockResolvedValue(null), login: vi.fn().mockResolvedValue(account), logout: vi.fn().mockResolvedValue(undefined) }
    render(<SessionProvider source={source}><Screen /></SessionProvider>)
    await screen.findByLabelText('Correo electrónico')
    expect(screen.queryByRole('combobox')).toBeNull()
    expect(screen.queryByText(/demostración/)).toBeNull()
    fireEvent.change(screen.getByLabelText('Correo electrónico'), { target: { value: 'admin@empresa.pe' } })
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'una-clave-segura' } })
    fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }))
    expect(await screen.findByText(account.name)).toBeInTheDocument()
    expect(source.login).toHaveBeenCalledWith('admin@empresa.pe', 'una-clave-segura')
    fireEvent.click(screen.getByRole('button', { name: 'Salir' }))
    expect(await screen.findByRole('button', { name: 'Ingresar' })).toBeInTheDocument()
    expect(source.logout).toHaveBeenCalledOnce()
  })
  it('muestra el rechazo sin autenticar al usuario', async () => {
    const source: SessionSource = { load: vi.fn().mockResolvedValue(null), login: vi.fn().mockRejectedValue(new Error('Correo o contraseña incorrectos.')), logout: vi.fn() }
    render(<SessionProvider source={source}><Screen /></SessionProvider>)
    await screen.findByLabelText('Correo electrónico')
    fireEvent.change(screen.getByLabelText('Correo electrónico'), { target: { value: 'admin@empresa.pe' } })
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'incorrecta' } })
    fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Correo o contraseña incorrectos.')
    expect(screen.getByLabelText('Contraseña')).toHaveValue('')
    expect(screen.getByRole('button', { name: 'Ingresar' })).toBeEnabled()
  })
  it('conserva la sesión si falla la revocación', async () => {
    const source: SessionSource = { load: vi.fn().mockResolvedValue(account), login: vi.fn(), logout: vi.fn().mockRejectedValue(new Error('No se pudo revocar.')) }
    render(<SessionProvider source={source}><Screen /></SessionProvider>)
    expect(await screen.findByText(account.name)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Salir' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo revocar.')
    expect(screen.getByText(account.name)).toBeInTheDocument()
  })
})
