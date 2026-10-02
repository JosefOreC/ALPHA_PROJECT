import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { makeSummary } from '../test/fakes'
import { MetricCard } from './MetricCard'
import { OrdersCard } from './OrdersCard'
import { WindowComplianceCard } from './WindowComplianceCard'

describe('OrdersCard', () => {
  const orders = makeSummary().orders

  it('shows delivered of total and a legend with counts and shares per status', () => {
    render(<OrdersCard state="data" orders={orders} />)

    expect(screen.getByRole('heading', { name: 'Pedidos' })).toBeInTheDocument()
    expect(screen.getByText('entregados de', { exact: false })).toHaveTextContent(
      'entregados de 1,248',
    )
    const delivered = screen.getByText('Entregados').closest('li')!
    expect(within(delivered).getByText('812')).toBeInTheDocument()
    expect(within(delivered).getByText('65.1 %')).toBeInTheDocument()
    const cancelled = screen.getByText('Cancelados').closest('li')!
    expect(within(cancelled).getByText('2.2 %')).toBeInTheDocument()
  })

  it('describes the segmented bar to assistive technology', () => {
    render(<OrdersCard state="data" orders={orders} />)

    expect(screen.getByRole('img')).toHaveAccessibleName(
      'Pedidos: 812 entregados, 96 en camino, 312 pendientes, 28 cancelados, de 1248',
    )
  })

  it('renders hidden skeletons while loading', () => {
    const { container } = render(<OrdersCard state="loading" />)

    expect(container.querySelectorAll('[data-sk]').length).toBeGreaterThan(0)
    expect(screen.queryByText('Entregados')).not.toBeInTheDocument()
  })

  it('shows a dash with a screen-reader label when there is no data', () => {
    render(<OrdersCard state="error" />)

    expect(screen.getByText('sin dato')).toBeInTheDocument()
  })
})

describe('WindowComplianceCard', () => {
  const compliance = makeSummary().windowCompliance

  it('exposes the percentage as a meter with a descriptive value text', () => {
    render(<WindowComplianceCard state="data" compliance={compliance} />)

    const meter = screen.getByRole('meter')
    expect(meter).toHaveAttribute('aria-valuenow', '92.4')
    expect(meter).toHaveAttribute('aria-valuetext', '92.4 % dentro de ventana, meta 90 %')
    expect(screen.getByText('Meta 90 %')).toBeInTheDocument()
    expect(screen.getByText('entregas a tiempo', { exact: false })).toHaveTextContent(
      '751 de 813 entregas a tiempo',
    )
  })

  it('hides the goal marker and label when there is no target', () => {
    render(<WindowComplianceCard state="data" compliance={{ ...compliance, target: null }} />)

    expect(screen.getByRole('meter')).toHaveAttribute('aria-valuetext', '92.4 % dentro de ventana')
    expect(screen.queryByText(/Meta/)).not.toBeInTheDocument()
  })
})

describe('MetricCard', () => {
  it('shows the value with one decimal, its unit and an accessible reading', () => {
    render(
      <MetricCard
        title="Distancia total de la flota"
        state="data"
        value={3482.6}
        unit="km"
        srUnit="kilómetros"
      />,
    )

    expect(
      screen.getByRole('heading', { name: 'Distancia total de la flota' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('3,482.6 kilómetros')).toHaveTextContent('3,482.6')
    expect(screen.getByText('km')).toBeInTheDocument()
  })

  it('renders a note under the value only when provided', () => {
    render(
      <MetricCard
        title="CO₂ estimado"
        state="data"
        value={912.4}
        unit="kg"
        srUnit="kilogramos"
        note="Estimado a partir de la distancia de la flota"
      />,
    )

    expect(screen.getByText('Estimado a partir de la distancia de la flota')).toBeInTheDocument()
  })
})
