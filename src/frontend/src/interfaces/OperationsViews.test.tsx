import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { DriversView } from './DriversView'
import { RecordsView } from './RecordsView'
import { SessionContext } from './session/SessionState'
import { requestJson } from '../infrastructure/httpClient'
import type { Role } from '../domain/role'

vi.mock('../infrastructure/httpClient', () => ({ requestJson: vi.fn() }))
const request = vi.mocked(requestJson)
const active = { conductor_id: 'd1', nombre_completo: 'Ana Pérez', dni: '12345678', licencia: 'LIC-1', vehiculo_id: 'v1', estado: 'ACTIVO' }
const vehicles = { total: 3, vehiculos: [{ vehiculo_id: 'v1', placa: 'TST-001', activo: true }, { vehiculo_id: 'v2', placa: 'TST-002', activo: true }, { vehiculo_id: 'v3', placa: 'TST-003', activo: false }] }
function mount(view: React.ReactNode, role: Role = 'admin') {
  return render(<SessionContext.Provider value={{ user: { subjectId: 'u1', name: 'Ana', role, driverId: 'd1', plate: 'TST-001' }, loading: false, error: '', login: vi.fn(), logout: vi.fn(), retry: vi.fn() }}>{view}</SessionContext.Provider>)
}
beforeEach(() => { request.mockReset() })
afterEach(() => vi.restoreAllMocks())
function driversApi(items = [active]) {
  request.mockImplementation(async path => path === '/api/v1/drivers' ? { items } : path === '/api/v1/vehicles' ? vehicles : [{ id: 'u2', name: 'Nueva cuenta' }])
}

it('muestra conductores, vehículos vinculados y permisos de solo lectura', async () => {
  driversApi([active, { ...active, conductor_id: 'd2', nombre_completo: 'Luis', vehiculo_id: 'missing', estado: 'INACTIVO' }])
  mount(<DriversView />, 'auditor')
  expect(screen.getByText('Cargando conductores…')).toBeInTheDocument()
  expect(await screen.findByText('Ana Pérez')).toBeVisible()
  expect(screen.getByText('TST-001')).toBeVisible()
  expect(screen.getByText('—')).toBeVisible()
  expect(screen.queryByRole('button', { name: 'Registrar conductor' })).toBeNull()
  expect(request.mock.calls.some(([path]) => path === '/api/drivers/accounts')).toBe(false)
})

it('registra un conductor, evita un segundo envío y ofrece solo vehículos activos sin asignar', async () => {
  const user = userEvent.setup()
  driversApi()
  mount(<DriversView />)
  await screen.findByText('Ana Pérez')
  await user.click(screen.getByRole('button', { name: 'Registrar conductor' }))
  const vehicle = screen.getByLabelText('Vehículo asignado')
  expect(within(vehicle).queryByText('TST-001')).toBeNull()
  expect(within(vehicle).queryByText('TST-003')).toBeNull()
  await user.selectOptions(screen.getByLabelText('Cuenta de acceso'), 'u2')
  await user.selectOptions(vehicle, 'v2')
  await user.type(screen.getByLabelText('Nombre completo'), 'Luis Nuevo')
  await user.type(screen.getByLabelText('DNI'), '87654321')
  await user.type(screen.getByLabelText('Licencia'), 'LIC-2')
  let finish!: (value: unknown) => void
  const pending = new Promise(resolve => { finish = resolve })
  request.mockImplementationOnce(() => pending)
  const form = screen.getByRole('button', { name: 'Guardar conductor' }).closest('form')!
  fireEvent.submit(form)
  expect(await screen.findByRole('button', { name: 'Guardando…' })).toBeDisabled()
  const count = request.mock.calls.length
  fireEvent.submit(form)
  expect(request.mock.calls.length).toBe(count)
  await act(async () => finish({}))
  expect(await screen.findByText('Conductor registrado y vinculado a su cuenta.')).toBeVisible()
  expect(request.mock.calls.find(([, options]) => options?.method === 'POST')?.[1]?.body).toEqual({ usuario_id: 'u2', nombre_completo: 'Luis Nuevo', dni: '87654321', licencia: 'LIC-2', vehiculo_id: 'v2' })
})

it.each([new Error('No autorizado'), 'offline'])('muestra errores de registro y permite cerrar el formulario: %s', async reason => {
  driversApi([])
  const user = userEvent.setup()
  mount(<DriversView />)
  await screen.findByText('Todavía no hay conductores registrados.')
  await user.click(screen.getByRole('button', { name: 'Registrar conductor' }))
  request.mockRejectedValueOnce(reason)
  fireEvent.submit(screen.getByRole('button', { name: 'Guardar conductor' }).closest('form')!)
  expect(await screen.findByRole('alert')).toHaveTextContent(reason instanceof Error ? reason.message : 'No se pudo registrar')
  await user.click(screen.getByRole('button', { name: 'Cerrar formulario' }))
  expect(screen.queryByLabelText('DNI')).toBeNull()
})

it.each(['ACTIVO', 'INACTIVO'])('cambia el estado %s mediante PATCH y recarga el listado', async estado => {
  driversApi([{ ...active, estado }])
  const user = userEvent.setup()
  mount(<DriversView />)
  const action = await screen.findByRole('button', { name: estado === 'ACTIVO' ? 'Desactivar' : 'Activar' })
  await user.click(action)
  expect(request).toHaveBeenCalledWith(`/api/v1/drivers/d1/${estado === 'ACTIVO' ? 'deactivate' : 'activate'}`, { method: 'PATCH' })
})

it.each([new Error('Conflicto'), 'offline'])('conserva el conductor y muestra fallos al cambiar estado: %s', async reason => {
  driversApi()
  const user = userEvent.setup()
  mount(<DriversView />)
  await screen.findByText('Ana Pérez')
  request.mockRejectedValueOnce(reason)
  await user.click(screen.getByRole('button', { name: 'Desactivar' }))
  expect(await screen.findByRole('alert')).toHaveTextContent(reason instanceof Error ? 'Conflicto' : 'No se pudo guardar')
  expect(screen.getByText('Ana Pérez')).toBeVisible()
})

it.each([new Error('Sin conexión'), 'offline'])('permite reintentar una carga fallida de conductores: %s', async reason => {
  request.mockRejectedValue(reason)
  const user = userEvent.setup()
  mount(<DriversView />)
  expect(await screen.findByRole('alert')).toHaveTextContent(reason instanceof Error ? 'Sin conexión' : 'No se pudieron cargar')
  driversApi([])
  await user.click(screen.getByRole('button', { name: 'Reintentar' }))
  expect(await screen.findByText('Todavía no hay conductores registrados.')).toBeVisible()
})

it('ignora la respuesta de conductores después de desmontar la pantalla', async () => {
  let finish!: (value: unknown) => void
  request.mockReturnValue(new Promise(resolve => { finish = resolve }))
  const view = mount(<DriversView />)
  const signal = request.mock.calls[0][1]?.signal
  view.unmount()
  expect(signal?.aborted).toBe(true)
  await act(async () => finish({ items: [] }))
})

it('formatea la auditoría, oculta identificadores y actualiza registros vacíos', async () => {
  request.mockResolvedValue([{ id: 'private-id', fecha: '2026-10-30T15:00:00Z', usuario: 'Ana', detalle: { operation: 'create' }, otro: 12, estado: null }])
  const user = userEvent.setup()
  mount(<RecordsView module="auditoria" />)
  expect(screen.getByText('Cargando registros…')).toBeVisible()
  expect(await screen.findByRole('table')).toHaveTextContent('operation')
  expect(screen.queryByText('private-id')).toBeNull()
  expect(screen.getByText('—')).toBeVisible()
  expect(screen.getByText('12')).toBeVisible()
  expect(screen.getByRole('columnheader', { name: 'otro' })).toBeVisible()
  request.mockResolvedValue([{ usuario: 'Sin identificador' }])
  await user.click(screen.getByRole('button', { name: 'Actualizar' }))
  expect(await screen.findByText('Sin identificador')).toBeVisible()
  request.mockResolvedValue([])
  await user.click(screen.getByRole('button', { name: 'Actualizar' }))
  expect(await screen.findByText('Todavía no hay registros en esta sección.')).toBeVisible()
})

it.each([new Error('Sin conexión'), null])('muestra un fallo de carga de registros: %s', async reason => {
  request.mockRejectedValue(reason)
  mount(<RecordsView module="incidencias" />)
  expect(await screen.findByRole('alert')).toHaveTextContent(reason instanceof Error ? reason.message : 'No se pudo cargar')
})

it('reporta incidencias del pedido seleccionado y bloquea envíos simultáneos', async () => {
  request.mockImplementation(async path => path === '/api/conductor/ruta' ? { stops: [{ order_id: 'order-1', customer: 'Cliente' }] } : [])
  const user = userEvent.setup()
  mount(<RecordsView module="incidencias" />, 'driver')
  await screen.findByRole('option', { name: 'Cliente' })
  await user.selectOptions(screen.getByLabelText('Pedido'), 'order-1')
  await user.selectOptions(screen.getByLabelText('Tipo'), 'Tráfico')
  await user.type(screen.getByLabelText('Descripción'), 'Ruta bloqueada')
  let finish!: (value: unknown) => void
  request.mockImplementationOnce(() => new Promise(resolve => { finish = resolve }))
  const form = screen.getByRole('button', { name: 'Reportar incidencia' }).closest('form')!
  fireEvent.submit(form)
  expect(await screen.findByRole('button', { name: 'Enviando…' })).toBeDisabled()
  const count = request.mock.calls.length
  fireEvent.submit(form)
  expect(request.mock.calls.length).toBe(count)
  await act(async () => finish({ id: 'incident-1' }))
  expect(await screen.findByText('Incidencia reportada.')).toBeVisible()
  expect(screen.getByLabelText('Descripción')).toHaveValue('')
  expect(request).toHaveBeenCalledWith('/api/incidents', { method: 'POST', body: { order_id: 'order-1', type: 'Tráfico', description: 'Ruta bloqueada' } })
})

it.each([new Error('Pedido ajeno'), 'offline'])('conserva la descripción si el envío falla y tolera una ruta ausente: %s', async reason => {
  request.mockImplementation(async path => { if (path === '/api/conductor/ruta') throw new Error('Sin ruta'); return [] })
  mount(<RecordsView module="incidencias" />, 'driver')
  await screen.findByText('Todavía no hay registros en esta sección.')
  fireEvent.change(screen.getByLabelText('Descripción'), { target: { value: 'Conservar descripción' } })
  request.mockRejectedValueOnce(reason)
  fireEvent.submit(screen.getByRole('button', { name: 'Reportar incidencia' }).closest('form')!)
  expect(await screen.findByRole('alert')).toHaveTextContent(reason instanceof Error ? reason.message : 'No se pudo reportar')
  expect(screen.getByLabelText('Descripción')).toHaveValue('Conservar descripción')
})

it('cancela la carga de registros al desmontar', async () => {
  let reject!: (reason: unknown) => void
  request.mockReturnValue(new Promise((_resolve, fail) => { reject = fail }))
  const view = mount(<RecordsView module="auditoria" />)
  view.unmount()
  expect(request.mock.calls[0][1]?.signal?.aborted).toBe(true)
  await act(async () => reject(new DOMException('aborted', 'AbortError')))
  await waitFor(() => expect(screen.queryByRole('alert')).toBeNull())
})
