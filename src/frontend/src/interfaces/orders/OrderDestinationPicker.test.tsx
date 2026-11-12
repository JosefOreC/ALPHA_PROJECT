import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import type { GeoPoint } from '../../domain/mapData'
import type { ManagedOrder } from '../../domain/managedOrder'
import { OrderForm } from '../OrderForm'

vi.mock('../map/DestinationMap',() => ({default:({onChange,onError,disabled}:{onChange:(point:GeoPoint)=>void;onError:(message:string)=>void;disabled:boolean}) =>
  <div><button type="button" disabled={disabled} onClick={() => onChange({lat:-12.0456789,lng:-76.954321})}>Elegir punto de prueba</button>
    <button type="button" onClick={() => onError('Cartografía no disponible')}>Fallar mapa de prueba</button></div>}))

const original = Object.getOwnPropertyDescriptor(navigator,'geolocation')
afterEach(() => {
  if (original) Object.defineProperty(navigator,'geolocation',original)
  else Reflect.deleteProperty(navigator,'geolocation')
})
const order: ManagedOrder = {id:'p1',customer:'Ana',address:'Calle 1',district:'Ate',window_start:'2026-10-30T10:00:00-05:00',window_end:'2026-10-30T12:00:00-05:00',
  weight_kg:2,instructions:'',status:'PENDIENTE',assigned:false,version:1,confirmed_at:null,latitude:-12.03,longitude:-76.96}
function setup() {
  const api = {update:vi.fn().mockResolvedValue(order)}
  const view = render(<OrderForm service={api as never} order={order} onSaved={vi.fn()} onBack={vi.fn()} />)
  return {api,view}
}
function geo() {
  let success!: PositionCallback
  let failure!: PositionErrorCallback
  const getCurrentPosition = vi.fn((done:PositionCallback,fail:PositionErrorCallback) => {success=done;failure=fail})
  Object.defineProperty(navigator,'geolocation',{configurable:true,value:{getCurrentPosition}})
  return {getCurrentPosition,success:(lat=-12.04,lng=-76.95) => success({coords:{latitude:lat,longitude:lng}} as GeolocationPosition),
    failure:(code:number) => failure({code} as GeolocationPositionError)}
}

it('elegir el destino actualiza ambas coordenadas y las envía al guardar',async () => {
  const {api} = setup()
  fireEvent.click(screen.getByRole('button',{name:'Seleccionar en mapa'}))
  fireEvent.click(await screen.findByRole('button',{name:'Elegir punto de prueba'}))
  expect(screen.getByLabelText('Latitud de entrega')).toHaveValue(-12.0456789)
  expect(screen.getByLabelText('Longitud de entrega')).toHaveValue(-76.954321)
  expect(api.update).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button',{name:'Guardar cambios'}))
  await act(async () => {})
  expect(api.update).toHaveBeenCalledWith(order,expect.objectContaining({latitude:-12.0456789,longitude:-76.954321,address:'Calle 1',district:'Ate'}))
})

it('solo solicita la ubicación al pulsar el botón y abre el mapa al obtenerla',async () => {
  const gps = geo()
  const {api} = setup()
  expect(gps.getCurrentPosition).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button',{name:'Usar ubicación actual'}))
  expect(screen.getByRole('button',{name:'Guardar cambios'})).toBeDisabled()
  fireEvent.submit(screen.getByRole('button',{name:'Guardar cambios'}).closest('form')!)
  expect(api.update).not.toHaveBeenCalled()
  expect(gps.getCurrentPosition.mock.calls[0]).toEqual([expect.any(Function),expect.any(Function),{enableHighAccuracy:true,timeout:12000,maximumAge:0}])
  await act(async () => gps.success())
  expect(screen.getByLabelText('Latitud de entrega')).toHaveValue(-12.04)
  expect(screen.getByLabelText('Longitud de entrega')).toHaveValue(-76.95)
  expect(await screen.findByRole('button',{name:'Elegir punto de prueba'})).toBeVisible()
  expect(screen.getByRole('button',{name:'Guardar cambios'})).toBeEnabled()
})

it.each([[1,'No se concedió permiso'],[2,'No se pudo obtener'],[3,'Se agotó el tiempo']] as const)('explica el error de ubicación %s sin perder el destino',async (code,message) => {
  const gps = geo()
  setup()
  fireEvent.click(screen.getByRole('button',{name:'Usar ubicación actual'}))
  await act(async () => gps.failure(code))
  expect(screen.getByText(new RegExp(message))).toBeVisible()
  expect(screen.getByLabelText('Latitud de entrega')).toHaveValue(order.latitude!)
  expect(screen.getByLabelText('Longitud de entrega')).toHaveValue(order.longitude!)
  expect(screen.getByRole('button',{name:'Guardar cambios'})).toBeEnabled()
})

it('permite elegir en el mapa cuando el navegador no ofrece geolocalización',async () => {
  Object.defineProperty(navigator,'geolocation',{configurable:true,value:undefined})
  setup()
  fireEvent.click(screen.getByRole('button',{name:'Usar ubicación actual'}))
  expect(screen.getByText(/Este navegador no permite obtener la ubicación/)).toBeVisible()
  fireEvent.click(screen.getByRole('button',{name:'Seleccionar en mapa'}))
  expect(await screen.findByRole('button',{name:'Elegir punto de prueba'})).toBeVisible()
})

it('una respuesta tardía de ubicación no sobrescribe una corrección manual',async () => {
  const gps = geo()
  setup()
  fireEvent.click(screen.getByRole('button',{name:'Usar ubicación actual'}))
  fireEvent.change(screen.getByLabelText('Latitud de entrega'),{target:{value:'-12.08'}})
  await act(async () => gps.success())
  expect(screen.getByLabelText('Latitud de entrega')).toHaveValue(-12.08)
  expect(screen.getByLabelText('Longitud de entrega')).toHaveValue(order.longitude!)
  expect(screen.queryByRole('button',{name:'Elegir punto de prueba'})).toBeNull()
})

it('un error cartográfico conserva las coordenadas y permite reintentar',async () => {
  setup()
  fireEvent.click(screen.getByRole('button',{name:'Seleccionar en mapa'}))
  fireEvent.click(await screen.findByRole('button',{name:'Fallar mapa de prueba'}))
  expect(screen.getByText(/El punto seleccionado se conserva/)).toBeVisible()
  expect(screen.getByLabelText('Latitud de entrega')).toHaveValue(order.latitude!)
  fireEvent.click(screen.getByRole('button',{name:'Reintentar mapa de destino'}))
  expect(await screen.findByRole('button',{name:'Elegir punto de prueba'})).toBeVisible()
})
