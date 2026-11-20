/** Composición de adaptadores de producción. Las vistas reciben servicios por props. */
import { createAdministration } from '../application/administration'
import { createDriverOrders } from '../application/driverOrders'
import { createDriverRoute } from '../application/driverRoute'
import { createExportRecords } from '../application/exportRecords'
import { createGenerateRoutes } from '../application/generateRoutes'
import { createGetSustainabilityReport } from '../application/getSustainabilityReport'
import { createManagement } from '../application/manageOrders'
import { createSimulateRoutes } from '../application/simulateRoutes'
import { HttpDashboardGateway } from '../features/dashboard'
import { BrowserFileSaver } from '../infrastructure/browserFileSaver'
import { apiBaseUrl, getCsrfToken } from '../infrastructure/httpClient'
import { httpDepot } from '../infrastructure/httpDepot'
import { HttpManagement } from '../infrastructure/httpManagement'
import { HttpOrders } from '../infrastructure/httpOrders'
import { HttpAlgorithmSettings, HttpDashboardInsights, HttpDriverRoute, HttpIntegrationCatalog, HttpMapData, HttpPlanningSource, HttpRouteMapData, HttpRouteOptimizer, HttpSustainabilityReport, HttpUserDirectory } from '../infrastructure/httpPortal'
import { HttpSession } from '../infrastructure/httpSession'
import { httpSimulation } from '../infrastructure/httpSimulation'

const algorithmSettings = new HttpAlgorithmSettings()
const saver = new BrowserFileSaver()
export const services = {
  session: new HttpSession(apiBaseUrl),
  dashboard: new HttpDashboardGateway({ baseUrl: apiBaseUrl }),
  insights: new HttpDashboardInsights(),
  driverOrders: createDriverOrders(new HttpOrders(apiBaseUrl)),
  driverRoute: createDriverRoute(new HttpDriverRoute()),
  management: createManagement(new HttpManagement(apiBaseUrl, getCsrfToken)),
  map: new HttpMapData(),
  routeMap: new HttpRouteMapData(),
  administration: createAdministration({ settings: algorithmSettings, users: new HttpUserDirectory(), integrations: new HttpIntegrationCatalog() }),
  planning: createGenerateRoutes({ optimizer: new HttpRouteOptimizer(), planning: new HttpPlanningSource(), settings: algorithmSettings }),
  sustainability: createGetSustainabilityReport({ source: new HttpSustainabilityReport(), saver }),
  exportAudit: createExportRecords(saver),
  simulate: createSimulateRoutes(httpSimulation),
  depot: httpDepot,
}
