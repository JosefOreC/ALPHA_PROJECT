import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { beforeAll, expect, it, vi } from 'vitest'
import { OrderManagementView } from './OrderManagementView'
import type { ManagedOrder, OrderPage } from '../domain/managedOrder'
import { SessionContext } from './session/SessionState'

vi.mock('./map/RouteMap',()=>({ RouteMap: () => <p>Mapa operativo</p> }))
const order: ManagedOrder={ id:'p1',customer:'Ana',address:'Calle 1',district:'Ate',window_start:'2026-10-30T10:00:00-05:00',window_end:'2026-10-30T12:00:00-05:00',weight_kg:2,instructions:'',status:'PENDIENTE',assigned:false,version:1,confirmed_at:null }
const mapSource={ load:vi.fn() }
const service=() => ({ permissions:vi.fn().mockResolvedValue({ can_write:true }),list:vi.fn().mockResolvedValue({ items:[order],limit:100,offset:0,has_more:false }),view:vi.fn().mockResolvedValue({ ...order,version:2 }),create:vi.fn().mockResolvedValue(order),update:vi.fn().mockResolvedValue(order),cancel:vi.fn().mockResolvedValue({ ...order,status:'CANCELADO' }) })
beforeAll(() => {
  HTMLDialogElement.prototype.showModal=function(){ this.setAttribute('open','') }
  HTMLDialogElement.prototype.close=function(){ this.removeAttribute('open');this.dispatchEvent(new Event('close')) }
})
it('consulta todas las páginas y ofrece un estado vacío cuando no hay pedidos', async () => {
  const api=service(); api.list.mockResolvedValueOnce({ items:[],limit:100,offset:0,has_more:true }).mockResolvedValue({ items:[],limit:100,offset:100,has_more:false })
  render(<OrderManagementView service={api} mapSource={mapSource} />)
  expect(await screen.findByText('No hay pedidos registrados.')).toBeVisible()
  expect(api.list).toHaveBeenCalledWith({ limit:100,offset:100 })
})
it.each([new Error('Sin conexión'),'offline'])('recupera una carga fallida del listado: %s',async reason => {
  const api=service(); api.list.mockRejectedValueOnce(reason)
  render(<OrderManagementView service={api} mapSource={mapSource} />)
  expect(await screen.findByRole('alert')).toHaveTextContent(reason instanceof Error ? reason.message : 'No se pudo cargar')
  fireEvent.click(screen.getByRole('button',{ name:'Volver a cargar' }))
  expect(await screen.findByRole('article')).toHaveTextContent('Ana')
})
it.each([false,true])('ignora una carga desmontada: error=%s',async failed => {
  let finish!: (value:OrderPage) => void;let reject!: (reason:unknown) => void
  const api=service(); api.list.mockImplementation(()=>new Promise((done,fail)=>{ finish=done;reject=fail }))
  const view=render(<OrderManagementView service={api} mapSource={mapSource} />);view.unmount()
  await act(async()=>{ if(failed)reject('offline');else finish({ items:[],limit:100,offset:0,has_more:false }) })
})
it.each([false,true])('reconsulta versiones actuales y muestra fallos sin perder el pedido: error=%s',async failed => {
  const api=service()
  render(<OrderManagementView service={api} mapSource={mapSource} />)
  await screen.findByRole('article')
  if(failed)api.view.mockRejectedValueOnce('offline')
  fireEvent.click(screen.getByRole('button',{ name:'Consultar versión actual' }))
  if(failed) expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo consultar')
  else await screen.findByText('2')
  expect(api.view).toHaveBeenCalledWith('p1')
})
it('edita un pedido y puede volver desde el formulario sin guardar',async()=>{
  const api=service()
  render(<OrderManagementView service={api} mapSource={mapSource} />)
  fireEvent.click(await screen.findByRole('button',{ name:'Editar pedido' }))
  fireEvent.submit(screen.getByRole('button',{ name:'Guardar cambios' }).closest('form')!)
  expect(await screen.findByText('Pedido guardado correctamente.')).toBeVisible()
  fireEvent.click(await screen.findByRole('button',{ name:'Editar pedido' }))
  fireEvent.click(screen.getByRole('button',{ name:'Volver' }))
  expect(await screen.findByRole('article')).toHaveTextContent('Ana')
})
it('muestra un fallo de cancelación y bloquea peticiones simultáneas',async()=>{
  const api=service();let reject!: (reason:unknown)=>void
  api.cancel.mockImplementation(()=>new Promise((_done,fail)=>{ reject=fail }))
  render(<OrderManagementView service={api} mapSource={mapSource} />)
  fireEvent.click(await screen.findByRole('button',{ name:'Cancelar pedido' }))
  const confirm=within(screen.getByRole('dialog')).getByRole('button',{ name:'Sí, cancelar pedido' })
  fireEvent.click(confirm);fireEvent.click(confirm)
  expect(api.cancel).toHaveBeenCalledOnce()
  await act(async()=>reject('offline'))
  expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo cancelar')
})
it('el atajo de búsqueda respeta campos de texto y permite filtrar por distrito',async()=>{
  const api=service()
  render(<OrderManagementView service={api} mapSource={mapSource} />)
  await screen.findByRole('article')
  fireEvent.keyDown(document.body,{ key:'/' })
  const search=screen.getByRole('searchbox')
  expect(search).toHaveFocus()
  fireEvent.keyDown(search,{ key:'/' })
  fireEvent.keyDown(window,{ key:'Escape' })
  fireEvent.change(screen.getByLabelText('Distrito'),{ target:{ value:'Santa Anita' } })
  expect(await screen.findByText('Sin resultados.')).toBeVisible()
})
it('un auditor consulta el listado sin controles de escritura ni mapa',async()=>{
  const api=service();api.permissions.mockResolvedValue({ can_write:false })
  render(<SessionContext.Provider value={{ user:{ subjectId:'u1',name:'Ana',role:'auditor',driverId:null,plate:null },loading:false,error:'',login:vi.fn(),logout:vi.fn(),retry:vi.fn() }}><OrderManagementView service={api} mapSource={mapSource} /></SessionContext.Provider>)
  await screen.findByRole('article')
  expect(screen.queryByRole('button',{ name:'Registrar pedido' })).toBeNull()
  expect(screen.queryByText('Mapa operativo')).toBeNull()
})
