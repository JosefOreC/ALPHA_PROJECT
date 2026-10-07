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

// Sin backend: el servicio cae al respaldo local con 4 vehículos de ejemplo.
beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('sin red') }))
})
afterEach(() => vi.unstubAllGlobals())

const setup = () => render(<FleetView />)

describe('FleetView', () => {
  it('abre con el rol Planificador, el resumen y los conteos por estado', async () => {
    setup()
    expect(await screen.findByRole('tab', { name: /Todos/ })).toHaveTextContent('4')
    expect(screen.getByText('Planificador')).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Resumen de la flota' })).toHaveTextContent('4de 4')
    expect(screen.getByRole('region', { name: 'Resumen de la flota' })).toHaveTextContent('50 %')
    expect(screen.getByText('Modo local · sin conexión al servidor')).toBeInTheDocument()
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
