// Entrada aislada para comprobar el dashboard; los datos ficticios no forman parte del build.
import { createRoot } from 'react-dom/client'
import { DashboardPage } from '../../src/features/dashboard'
import { DemoDashboardInsights } from '../../src/features/dashboard/infrastructure/DemoDashboardInsights'
import { makeSummary } from '../../src/features/dashboard/test/fakes'
import '../../src/shared/ui/tokens.css'
import '../../src/shared/ui/eco.css'

const districts = [{ id: '150103', name: 'Ate' }, { id: '150137', name: 'Santa Anita' }]
const summary = makeSummary({
  day: '2026-11-20', orders: { delivered: 96, inTransit: 38, pending: 18, cancelled: 4, total: 156 },
  windowCompliance: { evaluated: 96, withinWindow: 89, percentage: 92.7, target: 90 },
  fleetDistanceKm: 325.8, co2Kg: 93.8,
})
const insights = new DemoDashboardInsights()
createRoot(document.getElementById('root')!).render(<DashboardPage gateway={{
  listDistricts: async () => districts,
  getSummary: async ({ districtId }) => ({ ...summary, districtId: districtId ?? null }),
}} insights={insights} />)
