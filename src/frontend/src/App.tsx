import { createDriverOrders } from './application/driverOrders'
import { DemoOrders } from './infrastructure/demoOrders'
import { HttpOrders } from './infrastructure/httpOrders'
import { DriverOrderView } from './interfaces/DriverOrderView'
import './App.css'
// Raíz de composición: solo aquí se seleccionan adaptadores concretos.
const apiUrl = import.meta.env.VITE_API_URL as string | undefined
const demo = apiUrl === undefined
const service = createDriverOrders(demo ? new DemoOrders() : new HttpOrders(apiUrl))
const orderId = new URLSearchParams(window.location.search).get('pedido') ?? 'PED-0024'
export default function App() {
  return <DriverOrderView key={orderId} service={service} orderId={orderId} demo={demo} />
}
