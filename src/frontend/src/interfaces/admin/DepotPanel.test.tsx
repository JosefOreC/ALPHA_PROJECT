import { act, fireEvent, render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { DepotPanel } from './DepotPanel'

const depot = { id: 'a1', name: 'Almacén central', address: 'Dirección de prueba', latitude: -12, longitude: -77 }
const service = () => ({ load: vi.fn().mockResolvedValue(depot), save: vi.fn().mockResolvedValue(depot) })
it('permite configurar el origen y confirma el guardado', async () => {
  const api = service()
  render(<DepotPanel service={api} />)
  expect(screen.getByRole('status')).toHaveTextContent('Consultando')
  fireEvent.change(await screen.findByLabelText('Latitud'), { target: { value: '-12.1' } })
  fireEvent.submit(screen.getByText('Guardar almacén').closest('form')!)
  expect(await screen.findByRole('status')).toHaveTextContent('Almacén guardado')
  expect(api.save).toHaveBeenCalledWith({ name: depot.name, address: depot.address, latitude: -12.1, longitude: -77 })
})
it('ofrece un formulario inicial cuando aún no hay almacén', async () => {
  const api = service(); api.load.mockResolvedValue(null)
  render(<DepotPanel service={api} />)
  expect(await screen.findByLabelText('Nombre')).toHaveValue('')
})
it('conserva el formulario al fallar y recupera la consulta al reintentar', async () => {
  const api = service(); api.load.mockRejectedValueOnce(new Error('Consulta fallida'))
  render(<DepotPanel service={api} />)
  expect(await screen.findByRole('alert')).toHaveTextContent('Consulta fallida')
  fireEvent.click(screen.getByText('Reintentar consulta'))
  expect(await screen.findByDisplayValue(depot.name)).toBeVisible()
  api.save.mockRejectedValueOnce(new Error('Guardado fallido'))
  fireEvent.submit(screen.getByText('Guardar almacén').closest('form')!)
  expect(await screen.findByRole('alert')).toHaveTextContent('Guardado fallido')
  expect(screen.getByLabelText('Nombre')).toHaveValue(depot.name)
})
it('evita un segundo guardado y cancela la consulta al desmontarse', async () => {
  const api = service()
  let finish!: (value: unknown) => void
  api.save.mockImplementationOnce(() => new Promise(resolve => { finish = resolve }))
  const view = render(<DepotPanel service={api} />)
  const form = (await screen.findByText('Guardar almacén')).closest('form')!
  fireEvent.submit(form); fireEvent.submit(form)
  expect(api.save).toHaveBeenCalledOnce()
  expect(screen.getByText('Guardando…')).toBeDisabled()
  await act(async () => finish(depot))
  const signal = api.load.mock.calls[0][0] as AbortSignal
  view.unmount(); expect(signal.aborted).toBe(true)
})
