import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DashboardHeader } from './DashboardHeader'

const base = { day: '2026-10-01', operatingHours: { start: '05:00:00', end: '22:00:00' } }

describe('DashboardHeader', () => {
  it('shows weekday, date, trimmed operating hours and the in-progress badge', () => {
    render(<DashboardHeader {...base} inProgress lastUpdated="14:32" isLoading={false} />)

    expect(screen.getByRole('heading', { level: 1, name: 'Dashboard del día' })).toBeInTheDocument()
    expect(screen.getByText('jueves', { exact: false })).toHaveTextContent('jueves 01/10/2026')
    expect(screen.getByText('05:00–22:00')).toBeInTheDocument()
    expect(screen.getByText('En curso')).toBeInTheDocument()
    expect(screen.getByText('Última actualización:', { exact: false })).toHaveTextContent('14:32')
    expect(screen.getByText('Se actualiza cada 60 s')).toBeInTheDocument()
  })

  it('labels the badge as out of hours when the workday is not in progress', () => {
    render(<DashboardHeader {...base} inProgress={false} lastUpdated="14:32" isLoading={false} />)

    expect(screen.getByText('Fuera de jornada')).toBeInTheDocument()
  })

  it('says it is updating while loading instead of the last update time', () => {
    render(<DashboardHeader {...base} inProgress lastUpdated="14:32" isLoading />)

    expect(screen.getByText('Actualizando…')).toBeInTheDocument()
    expect(screen.queryByText(/Última actualización/)).not.toBeInTheDocument()
  })
})
