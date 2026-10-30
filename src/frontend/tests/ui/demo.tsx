// Entrada exclusiva de pruebas en Vite; el build del producto solo usa index.html.
import { createRoot } from 'react-dom/client'
import { createManagement } from '../../src/application/manageOrders'
import { DemoManagement } from '../../src/infrastructure/demoManagement'
import { DemoMapData } from '../../src/infrastructure/demoMapData'
import { ManagementError } from '../../src/domain/managedOrder'
import { OrderManagementView } from '../../src/interfaces/OrderManagementView'
import '../../src/shared/ui/tokens.css'
import '../../src/shared/ui/eco.css'

const port = new DemoManagement()
if (new URLSearchParams(location.search).has('error-largo')) {
  port.list = async () => { throw new ManagementError('Error ficticio de prueba: ' + 'mensaje'.repeat(60)) }
}
createRoot(document.getElementById('root')!).render(<OrderManagementView service={createManagement(port)} demo mapSource={new DemoMapData()} />)
