import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DemoDashboardInsights } from '../infrastructure/DemoDashboardInsights'
import { makeSummary } from '../test/fakes'
import { Co2Hero } from './Co2Hero'
import { OrdersHero } from './OrdersHero'
import { RiskList } from './RiskList'

describe('OrdersHero', () => {
  const { orders, windowCompliance } = makeSummary()

  it('shows the total, the delivered share and every status with its count and share', () => {
    render(<OrdersHero state="data" orders={orders} compliance={windowCompliance} />)

    expect(screen.getByText('Pedidos del día')).toBeInTheDocument()
    expect(screen.getByText('1 248')).toBeInTheDocument()
    expect(screen.getByText('pedidos programados · 65,1 % ya entregados')).toBeInTheDocument()
    const delivered = screen.getByText('Entregados').closest('li')!
    expect(within(delivered).getByText('812')).toBeInTheDocument()
    expect(within(delivered).getByText('65,1 %')).toBeInTheDocument()
    const cancelled = screen.getByText('Cancelados').closest('li')!
    expect(within(cancelled).getByText('28')).toBeInTheDocument()
    expect(within(cancelled).getByText('2,2 %')).toBeInTheDocument()
  })

  it('draws a trip status for each state, never color alone', () => {
    const { container } = render(<OrdersHero state="data" orders={orders} compliance={windowCompliance} />)

    for (const status of ['delivered', 'transit', 'pending', 'cancelled']) {
      expect(container.querySelector(`.eco-trip--${status}`)).not.toBeNull()
    }
  })

  it('describes the segmented bar to assistive technology', () => {
    render(<OrdersHero state="data" orders={orders} compliance={windowCompliance} />)

    expect(screen.getByRole('img')).toHaveAccessibleName(
      'Pedidos: 812 entregados, 96 en camino, 312 pendientes, 28 cancelados, de 1248',
    )
  })

  it('exposes the window compliance as a meter with its goal', () => {
    render(<OrdersHero state="data" orders={orders} compliance={windowCompliance} />)

    const meter = screen.getByRole('meter')
    expect(meter).toHaveAttribute('aria-valuenow', '92.4')
    expect(meter).toHaveAttribute('aria-valuetext', '92,4 % dentro de ventana, meta 90 %')
    expect(screen.getByText('751 de 813 entregas a tiempo')).toBeInTheDocument()
    expect(screen.getByText('dentro de ventana · meta 90 %', { exact: false })).toBeInTheDocument()
  })

  it('omits the goal when there is no target and says so when nothing was evaluated', () => {
    const { rerender } = render(<OrdersHero state="data" orders={orders} compliance={{ ...windowCompliance, target: null }} />)
    expect(screen.getByRole('meter')).toHaveAttribute('aria-valuetext', '92,4 % dentro de ventana')
    expect(screen.queryByText(/meta/)).toBeNull()

    rerender(<OrdersHero state="data" orders={orders} compliance={{ ...windowCompliance, percentage: null }} />)
    expect(screen.queryByRole('meter')).toBeNull()
    expect(screen.getByText('Cumplimiento de ventanas: sin entregas evaluadas')).toBeInTheDocument()
  })

  it('offers to find an order only when it can navigate', async () => {
    const onFindOrder = vi.fn()
    const { rerender } = render(<OrdersHero state="data" orders={orders} compliance={windowCompliance} />)
    expect(screen.queryByRole('button', { name: 'Buscar pedido' })).toBeNull()

    rerender(<OrdersHero state="data" orders={orders} compliance={windowCompliance} onFindOrder={onFindOrder} />)
    await userEvent.click(screen.getByRole('button', { name: 'Buscar pedido' }))
    expect(onFindOrder).toHaveBeenCalledTimes(1)
  })

  it('renders hidden skeletons while loading and a dash with a label on error', () => {
    const { container, rerender } = render(<OrdersHero state="loading" />)
    expect(container.querySelectorAll('[data-sk]').length).toBeGreaterThan(0)
    expect(screen.queryByText('Entregados')).toBeNull()

    rerender(<OrdersHero state="error" />)
    expect(screen.getByText('sin dato')).toBeInTheDocument()
  })
})

describe('Co2Hero', () => {
  it('leads with the avoided percentage and shows the facts and the weekly bars', async () => {
    const avoided = (await new DemoDashboardInsights().getInsights()).co2Avoided
    const { container } = render(<Co2Hero state="data" avoided={avoided} fleetDistanceKm={1284} co2Kg={95} />)

    expect(screen.getByText('CO₂ evitado hoy')).toBeInTheDocument()
    expect(screen.getByText('−19 %')).toBeInTheDocument()
    expect(screen.getByText('de emisiones frente a rutas sin optimizar')).toBeInTheDocument()
    expect(screen.getByText('22 kg')).toBeInTheDocument()
    expect(screen.getByText('9 L')).toBeInTheDocument()
    expect(screen.getByText('−212 km')).toBeInTheDocument()
    expect(screen.getByText('95,0 kg')).toBeInTheDocument()
    expect(screen.getByText('1 284,0 km')).toBeInTheDocument()
    expect(screen.getByRole('img')).toHaveAccessibleName('Kg evitados por día: 17, 19, 15, 21, 23, 18, y hoy 22')
    expect(container.querySelectorAll('.eco-bars__bar')).toHaveLength(7)
    expect(container.querySelectorAll('.eco-bars__bar--today')).toHaveLength(1)
    expect(screen.getByText('HOY')).toBeInTheDocument()
  })

  it('still shows the real distance and estimate when there is no avoided-CO₂ source', () => {
    render(<Co2Hero state="data" avoided={null} fleetDistanceKm={3482.6} co2Kg={912.4} unavailable="Aún no hay cálculo de CO₂ evitado" />)

    expect(screen.getByText('sin dato')).toBeInTheDocument()
    expect(screen.getByText('Aún no hay cálculo de CO₂ evitado')).toBeInTheDocument()
    expect(screen.getByText('3 482,6 km')).toBeInTheDocument()
    expect(screen.getByText('912,4 kg')).toBeInTheDocument()
    expect(screen.queryByText(/evitados hoy/)).toBeNull()
  })

  it('renders hidden skeletons while loading', () => {
    const { container } = render(<Co2Hero state="loading" avoided={null} />)
    expect(container.querySelectorAll('[data-sk]').length).toBeGreaterThan(0)
  })
})

describe('RiskList', () => {
  it('lists the orders at risk with window and status and reports the chosen one', async () => {
    const insights = await new DemoDashboardInsights().getInsights()
    const onSelect = vi.fn()
    render(<RiskList status="ready" insights={insights} selectedId="PED-0044" onSelect={onSelect} />)

    expect(screen.getByRole('heading', { name: 'Pedidos en riesgo' })).toBeInTheDocument()
    expect(screen.getByText('vence en < 60 min')).toBeInTheDocument()
    const rows = within(screen.getByRole('grid', { name: 'Pedidos en riesgo' })).getAllByRole('row')
    expect(rows).toHaveLength(3)
    expect(rows[1]).toHaveAttribute('aria-selected', 'true')
    expect(within(rows[0]).getByText('09:00–11:00')).toBeInTheDocument()
    expect(within(rows[2]).getByText('sin conductor')).toBeInTheDocument()
    expect(screen.getByText('Sugerencia')).toBeInTheDocument()

    await userEvent.click(rows[0])
    expect(onSelect).toHaveBeenCalledWith('PED-0022')
  })

  it('explains each non-ready state instead of an empty list', () => {
    const { rerender } = render(<RiskList status="unavailable" insights={null} onSelect={() => {}} />)
    expect(screen.getByText('Sin datos de ventanas.')).toBeInTheDocument()

    rerender(<RiskList status="error" insights={null} onSelect={() => {}} />)
    expect(screen.getByRole('alert')).toHaveTextContent('No pudimos consultar los pedidos en riesgo')

    rerender(<RiskList status="loading" insights={null} onSelect={() => {}} />)
    expect(screen.getByText('Cargando pedidos en riesgo…')).toBeInTheDocument()

    rerender(<RiskList status="ready" insights={{ co2Avoided: null, atRisk: [], riskMinutes: 60, suggestion: null }} onSelect={() => {}} />)
    expect(screen.getByText('Sin pedidos en riesgo.')).toBeInTheDocument()
  })
})
