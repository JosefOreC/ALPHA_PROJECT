import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DemoDashboardInsights } from '../infrastructure/DemoDashboardInsights'
import { emptySummary, makeScriptedGateway, makeSummary } from '../test/fakes'
import { Co2Hero } from './Co2Hero'
import { DashboardPage } from './DashboardPage'
import { OperationalMetrics } from './OperationalMetrics'
import { ProjectIndicators } from './ProjectIndicators'

describe('Indicadores alineados con los objetivos', () => {
  it('calcula intensidad sobre la distancia planificada y conserva las unidades del equivalente diésel', async () => {
    const insights = await new DemoDashboardInsights().getInsights()
    render(<OperationalMetrics state="data" summary={makeSummary({ co2Kg: 100, fleetDistanceKm: 200 })} insights={insights} />)
    expect(screen.getByRole('article', { name: 'Intensidad de emisiones' })).toHaveTextContent('0,5kg CO₂/km')
    expect(screen.getByRole('article', { name: 'Combustible equivalente' })).toHaveTextContent('9L')
    expect(screen.getByRole('article', { name: 'Combustible equivalente' })).toHaveTextContent('Ahorro equivalente en diésel, estimado')
    expect(screen.getByRole('article', { name: 'Entregas a tiempo' })).toHaveTextContent('Meta 90 %')
  })

  it('no convierte ausencia de recorridos y líneas base en un resultado logrado', () => {
    render(<><OperationalMetrics state="data" summary={emptySummary()} insights={null} /><ProjectIndicators summary={null} insights={null} /></>)
    expect(screen.getByRole('article', { name: 'Intensidad de emisiones' })).toHaveTextContent('sin dato')
    expect(screen.getByRole('article', { name: 'Entregas a tiempo' })).toHaveTextContent('Aún no hay entregas evaluadas')
    expect(screen.getByRole('article', { name: 'Combustible equivalente' })).toHaveTextContent('Requiere línea base')
    // The goals are disclosed, not shown as measured application performance.
    expect(screen.getAllByText('Sin medición de tiempo disponible')).toHaveLength(2)
    expect(screen.getByText('Sin historial de disponibilidad disponible')).toBeInTheDocument()
    expect(screen.getByText('Sin costos operativos registrados')).toBeInTheDocument()
    expect(screen.getByText('Sin comparación disponible')).toBeInTheDocument()
  })

  it('muestra el tiempo medido de generación solo cuando existen aprobaciones registradas', async () => {
    const insights = await new DemoDashboardInsights().getInsights()
    render(<ProjectIndicators summary={null} insights={{ ...insights, generation: { targetSeconds: 45, lastSeconds: 2.14, maxSeconds: 38.4, samples: 5, withinTarget: 5 } }} />)
    expect(screen.getByText(/Última 2,1 s · máximo 38,4 s · 5 de 5 dentro del objetivo/)).toBeInTheDocument()
    // La reoptimización no se ejecuta todavía en el producto, por lo que sigue sin medición.
    expect(screen.getAllByText('Sin medición de tiempo disponible')).toHaveLength(1)
  })

  it('presenta carga y error sin reutilizar cifras como valores actuales', () => {
    const view = render(<OperationalMetrics state="loading" summary={null} insights={null} />)
    expect(screen.getAllByLabelText('Cargando valor')).toHaveLength(4)
    view.rerender(<OperationalMetrics state="error" summary={makeSummary()} insights={null} />)
    expect(screen.getAllByText('No se pudo cargar este indicador')).toHaveLength(4)
    expect(screen.getAllByText('sin dato')).toHaveLength(4)
  })

  it('distingue menor puntualidad y consumo adicional de los ahorros', async () => {
    const insights = await new DemoDashboardInsights().getInsights()
    const avoided = { ...insights.co2Avoided!, fuelSavedLiters: -5, avoidedKg: -10, avoidedPercent: -20,
      weekly: [{ label: 'V', avoidedKg: -10, today: true }] }
    render(<><OperationalMetrics state="data" summary={makeSummary({ windowCompliance: { evaluated: 10, withinWindow: 5, percentage: 50, target: 90 } })} insights={{ ...insights, co2Avoided: avoided }} />
      <Co2Hero state="data" avoided={avoided} /><ProjectIndicators summary={makeSummary()} insights={{ ...insights, co2Avoided: avoided }} /></>)
    expect(screen.getByRole('article', { name: 'Entregas a tiempo' })).toHaveClass('eco-dash-metric--attention')
    expect(screen.getByRole('article', { name: 'Combustible equivalente' })).toHaveTextContent('Consumo adicional')
    expect(screen.getByText('CO₂ adicional hoy')).toBeInTheDocument()
    expect(screen.getByText('+20 %')).toBeInTheDocument()
    expect(screen.getByText('adicionales hoy')).toBeInTheDocument()
    expect(screen.getByTitle('V: -10 kg de CO₂ evitados')).toHaveStyle({ height: '100%' })
    expect(screen.getByText('5 L equivalentes de diésel adicionales')).toBeInTheDocument()
    expect(screen.getByText('10 kg de CO₂ adicionales')).toBeInTheDocument()
  })

  it('expone los indicadores disponibles sin afirmar metas de tiempo, costo o disponibilidad', async () => {
    const insights = await new DemoDashboardInsights().getInsights()
    const user = userEvent.setup()
    render(<ProjectIndicators summary={makeSummary()} insights={insights} />)
    await user.click(screen.getByText('Objetivos del proyecto', { exact: true }))
    expect(screen.getByText('92,4 % dentro de ventana')).toBeVisible()
    expect(screen.getByText('9 L equivalentes de diésel ahorrados')).toBeVisible()
    expect(screen.getByText('22 kg de CO₂ evitados')).toBeVisible()
    expect(screen.getByText('≥ 99,5 % en horario operativo')).toBeVisible()
    expect(screen.getByText('Requiere evaluación periódica')).toBeVisible()
  })

  it('actualiza resumen e indicadores complementarios desde el mismo control', async () => {
    const { gateway } = makeScriptedGateway([makeSummary()])
    const summary = vi.spyOn(gateway, 'getSummary')
    const insights = new DemoDashboardInsights()
    const extras = vi.spyOn(insights, 'getInsights')
    render(<DashboardPage gateway={gateway} insights={insights} />)
    await screen.findByText('Entregados')
    await userEvent.click(screen.getByRole('button', { name: 'Actualizar' }))
    expect(summary).toHaveBeenCalledTimes(2)
    expect(extras).toHaveBeenCalledTimes(2)
    expect(within(screen.getByRole('article', { name: 'Entregas a tiempo' })).getByText('92,4')).toBeInTheDocument()
  })
})
