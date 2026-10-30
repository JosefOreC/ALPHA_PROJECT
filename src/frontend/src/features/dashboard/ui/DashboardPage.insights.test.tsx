import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DemoDashboardInsights } from '../infrastructure/DemoDashboardInsights'
import { makeScriptedGateway, makeSummary } from '../test/fakes'
import { DashboardPage } from './DashboardPage'

describe('DashboardPage with the design pieces', () => {
  it('opens with the logistics role, only its modules and a read-only sustainability shortcut', async () => {
    const { gateway } = makeScriptedGateway([makeSummary()])
    render(<DashboardPage gateway={gateway} />)

    expect(await screen.findByText('Pedidos del día')).toBeInTheDocument()
    const nav = screen.getByRole('complementary', { name: 'Navegación principal' })
    expect(within(nav).getByText('Resp. de Logística')).toBeInTheDocument()
    expect(within(nav).getByRole('link', { name: /Dashboard del día/ })).toHaveAttribute('aria-current', 'page')
    expect(within(nav).getByRole('link', { name: /Sostenibilidad/ })).toBeInTheDocument()
    expect(within(nav).getByRole('link', { name: /Flota/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Reporte de sostenibilidad' })).toBeInTheDocument()
    expect(screen.getByText('JUE 01 OCT', { exact: false })).toBeInTheDocument()
  })

  it('shows the orders and CO₂ heroes side by side with the avoided CO₂ from the insights', async () => {
    const { gateway } = makeScriptedGateway([makeSummary()])
    const { container } = render(<DashboardPage gateway={gateway} insights={new DemoDashboardInsights()} />)

    expect(await screen.findByText('−19 %')).toBeInTheDocument()
    expect(container.querySelector('.eco-hero-row .eco-hero--orders')).not.toBeNull()
    expect(container.querySelectorAll('.eco-hero-row > .eco-hero')).toHaveLength(2)
    expect(screen.getByText('CO₂ evitado hoy')).toBeInTheDocument()
    expect(screen.getByText('Sugerencia')).toBeInTheDocument()
    expect(screen.getByText('Pedidos en riesgo')).toBeInTheDocument()
  })

  it('says the sections have no data when no insights source is configured', async () => {
    const { gateway } = makeScriptedGateway([makeSummary()])
    render(<DashboardPage gateway={gateway} />)

    expect(await screen.findByText('Aún no hay cálculo de CO₂ evitado')).toBeInTheDocument()
    expect(screen.getByText('Sin datos de ventanas.')).toBeInTheDocument()
    expect(screen.queryByText('Rutas en vivo')).toBeNull()
  })

  it('shares the selection between the at-risk list and the map slot', async () => {
    const { gateway } = makeScriptedGateway([makeSummary()])
    const seen: Array<string | undefined> = []
    render(
      <DashboardPage
        gateway={gateway}
        insights={new DemoDashboardInsights()}
        renderMap={({ selectedId, onSelect }) => {
          seen.push(selectedId)
          return (
            <div>
              <p>mapa:{selectedId ?? 'nada'}</p>
              <button type="button" onClick={() => onSelect('PED-0052')}>pin PED-0052</button>
            </div>
          )
        }}
      />,
    )

    expect(await screen.findByText('mapa:nada')).toBeInTheDocument()
    expect(screen.getByText('Rutas en vivo')).toBeInTheDocument()
    expect(screen.getByText('Solo lectura · lo opera el Planificador')).toBeInTheDocument()

    await userEvent.click(await screen.findByRole('row', { name: /PED-0044/ }))
    expect(screen.getByText('mapa:PED-0044')).toBeInTheDocument()
    expect(screen.getByRole('row', { name: /PED-0044/ })).toHaveAttribute('aria-selected', 'true')

    await userEvent.click(screen.getByRole('button', { name: 'pin PED-0052' }))
    expect(screen.getByRole('row', { name: /PED-0052/ })).toHaveAttribute('aria-selected', 'true')
    expect(seen.at(-1)).toBe('PED-0052')
  })

  it('navigates through the shell, the sustainability shortcut and the order finder', async () => {
    const onNavigate = vi.fn()
    const { gateway } = makeScriptedGateway([makeSummary()])
    render(<DashboardPage gateway={gateway} onNavigate={onNavigate} />)

    await userEvent.click(await screen.findByRole('link', { name: 'Reporte de sostenibilidad' }))
    expect(onNavigate).toHaveBeenLastCalledWith('sostenibilidad', '/?vista=sostenibilidad')

    await userEvent.click(screen.getByRole('button', { name: 'Buscar pedido' }))
    expect(onNavigate).toHaveBeenLastCalledWith('pedidos', '/?vista=pedidos')
  })

  it('omite avisos de demostración en la interfaz', async () => {
    const { gateway } = makeScriptedGateway([makeSummary()])
    render(<DashboardPage gateway={gateway} demoNote="Modo demo · ejemplo" />)

    expect(await screen.findByRole('heading', { name: 'Dashboard del día' })).toBeInTheDocument()
    expect(screen.queryByText('Modo demo · ejemplo')).toBeNull()
  })
})
