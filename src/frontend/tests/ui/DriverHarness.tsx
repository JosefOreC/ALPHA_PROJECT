// Arnés de pruebas: vistas del conductor con datos de demostración.
import { useState } from 'react'
import { createDriverOrders } from '../../src/application/driverOrders'
import { createDriverRoute } from '../../src/application/driverRoute'
import { DemoMapData } from '../../src/infrastructure/demoMapData'
import { DemoOrders } from '../../src/infrastructure/demoOrders'
import { DriverOrderView } from '../../src/interfaces/DriverOrderView'
import { DriverRouteView } from '../../src/interfaces/DriverRouteView'

const demo = new DemoOrders()
const orders = createDriverOrders(demo)
const route = createDriverRoute(demo)
const map = new DemoMapData()

export function Harness() {
  const [view, setView] = useState<{ name: 'mi-ruta' } | { name: 'pedido'; id: string }>(
    new URLSearchParams(location.search).has('pedido') ? { name: 'pedido', id: 'PED-0026' } : { name: 'mi-ruta' },
  )
  const toRoute = () => setView({ name: 'mi-ruta' })
  if (view.name === 'mi-ruta') {
    return <DriverRouteView service={route} mapSource={map} onOpenOrder={id => setView({ name: 'pedido', id })} onNavigate={(id) => { if (id === 'pedido-actual') setView({ name: 'pedido', id: 'PED-0026' }) }} />
  }
  return <DriverOrderView key={view.id} service={orders} routeService={route} orderId={view.id} demo onNavigate={toRoute} onOpenOrder={id => setView({ name: 'pedido', id })} />
}
