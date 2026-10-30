import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SessionContext } from './session/SessionState'
import type { SessionState } from './session/SessionState'
import { DriversView } from './DriversView'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { requestJsonMock, canMock } = vi.hoisted(() => ({
  requestJsonMock: vi.fn(),
  canMock: vi.fn(),
}))

vi.mock('../infrastructure/httpClient', () => ({
  requestJson: requestJsonMock,
}))

vi.mock('../domain/accessControl', () => ({
  can: canMock,
}))

const drivers = [
  {
    conductor_id: 'driver-1',
    nombre_completo: 'Juan Pérez',
    dni: '12345678',
    licencia: 'A-IIb',
    vehiculo_id: 'vehicle-1',
    estado: 'ACTIVO',
  },
  {
    conductor_id: 'driver-2',
    nombre_completo: 'María López',
    dni: '87654321',
    licencia: 'A-IIIa',
    vehiculo_id: 'vehicle-2',
    estado: 'INACTIVO',
  },
]

const vehicles = {
  total: 3,
  vehiculos: [
    {
      vehiculo_id: 'vehicle-1',
      placa: 'ABC-123',
      capacidad_kg: 1000,
      tipo_combustible: 'DIESEL',
      estado: 'EN_RUTA',
      disponible: false,
      activo: true,
      creado_en: '2026-01-01T00:00:00Z',
    },
    {
      vehiculo_id: 'vehicle-2',
      placa: 'DEF-456',
      capacidad_kg: 1500,
      tipo_combustible: 'GASOLINA',
      estado: 'DISPONIBLE',
      disponible: true,
      activo: true,
      creado_en: '2026-01-01T00:00:00Z',
    },
    {
      vehiculo_id: 'vehicle-3',
      placa: 'GHI-789',
      capacidad_kg: 2000,
      tipo_combustible: 'GNV',
      estado: 'DISPONIBLE',
      disponible: true,
      activo: true,
      creado_en: '2026-01-01T00:00:00Z',
    },
  ],
}

const accounts = [
  { id: 'account-1', name: 'Carlos Ramírez' },
  { id: 'account-2', name: 'Ana Torres' },
]

function makeSession(): SessionState {
  return {
    user: {
      id: 'user-1',
      name: 'Administrador',
      email: 'admin@example.com',
      role: 'admin',
    } as unknown as NonNullable<SessionState['user']>,
    loading: false,
    error: '',
    login: vi.fn(),
    logout: vi.fn(),
    retry: vi.fn(),
  }
}

function setup(options?: {
  writable?: boolean
  updatable?: boolean
}) {
  const writable = options?.writable ?? true
  const updatable = options?.updatable ?? true

  canMock.mockImplementation((_role: string, permission: string) => {
    if (permission === 'drivers.create') return writable
    if (permission === 'drivers.update') return updatable
    return false
  })

  requestJsonMock.mockImplementation((url: string) => {
    if (url === '/api/v1/drivers') {
      return Promise.resolve({ items: drivers })
    }

    if (url === '/api/v1/vehicles') {
      return Promise.resolve(vehicles)
    }

    if (url === '/api/drivers/accounts') {
      return Promise.resolve(accounts)
    }

    return Promise.resolve({})
  })

  const session = makeSession()

  return render(
    <SessionContext.Provider value={session}>
      <DriversView />
    </SessionContext.Provider>,
  )
}

describe('DriversView: gestión de conductores', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('muestra el estado de carga inicialmente', () => {
    requestJsonMock.mockReturnValue(new Promise(() => {}))
    canMock.mockReturnValue(true)

    render(
      <SessionContext.Provider value={makeSession()}>
        <DriversView />
      </SessionContext.Provider>,
    )

    expect(screen.getByRole('status')).toHaveTextContent(
      'Cargando conductores',
    )
  })

  it('carga los conductores, sus vehículos y sus estados', async () => {
    setup()

    expect(await screen.findByText('Juan Pérez')).toBeInTheDocument()
    expect(screen.getByText('María López')).toBeInTheDocument()
    expect(screen.getByText('ABC-123')).toBeInTheDocument()
    expect(screen.getByText('Activo')).toBeInTheDocument()
    expect(screen.getByText('Inactivo')).toBeInTheDocument()

    expect(requestJsonMock).toHaveBeenCalledWith(
      '/api/v1/drivers',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    )
  })

  it('muestra un guion cuando no encuentra la placa del vehículo', async () => {
    requestJsonMock.mockImplementation((url: string) => {
      if (url === '/api/v1/drivers') {
        return Promise.resolve({
          items: [{ ...drivers[0], vehiculo_id: 'vehicle-unknown' }],
        })
      }

      if (url === '/api/v1/vehicles') return Promise.resolve(vehicles)
      if (url === '/api/drivers/accounts') return Promise.resolve(accounts)

      return Promise.resolve({})
    })

    canMock.mockReturnValue(true)

    render(
      <SessionContext.Provider value={makeSession()}>
        <DriversView />
      </SessionContext.Provider>,
    )

    const row = await screen.findByRole('row', { name: /Juan Pérez/ })
    expect(within(row).getByText('—')).toBeInTheDocument()
  })

  it('muestra el mensaje cuando no hay conductores', async () => {
    requestJsonMock.mockImplementation((url: string) => {
      if (url === '/api/v1/drivers') return Promise.resolve({ items: [] })
      if (url === '/api/v1/vehicles') return Promise.resolve(vehicles)
      if (url === '/api/drivers/accounts') return Promise.resolve(accounts)
      return Promise.resolve({})
    })

    canMock.mockReturnValue(true)

    render(
      <SessionContext.Provider value={makeSession()}>
        <DriversView />
      </SessionContext.Provider>,
    )

    expect(await screen.findByText('Sin conductores')).toBeInTheDocument()
    expect(
      screen.getByText('Todavía no hay conductores registrados.'),
    ).toBeInTheDocument()
  })

  it('muestra un error si falla la carga y permite reintentar', async () => {
    const user = userEvent.setup()

    requestJsonMock.mockRejectedValueOnce(new Error('Error de conexión'))
    requestJsonMock.mockImplementation((url: string) => {
      if (url === '/api/v1/drivers') return Promise.resolve({ items: drivers })
      if (url === '/api/v1/vehicles') return Promise.resolve(vehicles)
      if (url === '/api/drivers/accounts') return Promise.resolve(accounts)
      return Promise.resolve({})
    })

    canMock.mockReturnValue(true)

    render(
      <SessionContext.Provider value={makeSession()}>
        <DriversView />
      </SessionContext.Provider>,
    )

    expect(await screen.findByText('Error de conexión')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Reintentar' }))

    expect(await screen.findByText('Juan Pérez')).toBeInTheDocument()
  })

  it('no solicita cuentas ni muestra acciones de edición sin permisos', async () => {
    setup({ writable: false, updatable: false })

    expect(await screen.findByText('Juan Pérez')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Registrar conductor' }),
    ).not.toBeInTheDocument()

    expect(screen.queryByRole('button', { name: 'Editar' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Desactivar' })).not.toBeInTheDocument()

    expect(requestJsonMock).not.toHaveBeenCalledWith(
      '/api/drivers/accounts',
      expect.anything(),
    )
  })

  it('abre y cancela el formulario de registro', async () => {
    const user = userEvent.setup()
    setup()

    await user.click(
      await screen.findByRole('button', { name: 'Registrar conductor' }),
    )

    expect(screen.getByRole('heading', { name: 'Registrar conductor' })).toBeInTheDocument()
    expect(screen.getByLabelText('Cuenta de acceso')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(
      screen.queryByRole('heading', { name: 'Registrar conductor' }),
    ).not.toBeInTheDocument()
  })

  it('registra un conductor y envía los datos al backend', async () => {
    const user = userEvent.setup()
    setup()

    await user.click(
      await screen.findByRole('button', { name: 'Registrar conductor' }),
    )

    await user.selectOptions(screen.getByLabelText('Cuenta de acceso'), 'account-1')
    await user.type(screen.getByLabelText('Nombre completo'), 'Pedro Ramírez')
    await user.type(screen.getByLabelText('DNI'), '11223344')
    await user.type(screen.getByLabelText('Licencia'), 'A-IIb')
    await user.selectOptions(screen.getByLabelText('Vehículo asignado'), 'vehicle-3')

    await user.click(screen.getByRole('button', { name: 'Guardar conductor' }))

    await waitFor(() => {
      expect(requestJsonMock).toHaveBeenCalledWith('/api/v1/drivers', {
        method: 'POST',
        body: {
          usuario_id: 'account-1',
          nombre_completo: 'Pedro Ramírez',
          dni: '11223344',
          licencia: 'A-IIb',
          vehiculo_id: 'vehicle-3',
        },
      })
    })

    expect(
      await screen.findByText('Conductor registrado y vinculado a su cuenta.'),
    ).toBeInTheDocument()
  })

  it('muestra el error si falla el registro', async () => {
    const user = userEvent.setup()
    setup()

    requestJsonMock.mockImplementation((url: string, options?: { method?: string }) => {
      if (url === '/api/v1/drivers' && options?.method === 'POST') {
        return Promise.reject(new Error('No se pudo registrar'))
      }

      if (url === '/api/v1/drivers') return Promise.resolve({ items: drivers })
      if (url === '/api/v1/vehicles') return Promise.resolve(vehicles)
      if (url === '/api/drivers/accounts') return Promise.resolve(accounts)

      return Promise.resolve({})
    })

    await user.click(
      await screen.findByRole('button', { name: 'Registrar conductor' }),
    )

    await user.selectOptions(screen.getByLabelText('Cuenta de acceso'), 'account-1')
    await user.type(screen.getByLabelText('Nombre completo'), 'Pedro Ramírez')
    await user.type(screen.getByLabelText('DNI'), '11223344')
    await user.type(screen.getByLabelText('Licencia'), 'A-IIb')
    await user.selectOptions(screen.getByLabelText('Vehículo asignado'), 'vehicle-3')
    await user.click(screen.getByRole('button', { name: 'Guardar conductor' }))

    expect(await screen.findByText('No se pudo registrar')).toBeInTheDocument()
  })

  it('abre el formulario de edición con los datos existentes', async () => {
    const user = userEvent.setup()
    setup()

    const row = await screen.findByRole('row', { name: /Juan Pérez/ })
    await user.click(within(row).getByRole('button', { name: 'Editar' }))

    expect(screen.getByRole('heading', { name: 'Editar conductor' })).toBeInTheDocument()
    expect(screen.getByLabelText('Nombre completo')).toHaveValue('Juan Pérez')
    expect(screen.getByLabelText('DNI')).toHaveValue('12345678')
    expect(screen.getByLabelText('Licencia')).toHaveValue('A-IIb')
    expect(screen.getByLabelText('Vehículo asignado')).toHaveValue('vehicle-1')
  })

  it('actualiza un conductor y conserva su estado', async () => {
    const user = userEvent.setup()
    setup()

    const row = await screen.findByRole('row', { name: /Juan Pérez/ })
    await user.click(within(row).getByRole('button', { name: 'Editar' }))

    const nameInput = screen.getByLabelText('Nombre completo')
    await user.clear(nameInput)
    await user.type(nameInput, 'Juan Pérez Actualizado')

    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    await waitFor(() => {
      expect(requestJsonMock).toHaveBeenCalledWith(
        '/api/v1/drivers/driver-1',
        {
          method: 'PUT',
          body: {
            nombre_completo: 'Juan Pérez Actualizado',
            dni: '12345678',
            licencia: 'A-IIb',
            vehiculo_id: 'vehicle-1',
            estado: 'ACTIVO',
          },
        },
      )
    })

    expect(
      await screen.findByText('Conductor actualizado correctamente.'),
    ).toBeInTheDocument()
  })

  it('muestra el error cuando falla la edición', async () => {
    const user = userEvent.setup()
    setup()

    requestJsonMock.mockImplementation((url: string, options?: { method?: string }) => {
      if (url === '/api/v1/drivers/driver-1' && options?.method === 'PUT') {
        return Promise.reject(new Error('No se pudo actualizar'))
      }

      if (url === '/api/v1/drivers') return Promise.resolve({ items: drivers })
      if (url === '/api/v1/vehicles') return Promise.resolve(vehicles)
      if (url === '/api/drivers/accounts') return Promise.resolve(accounts)

      return Promise.resolve({})
    })

    const row = await screen.findByRole('row', { name: /Juan Pérez/ })
    await user.click(within(row).getByRole('button', { name: 'Editar' }))
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    expect(await screen.findByText('No se pudo actualizar')).toBeInTheDocument()
  })

  it('desactiva un conductor activo', async () => {
    const user = userEvent.setup()
    setup()

    const row = await screen.findByRole('row', { name: /Juan Pérez/ })
    await user.click(within(row).getByRole('button', { name: 'Desactivar' }))

    await waitFor(() => {
      expect(requestJsonMock).toHaveBeenCalledWith(
        '/api/v1/drivers/driver-1/deactivate',
        { method: 'PATCH' },
      )
    })

    expect(
      await screen.findByText('Conductor desactivado correctamente.'),
    ).toBeInTheDocument()
  })

  it('activa un conductor inactivo', async () => {
    const user = userEvent.setup()
    setup()

    const row = await screen.findByRole('row', { name: /María López/ })
    await user.click(within(row).getByRole('button', { name: 'Activar' }))

    await waitFor(() => {
      expect(requestJsonMock).toHaveBeenCalledWith(
        '/api/v1/drivers/driver-2/activate',
        { method: 'PATCH' },
      )
    })

    expect(
      await screen.findByText('Conductor activado correctamente.'),
    ).toBeInTheDocument()
  })

  it('muestra el error cuando falla el cambio de estado', async () => {
    const user = userEvent.setup()
    setup()

    requestJsonMock.mockImplementation((url: string, options?: { method?: string }) => {
      if (url.endsWith('/deactivate') && options?.method === 'PATCH') {
        return Promise.reject(new Error('No se pudo cambiar el estado'))
      }

      if (url === '/api/v1/drivers') return Promise.resolve({ items: drivers })
      if (url === '/api/v1/vehicles') return Promise.resolve(vehicles)
      if (url === '/api/drivers/accounts') return Promise.resolve(accounts)

      return Promise.resolve({})
    })

    const row = await screen.findByRole('row', { name: /Juan Pérez/ })
    await user.click(within(row).getByRole('button', { name: 'Desactivar' }))

    expect(await screen.findByText('No se pudo cambiar el estado')).toBeInTheDocument()
  })

  it('muestra el error genérico si el backend rechaza la carga con un valor no Error', async () => {
    requestJsonMock.mockRejectedValue('fallo inesperado')
    canMock.mockReturnValue(true)

    render(
      <SessionContext.Provider value={makeSession()}>
        <DriversView />
      </SessionContext.Provider>,
    )

    expect(
      await screen.findByText('No se pudieron cargar los conductores.'),
    ).toBeInTheDocument()
  })
})