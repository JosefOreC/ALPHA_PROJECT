import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { createGetSustainabilityReport } from '../application/getSustainabilityReport'
import { buildReportCsv } from '../application/getSustainabilityReport'
import type { FileSaver } from '../domain/ports/fileSaver'
import { DemoSustainabilityReport, UnavailableSustainabilityReport } from '../infrastructure/demoSustainability'
import { BrowserFileSaver } from '../infrastructure/browserFileSaver'
import { niceTick } from './sustainability/chartScale'
import { SustainabilityView } from './SustainabilityView'

const setup = (saver: FileSaver = { save: vi.fn() }) => {
  const service = createGetSustainabilityReport({ source: new DemoSustainabilityReport(), saver })
  return { saver, ...render(<SustainabilityView service={service} />) }
}

describe('niceTick', () => {
  it('elige la guía 1, 2 o 5 × 10ⁿ bajo el 60 % de la línea base', () => {
    expect(niceTick(875)).toBe(500)
    expect(niceTick(125)).toBe(50)
    expect(niceTick(3500)).toBe(2000)
    expect(niceTick(10500)).toBe(5000)
    expect(niceTick(0)).toBe(0)
  })
})

describe('SustainabilityView', () => {
  it('abre con el rol Responsable de Logística, el mes y el resumen del periodo', async () => {
    setup()
    expect(await screen.findByRole('heading', { name: 'Reporte de sostenibilidad' })).toBeInTheDocument()
    expect(screen.getByText('Resp. de Logística')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Sostenibilidad/ })).toHaveAttribute('aria-current', 'page')
    expect(screen.queryByRole('link', { name: /Flota/ })).toBeNull()
    expect(screen.getByText('Octubre 2026 · flota de DistriRápido · línea base 3,5 t de CO₂ al mes')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Mes', pressed: true })).toBeInTheDocument()

    const summary = screen.getByRole('region', { name: 'Resumen del periodo' })
    expect(summary).toHaveTextContent('CO₂ evitado658 kg−19 % frente a la línea base')
    expect(summary).toHaveTextContent('CO₂ emitido2,84 tserían 3,50 t sin optimizar')
    expect(summary).toHaveTextContent('245 L')
    expect(summary).toHaveTextContent('6 360 km')
    expect(summary).toHaveTextContent('73 %11 de 15')
  })

  it('dibuja el gráfico por semana, con la descripción accesible y la barra actual', async () => {
    const { container } = setup()
    const chart = await screen.findByRole('img', { name: /CO₂ emitido por semana/ })
    expect(chart).toHaveAccessibleName('CO₂ emitido por semana: 712, 705, 731 y 694 kg; línea base 875 kg; evitado 163, 170, 144 y 181 kg')
    expect(container.querySelectorAll('.eco-chart rect.bar')).toHaveLength(4)
    expect(container.querySelectorAll('.eco-chart rect.bar--now')).toHaveLength(1)
    expect(within(chart as unknown as HTMLElement).getByText('SEM 4')).toBeInTheDocument()
    expect(within(chart as unknown as HTMLElement).getByText('línea base 875')).toBeInTheDocument()
    expect(screen.getByText('Línea base (rutas sin optimizar)')).toBeInTheDocument()
  })

  it('lista los distritos y ordena los vehículos por intensidad con su nivel', async () => {
    setup()
    const districts = await screen.findByRole('grid', { name: 'Emisiones por distrito' })
    expect(within(districts).getByText('San Juan de Lurigancho')).toBeInTheDocument()
    expect(within(districts).getByText('1,02 t')).toBeInTheDocument()
    expect(within(districts).getByText('−21 %')).toBeInTheDocument()

    const vehicles = screen.getByRole('grid', { name: 'Emisiones por vehículo' })
    const plates = within(vehicles).getAllByRole('row').slice(1).map((row) => within(row).getAllByText(/-\d{3}$/)[0].textContent)
    expect(plates).toEqual(['GJK-112', 'BCD-456', 'ABC-123', 'EGH-567', 'HKL-345'])
    expect(within(vehicles).getAllByRole('img')[0]).toHaveAccessibleName('Intensidad crítica')
    expect(within(vehicles).getAllByRole('img')[1]).toHaveAccessibleName('Intensidad de atención')
    expect(within(vehicles).getAllByRole('img')[2]).toHaveAccessibleName('Intensidad normal')
    expect(within(vehicles).getByText('GNV')).toHaveClass('eco-tag--eco')
    expect(within(vehicles).getAllByText('Diésel')[0]).not.toHaveClass('eco-tag--eco')
    expect(screen.getByText('Oportunidad')).toBeInTheDocument()
  })

  it('cambiar de periodo recarga el reporte y su gráfico', async () => {
    const user = userEvent.setup()
    const { container } = setup()
    await screen.findByText('SEM 1')

    await user.click(screen.getByRole('button', { name: 'Semana' }))
    expect(await screen.findByText('Semana 4 de octubre · flota de DistriRápido · línea base 3,5 t de CO₂ al mes')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Semana', pressed: true })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'CO₂ emitido por día' })).toBeInTheDocument()
    expect(container.querySelectorAll('.eco-chart rect.bar')).toHaveLength(7)
    expect(screen.getByRole('region', { name: 'Resumen del periodo' })).toHaveTextContent('181 kg−21 %')

    await user.click(screen.getByRole('button', { name: 'Trimestre' }))
    expect(await screen.findByRole('heading', { name: 'CO₂ emitido por mes' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Resumen del periodo' })).toHaveTextContent('1,71 t−16 %')
    expect(screen.getByText('OCT')).toBeInTheDocument()
  })

  it('Exportar CSV descarga los datos del periodo que se está viendo', async () => {
    const user = userEvent.setup()
    const save = vi.fn<FileSaver['save']>()
    setup({ save })
    await screen.findByText('SEM 1')

    await user.click(screen.getByRole('button', { name: 'Exportar CSV' }))
    expect(save).toHaveBeenCalledTimes(1)
    const [filename, content, mime] = save.mock.calls[0]
    expect(filename).toBe('reporte-sostenibilidad-month-octubre-2026.csv')
    expect(mime).toBe('text/csv;charset=utf-8')
    expect(content).toContain('Reporte de sostenibilidad')
    expect(content).toContain('SEM 4,694,181,875')

    await user.click(screen.getByRole('button', { name: 'Semana' }))
    await screen.findByText('LUN')
    await user.click(screen.getByRole('button', { name: 'Exportar CSV' }))
    expect(save).toHaveBeenCalledTimes(2)
    expect(save.mock.calls[1][0]).toBe('reporte-sostenibilidad-week-semana-4-de-octubre.csv')
    expect(save.mock.calls[1][1]).toContain('LUN,101,24,125')
  })

  it('si no se puede escribir el archivo avisa sin romper la pantalla', async () => {
    const user = userEvent.setup()
    setup({ save: () => { throw new Error('bloqueado') } })
    await screen.findByText('SEM 1')

    await user.click(screen.getByRole('button', { name: 'Exportar CSV' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo generar el archivo CSV')
    expect(screen.getByText('SEM 1')).toBeInTheDocument()
  })

  it('sin fuente de datos muestra el error, deshabilita la exportación y permite reintentar', async () => {
    const user = userEvent.setup()
    const service = createGetSustainabilityReport({ source: new UnavailableSustainabilityReport(), saver: { save: vi.fn() } })
    render(<SustainabilityView service={service} />)

    expect(await screen.findByRole('alert')).toHaveTextContent('aún no tiene fuente de datos')
    expect(screen.getByRole('button', { name: 'Exportar CSV' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(await screen.findByRole('alert')).toBeInTheDocument()
  })

  it('navega por la barra superior', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    const service = createGetSustainabilityReport({ source: new DemoSustainabilityReport(), saver: { save: vi.fn() } })
    render(<SustainabilityView service={service} onNavigate={onNavigate} />)
    await screen.findByText('SEM 1')

    await user.click(screen.getByRole('link', { name: /Dashboard del día/ }))
    expect(onNavigate).toHaveBeenCalledWith('dashboard', '/')
  })
})

describe('BrowserFileSaver', () => {
  it('crea un enlace de descarga con el nombre y el contenido, y libera el archivo temporal', async () => {
    const created: Blob[] = []
    const createObjectURL = vi.fn((blob: Blob) => { created.push(blob); return 'blob:prueba' })
    const revokeObjectURL = vi.fn()
    vi.stubGlobal('URL', Object.assign(URL, { createObjectURL, revokeObjectURL }))
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      expect(this.download).toBe('datos.csv')
      expect(this.href).toBe('blob:prueba')
    })

    new BrowserFileSaver().save('datos.csv', buildReportCsv(await new DemoSustainabilityReport().getReport('month')), 'text/csv;charset=utf-8')

    expect(click).toHaveBeenCalledTimes(1)
    expect(created[0].type).toBe('text/csv;charset=utf-8')
    expect(await created[0].text()).toContain('Reporte de sostenibilidad')
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:prueba')
    expect(document.querySelector('a[download]')).toBeNull()
    click.mockRestore()
    vi.unstubAllGlobals()
  })
})
