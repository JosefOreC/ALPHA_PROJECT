import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, expect, it, vi } from 'vitest'
import { requestJson } from '../../infrastructure/httpClient'
import { AddToRoute } from './AddToRoute'

vi.mock('../../infrastructure/httpClient', () => ({ requestJson: vi.fn() }))
const request = vi.mocked(requestJson)
const route = { id: 'route/1', driver: 'Ana', plate: 'ABC-123' }
const load = () => fireEvent.click(screen.getByRole('button', { name: 'Agregar a ruta existente' }))
const assign = () => fireEvent.click(screen.getByRole('button', { name: 'Agregar pedido' }))
beforeEach(() => request.mockReset())

it('espera las rutas, exige una selección y evita un segundo guardado mientras se asigna', async () => {
  let completeList!: (routes: typeof route[]) => void
  request.mockImplementationOnce(() => new Promise(resolve => { completeList = resolve }))
  const onAssigned = vi.fn()
  render(<AddToRoute orderId="order-1" onAssigned={onAssigned} />)
  load()
  expect(screen.getByRole('button', { name: 'Buscando rutas…' })).toBeDisabled()
  await act(async () => completeList([route]))
  expect(screen.getByRole('button', { name: 'Agregar pedido' })).toBeDisabled()
  fireEvent.change(screen.getByRole('combobox'), { target: { value: route.id } })
  let complete!: () => void
  request.mockImplementationOnce(() => new Promise<void>(resolve => { complete = resolve }))
  assign()
  expect(screen.getByRole('combobox')).toBeDisabled()
  const saving = screen.getByRole('button', { name: 'Guardando…' })
  expect(saving).toBeDisabled()
  fireEvent.click(saving)
  expect(request).toHaveBeenCalledTimes(2)
  expect(request).toHaveBeenLastCalledWith('/api/routes/route%2F1/orders', { method: 'POST', body: { order_id: 'order-1' } })
  await act(async () => complete())
  expect(onAssigned).toHaveBeenCalledOnce()
})

it.each([new Error('Sin permiso'), 'offline'])('permite reintentar la consulta si falla: %s', async failure => {
  request.mockRejectedValueOnce(failure).mockResolvedValueOnce([])
  render(<AddToRoute orderId="order-1" onAssigned={vi.fn()} />)
  load()
  expect(await screen.findByRole('alert')).toHaveTextContent(failure instanceof Error ? failure.message : 'No se pudieron consultar las rutas.')
  load()
  expect(await screen.findByRole('status')).toHaveTextContent('Todavía no hay rutas activas para hoy.')
  fireEvent.click(screen.getByRole('button', { name: 'Cerrar selector' }))
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Agregar a ruta existente' })).toBeEnabled()
})

it.each([new Error('Ruta completa'), 'offline'])('conserva la selección cuando se rechaza la asignación: %s', async failure => {
  request.mockResolvedValueOnce([route]).mockRejectedValueOnce(failure)
  const onAssigned = vi.fn()
  render(<AddToRoute orderId="order-1" onAssigned={onAssigned} />)
  load()
  fireEvent.change(await screen.findByRole('combobox'), { target: { value: route.id } })
  assign()
  expect(await screen.findByRole('alert')).toHaveTextContent(failure instanceof Error ? failure.message : 'No se pudo agregar el pedido.')
  expect(screen.getByRole('combobox')).toHaveValue(route.id)
  expect(onAssigned).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: 'Cerrar selector' }))
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})
