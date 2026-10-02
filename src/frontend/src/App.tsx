import { DashboardPage, HttpDashboardGateway } from './features/dashboard'

// Composition root: the HTTP adapter is chosen here, never inside components.
const dashboardGateway = new HttpDashboardGateway()

function App() {
  return <DashboardPage gateway={dashboardGateway} />
}

export default App
