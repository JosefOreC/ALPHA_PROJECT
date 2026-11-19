import { fireEvent, render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { RouteManagementView } from './RouteManagementView'
import { SessionContext } from './session/SessionState'

vi.mock('./map/RouteMap',() => ({RouteMap: () => <p>Mapa de pedidos activos</p>}))
const service = () => ({
  scope:vi.fn().mockResolvedValue({pendingOrders:2,districts:1,availableVehicles:1,totalVehicles:1,vehiclesInService:0,unlocatedOrders:1,depotAvailable:true}),
  limitSeconds:vi.fn().mockResolvedValue(45),generate:vi.fn(),approve:vi.fn(),
})
const source = {load:vi.fn()}

it('abre el seguimiento y consulta la planificación únicamente al elegir su pestaña',async () => {
  const api = service()
  render(<RouteManagementView service={api} mapSource={source} />)
  expect(screen.getByRole('heading',{name:'Gestión de rutas'})).toBeVisible()
  expect(screen.getByRole('tab',{name:'Seguimiento de rutas'})).toHaveAttribute('aria-selected','true')
  expect(screen.getByText('Mapa de pedidos activos')).toBeVisible()
  expect(api.scope).not.toHaveBeenCalled()
  expect(screen.queryByRole('button',{name:'Registrar pedido'})).toBeNull()
  fireEvent.click(screen.getByRole('tab',{name:'Generar rutas'}))
  expect(await screen.findByText(/1 pedidos pendientes necesitan coordenadas/)).toBeVisible()
  expect(api.scope).toHaveBeenCalledOnce()
  expect(screen.getByRole('tabpanel')).toHaveAccessibleName('Generar rutas')
  expect(screen.getByRole('button',{name:'Generar rutas'})).toBeVisible()
  fireEvent.click(screen.getByRole('tab',{name:'Seguimiento de rutas'}))
  expect(screen.queryByRole('button',{name:'Generar rutas'})).toBeNull()
})

it('permite supervisión sin habilitar generación a logística',() => {
  const api = service()
  render(<SessionContext.Provider value={{user:{subjectId:'u1',name:'Ana',role:'logistics',driverId:null,plate:null},loading:false,error:'',login:vi.fn(),logout:vi.fn(),retry:vi.fn()}}>
    <RouteManagementView service={api} mapSource={source} />
  </SessionContext.Provider>)
  expect(screen.getByText('Mapa de pedidos activos')).toBeVisible()
  expect(screen.queryByRole('tab',{name:'Generar rutas'})).toBeNull()
  expect(api.scope).not.toHaveBeenCalled()
})
