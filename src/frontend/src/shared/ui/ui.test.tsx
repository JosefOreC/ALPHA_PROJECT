import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AppShell, Banner, ListGroup, ListRow, SearchInput, Switch, TripStatus, UnitStatus, modulesForRole } from '.'
import type { Role } from '.'
import userEvent from '@testing-library/user-event'

describe('TripStatus', () => {
  it.each([
    ['pending', 'Pendiente'],
    ['transit', 'En camino'],
    ['delivered', 'Entregado'],
    ['cancelled', 'Cancelado'],
  ] as const)('%s lleva clase y palabra, no solo color', (status, word) => {
    const { container } = render(<TripStatus status={status} />)
    expect(container.querySelector(`.eco-trip--${status}`)).not.toBeNull()
    expect(screen.getByText(word)).toBeInTheDocument()
  })

  it('admite etiqueta propia, contexto y versión ancha', () => {
    const { container } = render(<TripStatus status="transit" label="En ruta" meta="10:55" wide />)
    expect(container.querySelector('.eco-trip--lg')).not.toBeNull()
    expect(screen.getByText('10:55')).toHaveClass('eco-trip__meta')
    expect(screen.getByText(/En ruta/)).toBeInTheDocument()
  })
})

describe('UnitStatus', () => {
  it.each([
    ['ready', 'Disponible'],
    ['moving', 'En ruta'],
    ['service', 'Mantenimiento'],
    ['off', 'Inactivo'],
  ] as const)('%s lleva clase y palabra', (status, word) => {
    const { container } = render(<UnitStatus status={status} />)
    expect(container.querySelector(`.eco-unit--${status}`)).not.toBeNull()
    expect(screen.getByText(word)).toBeInTheDocument()
  })
})

describe('módulos por rol', () => {
  const ids = (role: Role) => modulesForRole(role).map((m) => m.id)

  it('cada rol ve solo sus módulos', () => {
    expect(ids('planner')).toEqual(['pedidos', 'rutas', 'flota'])
    expect(ids('logistics')).toEqual(['dashboard', 'sostenibilidad'])
    expect(ids('driver')).toEqual(['mi-ruta', 'pedido-actual', 'incidencias'])
    expect(ids('admin')).toEqual(['dashboard', 'pedidos', 'rutas', 'flota', 'sostenibilidad', 'admin'])
  })

  it('el planificador no ve Administración ni Sostenibilidad', () => {
    expect(ids('planner')).not.toContain('admin')
    expect(ids('planner')).not.toContain('sostenibilidad')
  })

  it('AppShell pinta solo los módulos del rol y marca el actual', () => {
    render(
      <AppShell role="logistics" current="sostenibilidad" user={{ name: 'Mariela Vargas', initials: 'MV' }} title="Sostenibilidad">
        <p>contenido</p>
      </AppShell>,
    )
    const nav = screen.getByRole('complementary', { name: 'Navegación principal' })
    expect(within(nav).getByRole('link', { name: /Dashboard del día/ })).toBeInTheDocument()
    expect(within(nav).getByRole('link', { name: /Sostenibilidad/ })).toHaveAttribute('aria-current', 'page')
    expect(within(nav).queryByRole('link', { name: /Flota/ })).toBeNull()
    expect(within(nav).getByText('Resp. de Logística')).toBeInTheDocument()
    expect(screen.getByText('contenido')).toBeInTheDocument()
  })

  it('AppShell muestra la meta de CO₂ del mes con miles separados por espacio', () => {
    render(
      <AppShell role="planner" current="pedidos" user={{ name: 'Beto P.', initials: 'BP' }} title="Pedidos y rutas" co2={{ valueKg: 1284, goalKg: 1500 }}>
        <p>x</p>
      </AppShell>,
    )
    expect(screen.getByText(/1 284 kg/)).toBeInTheDocument()
    expect(screen.getByRole('img', { name: '86 por ciento de la meta mensual' })).toBeInTheDocument()
  })
})

describe('componentes base', () => {
  it('ListGroup pliega y expone aria-expanded', async () => {
    const user = userEvent.setup()
    let expanded = true
    const view = (
      <ListGroup heading="Pendientes" count={1} expanded={expanded} onToggle={() => (expanded = !expanded)}>
        <ListRow>fila</ListRow>
      </ListGroup>
    )
    const { rerender } = render(view)
    const button = screen.getByRole('button', { name: /Pendientes/ })
    expect(button).toHaveAttribute('aria-expanded', 'true')
    await user.click(button)
    expect(expanded).toBe(false)
    rerender(
      <ListGroup heading="Pendientes" count={1} expanded={false} onToggle={() => {}}>
        <ListRow>fila</ListRow>
      </ListGroup>,
    )
    expect(screen.queryByText('fila')).toBeNull()
  })

  it('ListRow seleccionable responde a clic y teclado', async () => {
    const user = userEvent.setup()
    const seen: string[] = []
    render(
      <ListRow selected onSelect={() => seen.push('x')}>
        fila
      </ListRow>,
    )
    const row = screen.getByRole('row')
    expect(row).toHaveAttribute('aria-selected', 'true')
    await user.click(row)
    row.focus()
    await user.keyboard('{Enter}')
    expect(seen).toHaveLength(2)
  })

  it('SearchInput tiene etiqueta y notifica cambios', async () => {
    const user = userEvent.setup()
    const values: string[] = []
    render(<SearchInput label="Buscar pedidos" value="" onChange={(v) => values.push(v)} />)
    await user.type(screen.getByLabelText('Buscar pedidos'), 'a')
    expect(values).toEqual(['a'])
  })

  it('Switch alterna con aria-checked', async () => {
    const user = userEvent.setup()
    const calls: boolean[] = []
    render(<Switch label="Reoptimización automática" checked={false} onChange={(v) => calls.push(v)} />)
    const sw = screen.getByRole('switch', { name: 'Reoptimización automática' })
    expect(sw).toHaveAttribute('aria-checked', 'false')
    await user.click(sw)
    expect(calls).toEqual([true])
  })

  it('Banner de error se anuncia como alerta', () => {
    render(<Banner tone="error" title="Sin conexión.">No se pudo cargar el mapa</Banner>)
    expect(screen.getByRole('alert')).toHaveTextContent('Sin conexión.')
  })
})
