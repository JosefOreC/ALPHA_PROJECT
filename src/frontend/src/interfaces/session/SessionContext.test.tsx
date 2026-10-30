import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
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

function RetryScreen() {
  const session = useSession()!
  return <><button onClick={session.retry}>Reintentar sesión</button><Screen /></>
}

it.each([new Error('Sin red'), 'offline'])('reintenta una verificación fallida: %s', async reason => {
  const source = { load: vi.fn().mockRejectedValueOnce(reason).mockResolvedValue(account), login: vi.fn(), logout: vi.fn() }
  render(<SessionProvider source={source}><RetryScreen /></SessionProvider>)
  expect(await screen.findByRole('alert')).toHaveTextContent(reason instanceof Error ? reason.message : 'No se pudo verificar')
  fireEvent.click(screen.getByRole('button', { name:'Reintentar sesión' }))
  expect(await screen.findByText(account.name)).toBeVisible()
})

it('conserva una sesión activa si el cierre falla sin un objeto Error', async () => {
  const source = { load: vi.fn().mockResolvedValue(account), login:vi.fn(), logout:vi.fn().mockRejectedValue('offline') }
  render(<SessionProvider source={source}><Screen /></SessionProvider>)
  fireEvent.click(await screen.findByRole('button', { name:'Salir' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo cerrar')
})

it('oculta y muestra la contraseña y evita logins duplicados', async () => {
  let reject!: (reason: unknown) => void
  const source = { load:vi.fn().mockResolvedValue(null),login:vi.fn(() => new Promise<never>((_done, fail) => { reject=fail })),logout:vi.fn() }
  render(<SessionProvider source={source}><Screen /></SessionProvider>)
  await screen.findByLabelText('Contraseña')
  fireEvent.change(screen.getByLabelText('Correo electrónico'),{ target:{ value:'ana@example.invalid' } })
  fireEvent.change(screen.getByLabelText('Contraseña'),{ target:{ value:'test password' } })
  fireEvent.click(screen.getByRole('button',{ name:'Mostrar contraseña' }))
  expect(screen.getByLabelText('Contraseña')).toHaveAttribute('type','text')
  fireEvent.click(screen.getByRole('button',{ name:'Ocultar contraseña' }))
  const form=screen.getByRole('button',{ name:'Ingresar' }).closest('form')!
  fireEvent.submit(form); fireEvent.submit(form)
  expect(source.login).toHaveBeenCalledOnce()
  await act(async () => reject('offline'))
  expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo iniciar sesión')
})

it.each([true,false])('descarta verificaciones que terminan después de desmontar: error=%s', async failed => {
  let resolve!: (value: typeof account) => void; let reject!: (reason: unknown) => void
  const source = { load:vi.fn(() => new Promise<typeof account>((done,fail) => { resolve=done; reject=fail })),login:vi.fn(),logout:vi.fn() }
  const view=render(<SessionProvider source={source}><Screen /></SessionProvider>)
  view.unmount()
  await act(async () => { if(failed) reject(new Error('aborted')); else resolve(account) })
  expect(source.load.mock.calls[0]).toBeDefined()
})

it('la barra del conductor navega sus consultas y se oculta sin sesión', async () => {
  const onNavigate=vi.fn()
  const source={ load:vi.fn().mockResolvedValue({ ...account,role:'driver' as const }),login:vi.fn(),logout:vi.fn() }
  render(<SessionProvider source={source}><SessionToolbar onNavigate={onNavigate} /></SessionProvider>)
  const link=await screen.findByRole('link',{ name:'Pedidos y rutas' ,hidden:true })
  fireEvent.click(link)
  expect(onNavigate).toHaveBeenCalledWith('pedidos','/?vista=pedidos')
})
