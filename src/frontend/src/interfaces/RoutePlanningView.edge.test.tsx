import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { RoutePlanningView } from './RoutePlanningView'
import { SessionContext } from './session/SessionState'
import type { GenerateRoutes } from '../application/generateRoutes'
import type { RouteProposal } from '../domain/routePlan'

const scope = { pendingOrders:1,districts:1,availableVehicles:1,totalVehicles:1,vehiclesInService:0 }
const proposal: RouteProposal = { routeCount:1,ordersAssigned:1,totalKm:3,kmSaved:null,co2Kg:2,co2SavedPercent:null,windowCompliance:100,windowTarget:90,elapsedSeconds:1,
  routes:[{ plate:'TST-001',driver:'Ana',zone:'Ate',fuel:'GNV',stops:1,km:3,load:.5,co2Kg:2,sequence:[{ id:'',customer:null,district:'Ate',eta:'10:00',onTime:true }] }] }
const service=() => ({ scope:vi.fn().mockResolvedValue(scope),limitSeconds:vi.fn().mockResolvedValue(30),generate:vi.fn().mockResolvedValue(proposal) })
afterEach(() => vi.useRealTimers())

it.each([false,true])('supervisa rutas sin permiso de generación, mapa=%s', custom => {
  const api=service()
  render(<SessionContext.Provider value={{ user:{ subjectId:'u1',name:'Ana',role:'logistics',driverId:null,plate:null },loading:false,error:'',login:vi.fn(),logout:vi.fn(),retry:vi.fn() }}><RoutePlanningView service={api} renderMap={custom ? <p>Mapa operativo</p> : undefined} /></SessionContext.Provider>)
  expect(screen.queryByRole('button',{ name:'Generar rutas' })).toBeNull()
  expect(screen.getByText(custom ? 'Mapa operativo' : /La consulta de rutas/)).toBeVisible()
  expect(api.scope).not.toHaveBeenCalled()
})
it.each([new Error('Sin alcance'),'offline'])('explica una carga fallida del alcance: %s', async reason => {
  const api=service(); api.scope.mockRejectedValue(reason); api.limitSeconds.mockRejectedValue(new Error('offline'))
  render(<RoutePlanningView service={api} />)
  expect(await screen.findByRole('alert')).toHaveTextContent(reason instanceof Error ? reason.message : 'No se pudo consultar')
})
it('ignora resultados de alcance y límite recibidos después de desmontar', async () => {
  let resolve!: (value: typeof scope) => void; let seconds!: (value:number) => void
  const api=service(); api.scope.mockImplementation(() => new Promise(done => { resolve=done })); api.limitSeconds.mockImplementation(() => new Promise(done => { seconds=done }))
  const view=render(<RoutePlanningView service={api} />); view.unmount()
  await act(async () => { resolve(scope); seconds(30) })
  expect(screen.queryByText('pendientes')).toBeNull()
})
it('no actualiza el alcance desmontado cuando la consulta termina con error', async () => {
  let reject!: (reason:unknown) => void
  const api=service(); api.scope.mockImplementation(() => new Promise((_done,fail) => { reject=fail }))
  const view=render(<RoutePlanningView service={api} />); view.unmount()
  await act(async () => reject('offline'))
  expect(screen.queryByRole('alert')).toBeNull()
})
it('muestra el error genérico de generación cuando el servicio no entrega un Error', async () => {
  const api=service(); api.generate.mockRejectedValue('offline')
  render(<RoutePlanningView service={api} />)
  fireEvent.click(screen.getByRole('button',{ name:'Generar rutas' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('No se pudieron generar las rutas')
})
it('presenta una propuesta sin línea base ni metadatos opcionales de la ruta', async () => {
  const api=service()
  render(<RoutePlanningView service={api} />)
  fireEvent.click(screen.getByRole('button',{ name:'Generar rutas' }))
  expect(await screen.findByText('Distancia geográfica estimada')).toBeVisible()
  expect(screen.getByText('Emisiones estimadas de la propuesta')).toBeVisible()
  fireEvent.click(screen.getByRole('button',{ name:'Ver paradas de TST-001' }))
  expect(screen.getByText('Pedido sin nombre')).toBeVisible()
  expect(screen.queryByText(/rutas más/)).toBeNull()
})
it('admite combustible con unidad distinta de m3 en el detalle', async () => {
  const api=service(); api.generate.mockResolvedValue({ ...proposal,routes:[{ ...proposal.routes[0],fuelUsed:{ amount:2,unit:'L' } }] })
  render(<RoutePlanningView service={api} />)
  fireEvent.click(screen.getByRole('button',{ name:'Generar rutas' }))
  fireEvent.click(await screen.findByRole('button',{ name:'Ver paradas de TST-001' }))
  expect(screen.getByRole('region',{ name:'Detalle de TST-001' })).toHaveTextContent('2 L de GNV')
})
it('mide el tiempo mientras el servicio aún consulta el alcance', async () => {
  vi.useFakeTimers()
  let finish!: (value:RouteProposal) => void
  const api=service(); api.scope.mockReturnValue(new Promise(() => {})); api.generate.mockImplementation(() => new Promise(done => { finish=done }))
  render(<RoutePlanningView service={api as GenerateRoutes} />)
  fireEvent.click(screen.getByRole('button',{ name:'Generar rutas' }))
  await act(async () => vi.advanceTimersByTime(2000))
  expect(screen.getByText('2 s')).toBeVisible()
  await act(async () => finish(proposal))
  expect(screen.getByText('Propuesta lista · sin aprobar')).toBeVisible()
})
