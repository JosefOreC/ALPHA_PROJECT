import type { ReactNode } from 'react'
import { LogoHojaRuta, SearchIcon } from './icons'
import { MODULE_ICONS } from './moduleIcons'
import { ROLE_LABELS, modulesForRole } from './roles'
import type { ModuleId, Role } from './roles'
import { useSession } from '../../interfaces/session/SessionState'

export interface ShellUser {
  name: string
  initials: string
}

export interface ShellCo2 {
  valueKg: number
  goalKg: number
}

type AppShellProps = {
  role: Role
  current: ModuleId
  user: ShellUser
  title: string
  section?: string
  co2?: ShellCo2
  counts?: Partial<Record<ModuleId, number>>
  actions?: ReactNode
  onNavigate?: (id: ModuleId, href: string) => void
  /** Tema explícito; sin él se usa el claro por defecto de tokens.css. */
  theme?: 'light' | 'dark'
  children: ReactNode
}

function kg(value: number) {
  return String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

// Barra superior (eco-side + eco-topbar + eco-content). Muestra solo los módulos del rol.
export function AppShell({ role, current, user, title, section = 'Operación', co2, counts, actions, onNavigate, theme, children }: AppShellProps) {
  const session = useSession()
  if (session?.user) {
    role = session.user.role
    user = { name: session.user.name, initials: session.user.name.split(/\s+/).slice(0, 2).map(part => part[0]).join('') }
  }
  const modules = modulesForRole(role)
  const percent = co2 && co2.goalKg > 0 ? Math.min(100, Math.round((co2.valueKg / co2.goalKg) * 100)) : 0
  return (
    <div className="eco-root eco-shell" data-theme={theme}>
      <aside className="eco-side" aria-label="Navegación principal">
        <a className="eco-side__brand" href="/">
          <LogoHojaRuta />
          <span>
            EcoLogística <span>Lima</span>
          </span>
        </a>
        <button className="eco-side__search" type="button" disabled title="Próximamente">
          <SearchIcon />
          Buscar…
          <span className="eco-kbd" aria-hidden="true">
            ⌘K
          </span>
        </button>
        {modules.map((module) => {
          const Icon = MODULE_ICONS[module.id]
          const count = counts?.[module.id]
          return (
            <a
              key={module.id}
              className="eco-side__item"
              href={module.href}
              aria-current={module.id === current ? 'page' : undefined}
              onClick={(event) => {
                if (onNavigate) {
                  event.preventDefault()
                  onNavigate(module.id, module.href)
                }
              }}
            >
              <Icon />
              {module.label}
              {count !== undefined ? <span className="eco-side__count">{count}</span> : null}
            </a>
          )
        })}
        <div className="eco-side__foot">
          {co2 ? (
            <div className="eco-side__co2">
              <span>CO₂ evitado este mes</span>
              <strong>
                {kg(co2.valueKg)} kg <span>de {kg(co2.goalKg)}</span>
              </strong>
              <div className="eco-hero__meter" role="img" aria-label={`${percent} por ciento de la meta mensual`}>
                <div className="eco-hero__meter-fill" style={{ width: `${percent}%` }} />
              </div>
            </div>
          ) : null}
          <div className="eco-side__user">
            <span className="eco-role">{ROLE_LABELS[role]}</span>
            <span className="eco-avatar" aria-hidden="true">
              {user.initials}
            </span>
            <div>{user.name}</div>
          </div>
        </div>
      </aside>
      <div className="eco-main">
        <header className="eco-topbar">
          <nav className="eco-crumbs" aria-label="Ruta de navegación">
            <span>{section}</span>
            <span aria-hidden="true">/</span>
            <strong>{title}</strong>
          </nav>
          {actions ? <div className="eco-topbar__end">{actions}</div> : null}
        </header>
        <main className="eco-content">{children}</main>
      </div>
    </div>
  )
}
