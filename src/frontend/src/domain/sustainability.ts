export type ReportPeriod = 'week' | 'month' | 'quarter'

export const PERIODS: ReportPeriod[] = ['week', 'month', 'quarter']
export const PERIOD_LABELS: Record<ReportPeriod, string> = { week: 'Semana', month: 'Mes', quarter: 'Trimestre' }

/** Un punto del gráfico: una barra de CO₂ emitido con el evitado hasta la línea base. */
export interface SeriesPoint {
  label: string
  emittedKg: number
  avoidedKg: number
  /** El periodo en curso; se pinta en lima. */
  current: boolean
}

export interface DistrictEmissions {
  district: string
  emittedKg: number
  /** Ahorro frente a la línea base, en porcentaje. */
  savingPercent: number
}

export interface VehicleEmissions {
  plate: string
  /** Código de combustible: DIESEL, GNV, HIBRIDO, ELECTRICO… */
  fuel: string
  km: number
  co2Kg: number
  kgPer100Km: number
}

export interface SustainabilityReport {
  period: ReportPeriod
  /** «Octubre 2026». */
  subtitle: string
  /** Qué representa cada barra: «semana», «día» o «mes». */
  seriesUnit: string
  /** Título del gráfico: «CO₂ emitido por semana». */
  seriesTitle: string
  baselineKg: number
  emittedKg: number
  avoidedKg: number
  fuelSavedLiters: number
  kmAvoided: number
  lowEmissionFleet: { count: number; total: number }
  /** Línea base de cada barra, la misma para todas. */
  seriesBaselineKg: number
  series: SeriesPoint[]
  byDistrict: DistrictEmissions[]
  byVehicle: VehicleEmissions[]
  opportunity: string | null
}

/** Porcentaje evitado frente a la línea base, redondeado. */
export const avoidedPercent = (report: Pick<SustainabilityReport, 'avoidedKg' | 'baselineKg'>) =>
  report.baselineKg > 0 ? Math.round((report.avoidedKg / report.baselineKg) * 100) : 0

/** Intensidad a partir de la cual un vehículo se marca como crítico o de atención (kg de CO₂ cada 100 km). */
export const INTENSITY_DANGER = 12
export const INTENSITY_WARNING = 10

export type IntensityLevel = 'danger' | 'warning' | 'normal'
export const intensityLevel = (kgPer100Km: number): IntensityLevel =>
  kgPer100Km > INTENSITY_DANGER ? 'danger' : kgPer100Km > INTENSITY_WARNING ? 'warning' : 'normal'
