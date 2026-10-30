import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import type { ModuleId } from './shared/ui'
import type { Role } from './domain/role'
import App from './App'

const state = vi.hoisted(() => ({ session: { user: { subjectId: 'u1', name: 'Ana', role: 'admin', driverId: 'd1', plate: 'TST-001' } as { subjectId: string; name: string; role: Role; driverId: string; plate: string } | null, loading: false, error: '', logout: vi.fn(), login: vi.fn(), retry: vi.fn() } }))
vi.mock('./interfaces/session/SessionState', () => ({ useSession: () => state.session, useActor: () => state.session.user?.role }))
vi.mock('./interfaces/session/SessionContext', () => ({ SessionProvider: ({ children }: { children: ReactNode }) => children }))
vi.mock('./interfaces/session/SessionToolbar', () => ({ SessionGate: () => <h1>Login requerido</h1>, SessionToolbar: () => <p>Sesión del conductor</p> }))
type Props = { onNavigate?: (id: ModuleId, href: string) => void; onOpenOrder?: (id: string) => void; orderId?: string; module?: string; renderMap?: ReactNode | ((props: { selectedId: string | null; onSelect: () => void }) => ReactNode) }
function Page({ label, ...props }: Props & { label: string }) {
  return <div><h1>{label}</h1><p>{props.orderId}</p>{(['dashboard','flota','pedidos','rutas','sostenibilidad','admin','mi-ruta','pedido-actual','auditoria','conductores','incidencias'] as ModuleId[]).map(id => <button key={id} onClick={() => props.onNavigate?.(id, '?vista=' + id)}>{id}</button>)}
    <button onClick={() => props.onOpenOrder?.('order/1')}>Abrir pedido</button>
    {typeof props.renderMap === 'function' ? props.renderMap({ selectedId: null, onSelect: vi.fn() }) : props.renderMap}
  </div>
}
vi.mock('./features/dashboard', () => ({ HttpDashboardGateway: class {}, DashboardPage: (props: Props) => <Page label="Dashboard" {...props} /> }))
vi.mock('./interfaces/FleetView', () => ({ FleetView: (props: Props) => <Page label="Flota" {...props} /> }))
vi.mock('./interfaces/OrderManagementView', () => ({ OrderManagementView: (props: Props) => <Page label="Pedidos" {...props} /> }))
vi.mock('./interfaces/RoutePlanningView', () => ({ RoutePlanningView: (props: Props) => <Page label="Rutas" {...props} /> }))
vi.mock('./interfaces/SustainabilityView', () => ({ SustainabilityView: (props: Props) => <Page label="Sostenibilidad" {...props} /> }))
vi.mock('./interfaces/AdminView', () => ({ AdminView: (props: Props) => <Page label="Administración" {...props} /> }))
vi.mock('./interfaces/DriverRouteView', () => ({ DriverRouteView: (props: Props) => <Page label="Mi ruta" {...props} /> }))
vi.mock('./interfaces/DriverOrderView', () => ({ DriverOrderView: (props: Props) => <Page label="Pedido actual" {...props} /> }))
vi.mock('./interfaces/DriversView', () => ({ DriversView: (props: Props) => <Page label="Conductores" {...props} /> }))
vi.mock('./interfaces/RecordsView', () => ({ RecordsView: (props: Props) => <Page label={props.module === 'auditoria' ? 'Auditoría' : 'Incidencias'} {...props} /> }))
vi.mock('./interfaces/map/RouteMap', () => ({ RouteMap: () => <p>Mapa autorizado</p> }))

beforeEach(() => {
  state.session.user = { subjectId: 'u1', name: 'Ana', role: 'planner', driverId: 'd1', plate: 'TST-001' }
  state.session.loading = false
  window.history.replaceState({}, '', '/')
})

it.each([
  ['flota','planner','Flota'], ['pedidos','planner','Pedidos'], ['rutas','planner','Rutas'],
  ['admin','admin','Administración'], ['sostenibilidad','logistics','Sostenibilidad'],
  ['mi-ruta','driver','Mi ruta'], ['conductor','driver','Pedido actual'], ['conductores','admin','Conductores'],
  ['auditoria','auditor','Auditoría'], ['incidencias','driver','Incidencias'], ['unknown','planner','Dashboard'],
] as const)('abre la vista %s para el rol %s', (view, role, title) => {
  state.session.user!.role = role
  window.history.replaceState({}, '', `/?vista=${view}&pedido=${view === 'unknown' ? '' : 'order-1'}`)
  render(<App />)
  expect(screen.getByRole('heading', { name: title })).toBeVisible()
})

it('navega entre módulos y restaura la vista usando atrás/adelante', () => {
  window.history.replaceState({}, '', '/?vista=pedidos')
  render(<App />)
  for (const [id, title] of [['flota','Flota'], ['rutas','Rutas'], ['sostenibilidad','Sostenibilidad'], ['conductores','Conductores'], ['incidencias','Incidencias'], ['dashboard','Dashboard']] as const) {
    fireEvent.click(screen.getByRole('button', { name: id }))
    expect(screen.getByRole('heading', { name: title })).toBeVisible()
    expect(window.location.search).toBe(id === 'dashboard' ? '' : `?vista=${id}`)
  }
  act(() => { window.history.replaceState({}, '', '/?vista=pedidos'); window.dispatchEvent(new PopStateEvent('popstate')) })
  expect(screen.getByRole('heading', { name: 'Pedidos' })).toBeVisible()
  act(() => { window.history.replaceState({}, '', '/'); window.dispatchEvent(new PopStateEvent('popstate')) })
  expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
})

it('deniega módulos ajenos y permite volver al inicio de su rol', () => {
  state.session.user!.role = 'driver'
  window.history.replaceState({}, '', '/?vista=admin')
  render(<App />)
  expect(screen.getByRole('heading', { name: 'Acceso restringido' })).toBeVisible()
  fireEvent.click(screen.getByRole('button', { name: 'Ir a mi inicio' }))
  expect(screen.getByRole('heading', { name: 'Mi ruta' })).toBeVisible()
})

it('abre pedidos desde la ruta y permite volver al pedido actual sin identificador', () => {
  state.session.user!.role = 'driver'
  render(<App />)
  expect(screen.getByRole('heading', { name: 'Mi ruta' })).toBeVisible()
  fireEvent.click(screen.getByRole('button', { name: 'Abrir pedido' }))
  expect(window.location.search).toBe('?vista=conductor&pedido=order%2F1')
  expect(screen.getByText('order/1')).toBeVisible()
  fireEvent.click(screen.getByRole('button', { name: 'Abrir pedido' }))
  fireEvent.click(screen.getByRole('button', { name: 'pedido-actual' }))
  expect(window.location.search).toBe('?vista=conductor')
})

it('una URL con pedido abre directamente la vista del conductor', () => {
  state.session.user!.role = 'driver'
  window.history.replaceState({}, '', '/?pedido=order-1')
  render(<App />)
  expect(screen.getByRole('heading', { name: 'Pedido actual' })).toBeVisible()
})

it.each([true, false])('requiere autenticación si loading=%s', loading => {
  state.session.loading = loading
  if (!loading) state.session.user = null
  render(<App />)
  expect(screen.getByRole('heading', { name: 'Login requerido' })).toBeVisible()
})
