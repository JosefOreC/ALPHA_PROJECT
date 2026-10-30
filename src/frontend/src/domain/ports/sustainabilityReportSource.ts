import type { ReportPeriod, SustainabilityReport } from '../sustainability'

/** Fuente del reporte de sostenibilidad (US-010). */
export interface SustainabilityReportSource {
  getReport(period: ReportPeriod, signal?: AbortSignal): Promise<SustainabilityReport>
}
