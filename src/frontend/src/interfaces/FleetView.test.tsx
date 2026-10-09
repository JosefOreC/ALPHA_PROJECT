import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { FleetView } from './FleetView'

// jsdom no implementa <dialog>.showModal(); basta con reflejar el atributo open.
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute('open', '')
  }
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.removeAttribute('open')
    this.dispatchEvent(new Event('close'))
  }
})

// API controlada: todas las operaciones pasan por HTTP; no existe respaldo local.
beforeEach(() => {
  let vehicles = [
    { placa: 'ABC-101', capacidad_kg: 1500, tipo_combustible: 'DIESEL', estado: 'DISPONIBLE' },
    { placa: 'XYZ-202', capacidad_kg: 2200, tipo_combustible: 'GNV', estado: 'DISPONIBLE' },
    { placa: 'ECO-303', capacidad_kg: 800, tipo_combustible: 'ELECTRICO', estado: 'EN_RUTA' },
    { placa: 'MNT-404', capacidad_kg: 3000, tipo_combustible: 'DIESEL', estado: 'MANTENIMIENTO' },
  ].map((item, index) => ({ ...item, vehiculo_id: `v-${index}`, capacidad_m3: 8, disponible: item.estado === 'DISPONIBLE', activo: true, creado_en: '2026-10-09T10:00:00Z' }))
  vi.stubGlobal('fetch', vi.fn(async (url: string, options?: RequestInit) => {
    if (!options?.method || options.method === 'GET') return Response.json({ total: vehicles.length, vehiculos: vehicles, mensaje: null })
    const input = JSON.parse(String(options.body))
    if (options.method === 'POST') {
      if (vehicles.some(vehicle => vehicle.placa === input.placa)) return Response.json({ detail: 'La placa ingresada ya se encuentra registrada en el sistema' }, { status: 409 })
      const item = { ...input, vehiculo_id: 'nuevo', creado_en: '2026-10-09T10:00:00Z', disponible: true, activo: true }
      vehicles.push(item)
      return Response.json(item, { status: 201 })
    }
    const id = url.split('/').at(-1)
    const item = vehicles.find(vehicle => vehicle.vehiculo_id === id)!
    const updated = { ...item, ...input, activo: (input.estado ?? item.estado) !== 'INACTIVO', disponible: (input.estado ?? item.estado) === 'DISPONIBLE' }
    vehicles = vehicles.map(vehicle => vehicle.vehiculo_id === id ? updated : vehicle)
    return Response.json(updated)
  }))
})
afterEach(() => vi.unstubAllGlobals())

const setup = () => render(<FleetView />)

describe('FleetView', () => {
  it('un error de conexión nunca muestra vehículos de ejemplo', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    setup()
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo conectar con el servidor.')
    expect(screen.queryByText('ABC-101')).toBeNull()
    expect(screen.queryByText('Modo local · sin conexión al servidor')).toBeNull()
  })
  it('abre con el rol Planificador, el resumen y los conteos por estado', async () => {
    setup()
    expect(await screen.findByRole('tab', { name: /Todos/ })).toHaveTextContent('4')
    expect(screen.getByText('Planificador')).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Resumen de la flota' })).toHaveTextContent('4de 4')
    expect(screen.getByRole('region', { name: 'Resumen de la flota' })).toHaveTextContent('50 %')
    expect(screen.queryByText('Modo local · sin conexión al servidor')).toBeNull()
    expect(screen.getByRole('tab', { name: /En ruta/ })).toHaveTextContent('1')
    expect(screen.getByRole('tab', { name: /Disponibles/ })).toHaveTextContent('2')
  })

  it('las pestañas y el buscador filtran sin perder los conteos', async () => {
    const user = userEvent.setup()
    setup()
    await screen.findByText('ABC-101')
    await user.click(screen.getByRole('tab', { name: /En ruta/ }))
    expect(screen.getByText('ECO-303')).toBeInTheDocument()
    expect(screen.queryByText('ABC-101')).toBeNull()
    expect(screen.getByRole('tab', { name: /Disponibles/ })).toHaveTextContent('2')
    await user.click(screen.getByRole('tab', { name: /Todos/ }))
    await user.type(screen.getByRole('searchbox', { name: 'Buscar vehículos' }), 'electrico')
    expect(screen.getByText('ECO-303')).toBeInTheDocument()
    expect(screen.queryByText('XYZ-202')).toBeNull()
    await user.clear(screen.getByRole('searchbox', { name: 'Buscar vehículos' }))
    await user.type(screen.getByRole('searchbox', { name: 'Buscar vehículos' }), 'zzz')
    expect(screen.getByText('No se encontraron vehículos.')).toBeInTheDocument()
  })

  it('marca con etiqueta eco los combustibles de bajas emisiones', async () => {
    setup()
    await screen.findByText('XYZ-202')
    expect(screen.getByText('GNV')).toHaveClass('eco-tag--eco')
    expect(screen.getByText('Eléctrico')).toHaveClass('eco-tag--eco')
    expect(screen.getAllByText('Diésel')[0]).not.toHaveClass('eco-tag--eco')
  })

  it('el diálogo valida con mensajes visibles y no envía datos inválidos', async () => {
    const user = userEvent.setup()
    setup()
    await screen.findByText('ABC-101')
    await user.click(screen.getByRole('button', { name: 'Registrar vehículo' }))
    const dialog = screen.getByRole('dialog', { name: 'Registrar vehículo' })
    await user.click(within(dialog).getByRole('button', { name: 'Guardar vehículo' }))
    expect(within(dialog).getByText('La placa es obligatoria.')).toBeVisible()
    expect(within(dialog).getByText('La capacidad debe ser un número mayor a 0 kg.')).toBeVisible()
    expect(within(dialog).getByLabelText('Placa *')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.queryByText(/registrado en la flota activa/)).toBeNull()
  })

  it('registra un vehículo nuevo y rechaza una placa duplicada', async () => {
    const user = userEvent.setup()
    setup()
    await screen.findByText('ABC-101')
    await user.click(screen.getByRole('button', { name: 'Registrar vehículo' }))
    let dialog = screen.getByRole('dialog', { name: 'Registrar vehículo' })
    await user.type(within(dialog).getByLabelText('Placa *'), 'abc-101')
    await user.type(within(dialog).getByLabelText('Capacidad (kg) *'), '900')
    await user.click(within(dialog).getByRole('button', { name: 'Guardar vehículo' }))
    expect(await within(dialog).findByRole('alert')).toHaveTextContent('La placa ingresada ya se encuentra registrada')

    await user.clear(within(dialog).getByLabelText('Placa *'))
    await user.type(within(dialog).getByLabelText('Placa *'), 'DEF-321')
    await user.click(within(dialog).getByRole('button', { name: 'Guardar vehículo' }))
    expect(await screen.findByText('Vehículo DEF-321 registrado en la flota activa.')).toBeInTheDocument()
    expect(await screen.findByText('DEF-321')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Todos/ })).toHaveTextContent('5')
    dialog = screen.getByRole('dialog', { hidden: true })
    expect(dialog).not.toHaveAttribute('open')
  })

  it('cambia el estado desde la fila y actualiza los conteos', async () => {
    const user = userEvent.setup()
    setup()
    await screen.findByText('MNT-404')
    await user.selectOptions(screen.getByLabelText('Cambiar estado de MNT-404'), 'INACTIVO')
    expect(await screen.findByText('Estado de MNT-404 actualizado a Inactivo.')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Inactivos/ })).toHaveTextContent('1')
  })

  it('edita un vehículo precargando sus datos', async () => {
    const user = userEvent.setup()
    setup()
    await screen.findByText('XYZ-202')
    await user.click(screen.getByRole('button', { name: 'Editar vehículo XYZ-202' }))
    const dialog = screen.getByRole('dialog', { name: 'Editar vehículo XYZ-202' })
    expect(within(dialog).getByLabelText('Placa *')).toHaveValue('XYZ-202')
    expect(within(dialog).getByLabelText('Capacidad (kg) *')).toHaveValue(2200)
    await user.clear(within(dialog).getByLabelText('Capacidad (kg) *'))
    await user.type(within(dialog).getByLabelText('Capacidad (kg) *'), '2500')
    await user.click(within(dialog).getByRole('button', { name: 'Guardar cambios' }))
    expect(await screen.findByText('Vehículo XYZ-202 actualizado correctamente.')).toBeInTheDocument()
    expect(await screen.findByText(/2 500 kg/)).toBeInTheDocument()
  })
})
