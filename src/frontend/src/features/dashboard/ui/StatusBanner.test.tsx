import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { StatusBanner } from './StatusBanner'

describe('StatusBanner', () => {
  it('explains that no routes were generated, as a status message', () => {
    render(<StatusBanner kind="empty" />)

    const banner = screen.getByRole('status')
    expect(banner).toHaveTextContent('No se han generado rutas para la jornada actual')
    expect(banner).toHaveTextContent('Los pedidos registrados ya están disponibles.')
  })

  it('announces a load failure as an alert and retries on click', async () => {
    let retries = 0
    render(<StatusBanner kind="error" onRetry={() => retries++} />)

    expect(screen.getByRole('alert')).toHaveTextContent('No pudimos cargar los indicadores')
    expect(screen.getByText('Revisa tu conexión e inténtalo de nuevo.')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }))

    expect(retries).toBe(1)
  })

  it('tells when the shown data was last updated and offers retry', async () => {
    let retries = 0
    render(<StatusBanner kind="stale" lastUpdated="14:32" onRetry={() => retries++} />)

    expect(screen.getByRole('status')).toHaveTextContent(
      'No se pudo actualizar. Mostrando datos de las 14:32.',
    )
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }))

    expect(retries).toBe(1)
  })
})
