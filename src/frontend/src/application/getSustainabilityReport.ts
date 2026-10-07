import type { FileSaver } from '../domain/ports/fileSaver'
import type { SustainabilityReportSource } from '../domain/ports/sustainabilityReportSource'
import { PERIOD_LABELS, avoidedPercent } from '../domain/sustainability'
import type { ReportPeriod, SustainabilityReport } from '../domain/sustainability'

type Cell = string | number

// Una celda de texto que empieza con = + - @ se tomaría como fórmula en Excel; se neutraliza con una comilla.
const FORMULA_START = /^[=+\-@\t\r]/

function escapeCell(cell: Cell): string {
  if (typeof cell === 'number') return String(cell)
  const safe = FORMULA_START.test(cell) ? `'${cell}` : cell
  return /[",;\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe
}

/** CSV con los datos del periodo: resumen, serie del gráfico, distritos y vehículos. UTF-8 con BOM para que Excel respete las tildes. */
export function buildReportCsv(report: SustainabilityReport): string {
  const rows: Cell[][] = [
    ['Reporte de sostenibilidad'],
    ['Periodo', PERIOD_LABELS[report.period]],
    ['Detalle', report.subtitle],
    [],
    ['Resumen'],
    ['Indicador', 'Valor', 'Unidad'],
    ['CO2 evitado', report.avoidedKg, 'kg'],
    ['CO2 emitido', report.emittedKg, 'kg'],
    ['Linea base (rutas sin optimizar)', report.baselineKg, 'kg'],
    ['Ahorro frente a la linea base', avoidedPercent(report), '%'],
    ['Combustible ahorrado (equivalente diesel)', report.fuelSavedLiters, 'L'],
    ['Km evitados', report.kmAvoided, 'km'],
    ['Flota de bajas emisiones', report.lowEmissionFleet.count, `de ${report.lowEmissionFleet.total} vehiculos`],
    [],
    [`Emisiones por ${report.seriesUnit}`],
    ['Etiqueta', 'CO2 emitido (kg)', 'CO2 evitado (kg)', 'Linea base (kg)'],
    ...report.series.map((point): Cell[] => [point.label, point.emittedKg, point.avoidedKg, report.seriesBaselineKg]),
    [],
    ['Por distrito'],
    ['Distrito', 'CO2 emitido (kg)', 'Ahorro (%)'],
    ...report.byDistrict.map((row): Cell[] => [row.district, row.emittedKg, row.savingPercent]),
    [],
    ['Por vehiculo'],
    ['Placa', 'Combustible', 'Km', 'CO2 (kg)', 'kg de CO2 cada 100 km'],
    ...report.byVehicle.map((row): Cell[] => [row.plate, row.fuel, row.km, row.co2Kg, row.kgPer100Km]),
  ]
  return `﻿${rows.map((row) => row.map(escapeCell).join(',')).join('\r\n')}\r\n`
}

const slug = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

export const reportFilename = (report: SustainabilityReport) => `reporte-sostenibilidad-${report.period}-${slug(report.subtitle)}.csv`

export function createGetSustainabilityReport(deps: { source: SustainabilityReportSource; saver: FileSaver }) {
  return {
    get: (period: ReportPeriod, signal?: AbortSignal) => deps.source.getReport(period, signal),
    /** Descarga los datos del periodo mostrado (US-011). */
    exportCsv(report: SustainabilityReport) {
      deps.saver.save(reportFilename(report), buildReportCsv(report), 'text/csv;charset=utf-8')
    },
  }
}
export type SustainabilityService = ReturnType<typeof createGetSustainabilityReport>
