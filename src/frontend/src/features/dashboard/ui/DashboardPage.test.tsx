import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  emptySummary,
  makeControlledGateway,
  makeScriptedGateway,
  makeSummary,
} from '../test/fakes'
import { DashboardPage } from './DashboardPage'

afterEach(() => vi.unstubAllGlobals())

describe('DashboardPage', () => {
  it('shows busy skeletons while loading, then the indicators', async () => {
    const { gateway, calls } = makeControlledGateway()
    const { container } = render(<DashboardPage gateway={gateway} />)

    expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument()
    expect(screen.getByText('Cargando indicadores')).toBeInTheDocument()
    expect(screen.getByText('Actualizando…')).toBeInTheDocument()

    calls[0].resolve(makeSummary())

    expect(await screen.findByText('Entregados')).toBeInTheDocument()
    expect(container.querySelector('[aria-busy="true"]')).not.toBeInTheDocument()
    expect(screen.getByText('3 482,6 km')).toBeInTheDocument()
    expect(screen.getByText('912,4 kg')).toBeInTheDocument()
    expect(screen.getByRole('meter')).toHaveAttribute('aria-valuenow', '92.4')
    expect(screen.getByText('En curso')).toBeInTheDocument()
  })

  it('tells there are no routes while keeping the zeroed indicators', async () => {
    const { gateway } = makeScriptedGateway([emptySummary()])
    render(<DashboardPage gateway={gateway} />)

    expect(
      await screen.findByText('No se han generado rutas para la jornada actual'),
    ).toBeInTheDocument()
    expect(screen.getByText('Entregados')).toBeInTheDocument()
  })

  it('shows an alert with dashes on a failed first load and recovers on retry', async () => {
    const { gateway } = makeScriptedGateway([new Error('down'), makeSummary()])
    render(<DashboardPage gateway={gateway} />)

    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos cargar los indicadores')
    expect(screen.getAllByText('sin dato').length).toBeGreaterThan(0)

    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }))

    expect(await screen.findByText('Entregados')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('keeps showing the last data with a warning when a refresh fails', async () => {
    const { gateway } = makeScriptedGateway([makeSummary(), new Error('down')])
    render(<DashboardPage gateway={gateway} refreshMs={20} />)

    const banner = await screen.findByText(
      (_, el) =>
        el?.tagName === 'P' &&
        /^No se pudo actualizar\. Mostrando datos de las \d{2}:\d{2}\.$/.test(el.textContent ?? ''),
    )
    expect(banner).toBeInTheDocument()
    expect(screen.getByText('Entregados')).toBeInTheDocument()
  })

  it('reloads for the chosen district and announces it in a polite live region', async () => {
    const { gateway, calls } = makeScriptedGateway([
      makeSummary(),
      makeSummary({ districtId: '150103' }),
    ])
    render(<DashboardPage gateway={gateway} />)
    await screen.findByText('Entregados')

    await userEvent.selectOptions(screen.getByLabelText('Distrito'), 'Ate')

    const announcement = await screen.findByText('Indicadores actualizados para Ate.')
    expect(announcement).toHaveAttribute('aria-live', 'polite')
    expect(calls.at(-1)).toEqual({ districtId: '150103' })
    expect(within(screen.getByRole('search')).getByText('Ate', { selector: 'strong' })).toBeInTheDocument()
  })

  it('uses the dark theme when the system prefers it', () => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query.includes('dark'),
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }))
    const { gateway } = makeScriptedGateway([makeSummary()])
    const { container } = render(<DashboardPage gateway={gateway} />)

    expect(container.firstElementChild).toHaveAttribute('data-theme', 'dark')
  })
})
