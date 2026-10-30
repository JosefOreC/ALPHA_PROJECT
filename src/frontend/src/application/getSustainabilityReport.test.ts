import { describe, expect, it, vi } from 'vitest'
import type { FileSaver } from '../domain/ports/fileSaver'
import { PERIODS, avoidedPercent, intensityLevel } from '../domain/sustainability'
import type { SustainabilityReport } from '../domain/sustainability'
import { DemoSustainabilityReport, UnavailableSustainabilityReport } from '../infrastructure/demoSustainability'
import { buildReportCsv, createGetSustainabilityReport, reportFilename } from './getSustainabilityReport'

const demo = new DemoSustainabilityReport()
const month = await demo.getReport('month')

/** Parseo mínimo de CSV con comillas, solo para las pruebas. */
function parse(csv: string): string[][] {
  return csv
    .replace(/^﻿/, '')
    .split('\r\n')
    .filter((line, index, all) => !(index === all.length - 1 && line === ''))
    .map((line) => {
      const cells: string[] = []
      let current = ''
      let quoted = false
      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        if (quoted) {
          if (char === '"' && line[i + 1] === '"') { current += '"'; i++ }
          else if (char === '"') quoted = false
          else current += char
        } else if (char === '"') quoted = true
        else if (char === ',') { cells.push(current); current = '' }
        else current += char
      }
      cells.push(current)
      return cells
    })
}

const section = (rows: string[][], title: string) => {
  const start = rows.findIndex((row) => row[0] === title && row.length === 1)
  const end = rows.findIndex((row, index) => index > start && row.length === 1 && row[0] === '')
  return rows.slice(start + 1, end === -1 ? undefined : end)
}

describe('datos demo del reporte', () => {
  it('cuadran: en cada barra lo emitido más lo evitado es la línea base', async () => {
    for (const period of PERIODS) {
      const report = await demo.getReport(period)
      for (const point of report.series) expect(point.emittedKg + point.avoidedKg).toBe(report.seriesBaselineKg)
      expect(report.series.reduce((sum, point) => sum + point.emittedKg, 0)).toBe(report.emittedKg)
      expect(report.series.reduce((sum, point) => sum + point.avoidedKg, 0)).toBe(report.avoidedKg)
      expect(report.emittedKg + report.avoidedKg).toBe(report.baselineKg)
      expect(report.series.filter((point) => point.current)).toHaveLength(1)
    }
  })

  it('el mes coincide con el diseño: −19 %, 2,84 t emitidas, 4 semanas', () => {
    expect(avoidedPercent(month)).toBe(19)
    expect(month.emittedKg).toBe(2842)
    expect(month.avoidedKg).toBe(658)
    expect(month.series.map((point) => point.label)).toEqual(['SEM 1', 'SEM 2', 'SEM 3', 'SEM 4'])
    expect(month.byDistrict.reduce((sum, row) => sum + row.emittedKg, 0)).toBe(month.emittedKg)
  })

  it('la semana va por día y el trimestre por mes', async () => {
    expect((await demo.getReport('week')).series).toHaveLength(7)
    expect((await demo.getReport('quarter')).series.map((point) => point.label)).toEqual(['AGO', 'SET', 'OCT'])
    expect(avoidedPercent(await demo.getReport('week'))).toBe(21)
    expect(avoidedPercent(await demo.getReport('quarter'))).toBe(16)
  })

  it('el vehículo más intenso es el primero en riesgo', () => {
    expect(intensityLevel(12.4)).toBe('danger')
    expect(intensityLevel(11.3)).toBe('warning')
    expect(intensityLevel(7.5)).toBe('normal')
    expect(intensityLevel(0)).toBe('normal')
  })

  it('sin fuente de datos el reporte avisa en lugar de inventar cifras', async () => {
    await expect(new UnavailableSustainabilityReport().getReport()).rejects.toThrow('aún no tiene fuente de datos')
  })
})

describe('buildReportCsv', () => {
  const rows = parse(buildReportCsv(month))

  it('empieza con BOM UTF-8 y separa filas con CRLF', () => {
    const csv = buildReportCsv(month)
    expect(csv.startsWith('﻿')).toBe(true)
    expect(csv.endsWith('\r\n')).toBe(true)
    expect(rows[0]).toEqual(['Reporte de sostenibilidad'])
    expect(rows[1]).toEqual(['Periodo', 'Mes'])
    expect(rows[2]).toEqual(['Detalle', 'Octubre 2026'])
  })

  it('incluye el resumen con cifras en bruto y su unidad', () => {
    const summary = section(rows, 'Resumen')
    expect(summary[0]).toEqual(['Indicador', 'Valor', 'Unidad'])
    expect(summary).toContainEqual(['CO2 evitado', '658', 'kg'])
    expect(summary).toContainEqual(['CO2 emitido', '2842', 'kg'])
    expect(summary).toContainEqual(['Ahorro frente a la linea base', '19', '%'])
    expect(summary).toContainEqual(['Combustible ahorrado (equivalente diesel)', '245', 'L'])
    expect(summary).toContainEqual(['Km evitados', '6360', 'km'])
    expect(summary).toContainEqual(['Flota de bajas emisiones', '11', 'de 15 vehiculos'])
  })

  it('incluye la serie del gráfico, los distritos y los vehículos del periodo', () => {
    const series = section(rows, 'Emisiones por semana')
    expect(series[0]).toEqual(['Etiqueta', 'CO2 emitido (kg)', 'CO2 evitado (kg)', 'Linea base (kg)'])
    expect(series.slice(1)).toEqual([['SEM 1', '712', '163', '875'], ['SEM 2', '705', '170', '875'], ['SEM 3', '731', '144', '875'], ['SEM 4', '694', '181', '875']])
    const districts = section(rows, 'Por distrito')
    expect(districts[1]).toEqual(['San Juan de Lurigancho', '1020', '21'])
    expect(districts).toHaveLength(5)
    const vehicles = section(rows, 'Por vehiculo')
    expect(vehicles[0]).toEqual(['Placa', 'Combustible', 'Km', 'CO2 (kg)', 'kg de CO2 cada 100 km'])
    expect(vehicles[1]).toEqual(['GJK-112', 'DIESEL', '1950', '241', '12.4'])
    expect(vehicles).toHaveLength(6)
  })

  it('cada periodo exporta sus propios datos', async () => {
    const week = parse(buildReportCsv(await demo.getReport('week')))
    expect(week[1]).toEqual(['Periodo', 'Semana'])
    expect(section(week, 'Emisiones por día')).toHaveLength(8)
    const quarter = parse(buildReportCsv(await demo.getReport('quarter')))
    expect(section(quarter, 'Resumen')).toContainEqual(['CO2 emitido', '8790', 'kg'])
  })

  it('escapa comas y comillas, y neutraliza las fórmulas de hoja de cálculo', () => {
    const tricky: SustainabilityReport = {
      ...month,
      subtitle: 'Octubre, "2026"',
      byDistrict: [{ district: '=HYPERLINK("http://x")', emittedKg: 1, savingPercent: 1 }, { district: '+cmd', emittedKg: 2, savingPercent: 2 }, { district: 'Ate, Lima', emittedKg: 3, savingPercent: 3 }],
    }
    const csv = buildReportCsv(tricky)
    const parsed = parse(csv)
    expect(parsed[2]).toEqual(['Detalle', 'Octubre, "2026"'])
    const districts = section(parsed, 'Por distrito').slice(1)
    expect(districts[0][0]).toBe(`'=HYPERLINK("http://x")`)
    expect(districts[1][0]).toBe("'+cmd")
    expect(districts[2][0]).toBe('Ate, Lima')
    expect(csv).toContain('"Octubre, ""2026"""')
  })
})

describe('reportFilename', () => {
  it('incluye el periodo y el detalle sin tildes ni espacios', async () => {
    expect(reportFilename(month)).toBe('reporte-sostenibilidad-month-octubre-2026.csv')
    expect(reportFilename(await demo.getReport('quarter'))).toBe('reporte-sostenibilidad-quarter-agosto-octubre-2026.csv')
  })
})

describe('GetSustainabilityReport', () => {
  it('pide el reporte del periodo a la fuente', async () => {
    const getReport = vi.fn(async () => month)
    const service = createGetSustainabilityReport({ source: { getReport }, saver: { save: vi.fn() } })
    const controller = new AbortController()

    await expect(service.get('week', controller.signal)).resolves.toBe(month)
    expect(getReport).toHaveBeenCalledWith('week', controller.signal)
  })

  it('exportar entrega a quien descarga el CSV del periodo con su nombre y tipo', () => {
    const save = vi.fn<FileSaver['save']>()
    const service = createGetSustainabilityReport({ source: demo, saver: { save } })

    service.exportCsv(month)

    expect(save).toHaveBeenCalledTimes(1)
    const [filename, content, mime] = save.mock.calls[0]
    expect(filename).toBe(reportFilename(month))
    expect(content).toBe(buildReportCsv(month))
    expect(mime).toBe('text/csv;charset=utf-8')
  })
})
