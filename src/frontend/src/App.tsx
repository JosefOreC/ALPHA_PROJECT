import { createDriverOrders } from './application/driverOrders'
import { DemoOrders } from './infrastructure/demoOrders'
import { HttpOrders } from './infrastructure/httpOrders'
import { DriverOrderView } from './interfaces/DriverOrderView'
import './App.css'
import { createManagement } from './application/manageOrders'
import { DemoManagement } from './infrastructure/demoManagement'
import { HttpManagement } from './infrastructure/httpManagement'
import { OrderManagementView } from './interfaces/OrderManagementView'
// Raíz de composición: solo aquí se seleccionan adaptadores concretos.
const apiUrl = import.meta.env.VITE_API_URL as string | undefined
const demo = apiUrl === undefined
const service = createDriverOrders(demo ? new DemoOrders() : new HttpOrders(apiUrl))
const orderId = new URLSearchParams(window.location.search).get('pedido') ?? 'PED-0024'
const query = new URLSearchParams(window.location.search)
const management = createManagement(demo ? new DemoManagement() : new HttpManagement(apiUrl,
  () => document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? null))
export default function App() {
  if (query.get('vista') === 'pedidos' && !query.has('pedido')) return <OrderManagementView service={management} demo={demo} />
  return <><a className="management-switch" href="/?vista=pedidos">Ir a gestión de pedidos</a><DriverOrderView key={orderId} service={service} orderId={orderId} demo={demo} /></>
}
