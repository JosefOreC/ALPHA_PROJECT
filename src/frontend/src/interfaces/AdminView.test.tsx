import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { createAdministration } from '../application/administration'
import type { AlgorithmParameters } from '../domain/algorithmSettings'
import type { AlgorithmSettings } from '../domain/ports/algorithmSettings'
import { DEFAULT_PARAMETERS, DemoAlgorithmSettings, DemoIntegrationCatalog, DemoUserDirectory, UnavailableAlgorithmSettings, UnavailableIntegrationCatalog, UnavailableUserDirectory } from '../infrastructure/demoAdmin'
import { AdminView } from './AdminView'

const setup = (settings: AlgorithmSettings = new DemoAlgorithmSettings(), demo = true) => {
  const service = createAdministration({ settings, users: new DemoUserDirectory(), integrations: new DemoIntegrationCatalog() })
  return render(<AdminView service={service} demo={demo} />)
}

const openParams = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(await screen.findByRole('tab', { name: /Parámetros del algoritmo/ }))
  await screen.findByLabelText('Tiempo máximo de cálculo en segundos')
}

describe('AdminView · usuarios y roles', () => {
  it('abre con el rol Administrador, que ve todos los módulos, y las tres pestañas', async () => {
    setup()
    expect(await screen.findByRole('heading', { name: 'Administración' })).toBeInTheDocument()
    const nav = screen.getByRole('complementary', { name: 'Navegación principal' })
    expect(within(nav).getByText('Administrador')).toBeInTheDocument()
    for (const name of [/Dashboard del día/, /Pedidos y rutas/, /Generar rutas/, /Flota/, /Sostenibilidad/, /Administración/]) {
      expect(within(nav).getByRole('link', { name })).toBeInTheDocument()
    }
    expect(within(nav).getByRole('link', { name: /Administración/ })).toHaveAttribute('aria-current', 'page')
    const tabs = screen.getByRole('tablist', { name: 'Secciones de administración' })
    expect(within(tabs).getAllByRole('tab').map((tab) => tab.textContent?.trim())).toEqual(['Usuarios y roles 19', 'Parámetros del algoritmo', 'Integraciones 3'])
    expect(screen.getByRole('tab', { name: /Usuarios y roles/ })).toHaveAttribute('aria-selected', 'true')
  })

  it('cuenta los usuarios por rol y describe qué hace cada uno', async () => {
    setup()
    const roles = await screen.findByRole('region', { name: 'Roles' })
    expect(roles).toHaveTextContent('ROL-01 Administrador1usuario')
    expect(roles).toHaveTextContent('ROL-02 Planificador3usuarios')
    expect(roles).toHaveTextContent('ROL-03 Conductor13usuarios')
    expect(roles).toHaveTextContent('ROL-04 Resp. de Logística2usuarios')
    expect(roles).toHaveTextContent('Su ruta, confirmar entregas, incidencias y alertas.')
  })

  it('lista los usuarios con su rol, estado y último acceso, y avisa que muestra 7 de 19', async () => {
    setup()
    const grid = await screen.findByRole('grid', { name: 'Usuarios' })
    const rows = within(grid).getAllByRole('row')
    expect(rows).toHaveLength(8)
    expect(within(rows[1]).getByText('Sistemas DistriRápido')).toBeInTheDocument()
    expect(within(rows[1]).getByText('SD')).toBeInTheDocument()
    expect(within(rows[1]).getByText('hoy 08:02')).toBeInTheDocument()
    expect(within(rows[7]).getByText('Inactivo')).toBeInTheDocument()
    expect(within(rows[5]).getByText('Activo')).toBeInTheDocument()
    expect(screen.getByText('Mostrando 7 de 19 usuarios.')).toBeInTheDocument()
  })

  it('busca por nombre o correo (sin tildes) y filtra por rol y estado', async () => {
    const user = userEvent.setup()
    setup()
    const grid = await screen.findByRole('grid', { name: 'Usuarios' })
    await user.type(screen.getByRole('searchbox', { name: 'Buscar usuarios' }), 'HUAMAN')
    expect(within(grid).getAllByRole('row')).toHaveLength(2)
    expect(within(grid).getByText('lhuaman@distrirapido.pe')).toBeInTheDocument()

    await user.clear(screen.getByRole('searchbox', { name: 'Buscar usuarios' }))
    await user.selectOptions(screen.getByLabelText('Rol'), 'planner')
    expect(within(screen.getByRole('grid', { name: 'Usuarios' })).getAllByRole('row')).toHaveLength(3)

    await user.selectOptions(screen.getByLabelText('Rol'), '')
    await user.selectOptions(screen.getByLabelText('Estado'), 'inactive')
    const inactive = within(screen.getByRole('grid', { name: 'Usuarios' })).getAllByRole('row')
    expect(inactive).toHaveLength(2)
    expect(within(inactive[1]).getByText('Raúl Campos')).toBeInTheDocument()

    await user.type(screen.getByRole('searchbox', { name: 'Buscar usuarios' }), 'zzz')
    expect(screen.getByText('Sin resultados.')).toBeInTheDocument()
    expect(screen.queryByRole('grid', { name: 'Usuarios' })).toBeNull()
  })

  it('las acciones sin función todavía están deshabilitadas con la razón visible', async () => {
    setup()
    await screen.findByRole('grid', { name: 'Usuarios' })
    const invite = screen.getByRole('button', { name: 'Invitar usuario' })
    expect(invite).toBeDisabled()
    expect(invite).toHaveAttribute('title', 'Próximamente')
    expect(screen.getAllByRole('button', { name: /Editar a .* \(próximamente\)/ })[0]).toBeDisabled()
  })

  it('si no hay fuente de usuarios muestra el error y permite reintentar', async () => {
    const user = userEvent.setup()
    const service = createAdministration({ settings: new DemoAlgorithmSettings(), users: new UnavailableUserDirectory(), integrations: new DemoIntegrationCatalog() })
    render(<AdminView service={service} demo={false} />)
    expect(await screen.findByRole('alert')).toHaveTextContent('aún no tiene fuente de datos')
    await user.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(await screen.findByRole('alert')).toBeInTheDocument()
    expect(screen.queryByText('Modo demo · datos ficticios')).toBeNull()
  })
})

describe('AdminView · parámetros del algoritmo', () => {
  it('muestra los valores de arranque con etiqueta visible y una pista por ajuste', async () => {
    const user = userEvent.setup()
    setup()
    await openParams(user)
    expect(screen.getByRole('slider', { name: 'Peso del CO₂ frente al tiempo' })).toHaveValue('70')
    expect(screen.getByText('70 % CO₂')).toBeInTheDocument()
    expect(screen.getByLabelText('Tiempo máximo de cálculo en segundos')).toHaveValue('45')
    expect(screen.getByLabelText('Carga máxima en porcentaje')).toHaveValue('95')
    expect(screen.getByLabelText('Holgura de ventana en minutos')).toHaveValue('10')
    expect(screen.getByRole('switch', { name: 'Reoptimización automática' })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByText('RNF-001: 150 pedidos y 15 vehículos en ≤ 45 s (P95)')).toBeInTheDocument()
    expect(screen.getByText('0 % = solo tiempo · 100 % = solo emisiones (Green VRP)')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeDisabled()
  })

  it('los factores de emisión son editables y GNV y eléctrico quedan «por definir»', async () => {
    const user = userEvent.setup()
    setup()
    await openParams(user)
    expect(screen.getByLabelText('Diésel')).toHaveValue('2,68')
    expect(screen.getByLabelText('Gasolina')).toHaveValue('2,31')
    for (const name of ['GNV', 'Eléctrico', 'GLP', 'Híbrido']) {
      const input = screen.getByLabelText(name)
      expect(input).toHaveValue('')
      expect(input).toHaveAttribute('placeholder', 'por definir')
    }
    expect(screen.getByText('kg/m³')).toBeInTheDocument()
    expect(screen.getByText('kg/kWh')).toBeInTheDocument()
    expect(screen.getByText(/Un factor sin definir no se usa/)).toBeInTheDocument()
  })

  it('editar habilita Guardar; guardar usa el puerto y confirma; descartar vuelve a lo guardado', async () => {
    const user = userEvent.setup()
    const save = vi.fn(async (value: AlgorithmParameters) => value)
    setup({ load: async () => structuredClone(DEFAULT_PARAMETERS), save })
    await openParams(user)

    const seconds = screen.getByLabelText('Tiempo máximo de cálculo en segundos')
    await user.clear(seconds)
    await user.type(seconds, '30')
    await user.type(screen.getByLabelText('GNV'), '1,95')
    await user.click(screen.getByRole('switch', { name: 'Reoptimización automática' }))
    expect(screen.getByRole('button', { name: 'Descartar cambios' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    expect(await screen.findByText(/Parámetros guardados/)).toBeInTheDocument()
    expect(save).toHaveBeenCalledTimes(1)
    expect(save.mock.calls[0][0]).toMatchObject({ maxSeconds: 30, autoReoptimize: false, co2Weight: 70 })
    expect(save.mock.calls[0][0].emissionFactors).toMatchObject({ GNV: 1.95, DIESEL: 2.68, ELECTRICO: null })
    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeDisabled()
    expect(screen.queryByRole('button', { name: 'Descartar cambios' })).toBeNull()

    await user.clear(screen.getByLabelText('Carga máxima en porcentaje'))
    await user.type(screen.getByLabelText('Carga máxima en porcentaje'), '80')
    await user.click(screen.getByRole('button', { name: 'Descartar cambios' }))
    expect(screen.getByLabelText('Carga máxima en porcentaje')).toHaveValue('95')
    expect(save).toHaveBeenCalledTimes(1)
  })

  it('un cambio de peso con el control deslizante se refleja en el valor y se guarda', async () => {
    const user = userEvent.setup()
    const save = vi.fn(async (value: AlgorithmParameters) => value)
    setup({ load: async () => structuredClone(DEFAULT_PARAMETERS), save })
    await openParams(user)

    const slider = screen.getByRole('slider', { name: 'Peso del CO₂ frente al tiempo' })
    fireEvent.change(slider, { target: { value: '72' } })
    expect(screen.getByText('72 % CO₂')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    await waitFor(() => expect(save).toHaveBeenCalled())
    expect(save.mock.calls[0][0].co2Weight).toBe(72)
  })

  it('los valores inválidos se señalan en el campo, con su pista en rojo, y bloquean Guardar', async () => {
    const user = userEvent.setup()
    const save = vi.fn()
    setup({ load: async () => structuredClone(DEFAULT_PARAMETERS), save })
    await openParams(user)

    const seconds = screen.getByLabelText('Tiempo máximo de cálculo en segundos')
    await user.clear(seconds)
    await user.type(seconds, '500')
    expect(seconds).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByText('Indica un entero de 5 a 120 segundos.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeDisabled()

    await user.clear(seconds)
    expect(seconds).toHaveAttribute('aria-invalid', 'true')

    await user.clear(seconds)
    await user.type(seconds, '45')
    await user.type(screen.getByLabelText('GNV'), '-3')
    expect(screen.getByLabelText('GNV')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByText(/El factor debe ser mayor que 0/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeDisabled()
    expect(save).not.toHaveBeenCalled()
  })

  it('si guardar falla muestra el error y conserva lo escrito', async () => {
    const user = userEvent.setup()
    setup({ load: async () => structuredClone(DEFAULT_PARAMETERS), save: async () => { throw new Error('Sin conexión con el servidor.') } })
    await openParams(user)

    await user.clear(screen.getByLabelText('Holgura de ventana en minutos'))
    await user.type(screen.getByLabelText('Holgura de ventana en minutos'), '15')
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Sin conexión con el servidor.')
    expect(screen.getByLabelText('Holgura de ventana en minutos')).toHaveValue('15')
    expect(screen.queryByText(/Parámetros guardados/)).toBeNull()
  })

  it('sin almacenamiento en la API no deja editar y permite reintentar', async () => {
    const user = userEvent.setup()
    setup(new UnavailableAlgorithmSettings(), false)
    await user.click(await screen.findByRole('tab', { name: /Parámetros del algoritmo/ }))
    expect(await screen.findByRole('alert')).toHaveTextContent('aún no tienen almacenamiento')
    expect(screen.queryByLabelText('Tiempo máximo de cálculo en segundos')).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(await screen.findByRole('alert')).toBeInTheDocument()
  })
})

describe('AdminView · integraciones', () => {
  it('lista cada servicio con su estado en palabras', async () => {
    const user = userEvent.setup()
    setup()
    await user.click(await screen.findByRole('tab', { name: /Integraciones/ }))
    const grid = await screen.findByRole('grid', { name: 'Integraciones' })
    const rows = within(grid).getAllByRole('row')
    expect(rows).toHaveLength(4)
    expect(within(rows[1]).getByText('Mapas · OpenStreetMap + Leaflet')).toBeInTheDocument()
    expect(within(rows[1]).getByText('Conectado')).toBeInTheDocument()
    expect(within(rows[3]).getByText('Tráfico en tiempo real')).toBeInTheDocument()
    expect(within(rows[3]).getByText('Pendiente')).toBeInTheDocument()
    expect(within(rows[3]).getByRole('button', { name: 'Conectar' })).toBeDisabled()
    expect(within(rows[1]).getByRole('button', { name: 'Configurar' })).toBeDisabled()
  })

  it('sin fuente de datos muestra el error', async () => {
    const user = userEvent.setup()
    const service = createAdministration({ settings: new DemoAlgorithmSettings(), users: new DemoUserDirectory(), integrations: new UnavailableIntegrationCatalog() })
    render(<AdminView service={service} demo />)
    await user.click(await screen.findByRole('tab', { name: /Integraciones/ }))
    expect(await screen.findByRole('alert')).toHaveTextContent('estado de las integraciones')
  })
})
