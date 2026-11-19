import { act, fireEvent, render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import type { RouteProposal } from '../domain/routePlan'
import { DEFAULT_ROUTE_SETTINGS } from '../domain/routePlan'
import type { MapDataSource } from '../domain/ports/mapDataSource'
import { RoutePlanningView } from './RoutePlanningView'

const maps = vi.hoisted(() => ({ sources: [] as MapDataSource[] }))
vi.mock('./map/RouteMap', () => ({ RouteMap: ({ source }: { source: MapDataSource }) => {
  maps.sources.push(source)
  return <p>Mapa conectado</p>
} }))

const proposal: RouteProposal = {
  routeCount:1,ordersAssigned:1,totalKm:3,kmSaved:0,co2Kg:2,co2SavedPercent:0,
  windowCompliance:100,windowTarget:90,elapsedSeconds:0.1,fingerprint:'a'.repeat(64),
  routes:[{ plate:'TST-001',driver:'Ana',zone:'Ate',fuel:'DIESEL',stops:1,km:3,load:0.1,co2Kg:2 }],
  mapData:{ depot:null,orders:[],vehicles:[],routes:[{ id:'proposal:TST-001',plate:'TST-001',color:1,done_until:0,
    path:[{lat:-12.03,lng:-76.96},{lat:-12.04,lng:-76.95},{lat:-12.03,lng:-76.96}] }] },
}
const api = () => ({
  scope:vi.fn().mockResolvedValue({ pendingOrders:1,districts:1,availableVehicles:1,totalVehicles:1,vehiclesInService:0 }),
  limitSeconds:vi.fn().mockResolvedValue(45),generate:vi.fn().mockResolvedValue(proposal),
  approve:vi.fn().mockResolvedValue({ routeIds:['saved-route'],ordersAssigned:1 }),
})

it('muestra la propuesta en el mapa y recarga el mapa operativo después de aprobar', async () => {
  const service = api()
  const operational = { load:vi.fn() }
  render(<RoutePlanningView service={service} mapSource={operational} />)
  fireEvent.click(screen.getByRole('button',{ name:'Generar rutas' }))
  const save = await screen.findByRole('button',{ name:'Aprobar y guardar rutas' })
  expect(await maps.sources.at(-1)!.load()).toEqual(proposal.mapData)
  // La aprobación utiliza la configuración con la que se generó la vista previa.
  fireEvent.click(screen.getByRole('button',{ name:'Menos tiempo' }))
  fireEvent.click(save)
  expect(await screen.findByText('Rutas guardadas')).toBeVisible()
  expect(service.approve).toHaveBeenCalledWith(DEFAULT_ROUTE_SETTINGS,proposal)
  expect(maps.sources.at(-1)).toBe(operational)
  expect(service.scope).toHaveBeenCalledTimes(2)
  expect(screen.queryByRole('button',{ name:'Descartar' })).toBeNull()
})

it('conserva la propuesta tras un rechazo y evita aprobaciones duplicadas', async () => {
  const service = api()
  service.approve.mockRejectedValueOnce(new Error('Los pedidos cambiaron. Vuelve a generar.'))
  render(<RoutePlanningView service={service} />)
  fireEvent.click(screen.getByRole('button',{ name:'Generar rutas' }))
  fireEvent.click(await screen.findByRole('button',{ name:'Aprobar y guardar rutas' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('Los pedidos cambiaron')
  expect(screen.getByRole('region',{ name:'Mapa de la propuesta' })).toBeVisible()
  let finish!: () => void
  service.approve.mockImplementationOnce(() => new Promise(resolve => { finish = () => resolve({routeIds:['r1'],ordersAssigned:1}) }))
  fireEvent.click(screen.getByRole('button',{ name:'Aprobar y guardar rutas' }))
  expect(screen.getByRole('button',{ name:'Guardando rutas…' })).toBeDisabled()
  expect(screen.getByRole('button',{ name:'Volver a generar' })).toBeDisabled()
  expect(screen.getByRole('button',{ name:'Descartar' })).toBeDisabled()
  await act(async () => finish())
  expect(service.approve).toHaveBeenCalledTimes(2)
  expect(screen.getByText('Rutas guardadas')).toBeVisible()
})
