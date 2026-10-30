import type { SustainabilityReportSource } from '../domain/ports/sustainabilityReportSource'
import type { DistrictEmissions, ReportPeriod, SeriesPoint, SustainabilityReport, VehicleEmissions } from '../domain/sustainability'

// Datos ficticios de Sostenibilidad.dc.html. Las cifras cuadran entre periodos: emitido + evitado = línea base en cada barra.
const point = (label: string, emittedKg: number, avoidedKg: number, current = false): SeriesPoint => ({ label, emittedKg, avoidedKg, current })

const MONTH_WEEKS = [point('SEM 1', 712, 163), point('SEM 2', 705, 170), point('SEM 3', 731, 144), point('SEM 4', 694, 181, true)]
const WEEK_DAYS = [
  point('LUN', 101, 24), point('MAR', 98, 27), point('MIÉ', 103, 22), point('JUE', 97, 28),
  point('VIE', 99, 26), point('SÁB', 96, 29), point('DOM', 100, 25, true),
]
const QUARTER_MONTHS = [point('AGO', 2970, 530), point('SET', 2978, 522), point('OCT', 2842, 658, true)]

const MONTH_DISTRICTS: DistrictEmissions[] = [
  { district: 'San Juan de Lurigancho', emittedKg: 1020, savingPercent: 21 },
  { district: 'Ate', emittedKg: 692, savingPercent: 19 },
  { district: 'El Agustino', emittedKg: 610, savingPercent: 17 },
  { district: 'Santa Anita', emittedKg: 520, savingPercent: 18 },
]
const MONTH_VEHICLES: VehicleEmissions[] = [
  { plate: 'GJK-112', fuel: 'DIESEL', km: 1950, co2Kg: 241, kgPer100Km: 12.4 },
  { plate: 'BCD-456', fuel: 'DIESEL', km: 2380, co2Kg: 268, kgPer100Km: 11.3 },
  { plate: 'ABC-123', fuel: 'GNV', km: 2610, co2Kg: 196, kgPer100Km: 7.5 },
  { plate: 'EGH-567', fuel: 'HIBRIDO', km: 2040, co2Kg: 139, kgPer100Km: 6.8 },
  { plate: 'HKL-345', fuel: 'ELECTRICO', km: 1480, co2Kg: 0, kgPer100Km: 0 },
]

const BASE = {
  seriesTitle: 'CO₂ emitido por',
  lowEmissionFleet: { count: 11, total: 15 },
  opportunity: 'pasar GJK-112 a GNV evitaría cerca de 95 kg de CO₂ al mes.',
}

/** Reescala una cifra del mes al periodo pedido (km y CO₂ crecen o bajan con el volumen; la intensidad no cambia). */
const scale = (value: number, factor: number) => Math.round(value * factor)

function build(period: ReportPeriod): SustainabilityReport {
  if (period === 'week') {
    const factor = 694 / 2842
    return {
      ...BASE, period, subtitle: 'Semana 4 de octubre', seriesUnit: 'día', seriesTitle: `${BASE.seriesTitle} día`, seriesBaselineKg: 125,
      baselineKg: 875, emittedKg: 694, avoidedKg: 181, fuelSavedLiters: 68, kmAvoided: 1480, series: WEEK_DAYS,
      byDistrict: MONTH_DISTRICTS.map((row) => ({ ...row, emittedKg: scale(row.emittedKg, factor) })),
      byVehicle: MONTH_VEHICLES.map((row) => ({ ...row, km: scale(row.km, factor), co2Kg: scale(row.co2Kg, factor) })),
    }
  }
  if (period === 'quarter') {
    const factor = 8790 / 2842
    return {
      ...BASE, period, subtitle: 'Agosto – octubre 2026', seriesUnit: 'mes', seriesTitle: `${BASE.seriesTitle} mes`, seriesBaselineKg: 3500,
      baselineKg: 10500, emittedKg: 8790, avoidedKg: 1710, fuelSavedLiters: 638, kmAvoided: 16900, series: QUARTER_MONTHS,
      byDistrict: MONTH_DISTRICTS.map((row) => ({ ...row, emittedKg: scale(row.emittedKg, factor) })),
      byVehicle: MONTH_VEHICLES.map((row) => ({ ...row, km: scale(row.km, factor), co2Kg: scale(row.co2Kg, factor) })),
    }
  }
  return {
    ...BASE, period, subtitle: 'Octubre 2026', seriesUnit: 'semana', seriesTitle: `${BASE.seriesTitle} semana`, seriesBaselineKg: 875,
    baselineKg: 3500, emittedKg: 2842, avoidedKg: 658, fuelSavedLiters: 245, kmAvoided: 6360, series: MONTH_WEEKS,
    byDistrict: MONTH_DISTRICTS, byVehicle: MONTH_VEHICLES,
  }
}

/** Solo demostración: datos ficticios, sin llamadas a ninguna API. */
export class DemoSustainabilityReport implements SustainabilityReportSource {
  async getReport(period: ReportPeriod) {
    return build(period)
  }
}

/** Sin fuente de datos real el reporte avisa en lugar de mostrar cifras inventadas. */
export class UnavailableSustainabilityReport implements SustainabilityReportSource {
  async getReport(): Promise<SustainabilityReport> {
    throw new Error('El reporte de sostenibilidad aún no tiene fuente de datos en la API.')
  }
}
