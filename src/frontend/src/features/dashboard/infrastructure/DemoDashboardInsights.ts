import type { DashboardInsightsGateway } from '../domain/gateway'
import type { DashboardInsights } from '../domain/types'

// Datos ficticios de la pantalla de diseño (Main.dc.html). Solo demostración: no hay API de CO₂ evitado ni de ventanas.
const WEEK = [
  { label: 'V', avoidedKg: 17 },
  { label: 'S', avoidedKg: 19 },
  { label: 'D', avoidedKg: 15 },
  { label: 'L', avoidedKg: 21 },
  { label: 'M', avoidedKg: 23 },
  { label: 'X', avoidedKg: 18 },
  { label: 'J', avoidedKg: 22 },
]

export class DemoDashboardInsights implements DashboardInsightsGateway {
  async getInsights(): Promise<DashboardInsights> {
    return {
      co2Avoided: {
        avoidedKg: 22,
        avoidedPercent: 19,
        fuelSavedLiters: 9,
        kmSaved: 212,
        weekly: WEEK.map((day, index) => ({ ...day, today: index === WEEK.length - 1 })),
      },
      atRisk: [
        { id: 'PED-0022', customer: 'Bodega La Esquina', district: 'El Agustino', window: '09:00–11:00', status: 'inTransit', note: 'llega 10:55' },
        { id: 'PED-0044', customer: 'Farmacia Los Ángeles', district: 'Ate', window: '10:30–11:30', status: 'inTransit', note: 'llega 11:25' },
        { id: 'PED-0052', customer: 'Ferretería Cerro San Pedro', district: 'El Agustino', window: '11:00–12:00', status: 'pending', note: 'sin conductor' },
      ],
      riskMinutes: 60,
      suggestion: 'sumar PED-0024 a la ruta de EGH-567 ahorra 0,04 kg de CO₂.',
    }
  }
}
