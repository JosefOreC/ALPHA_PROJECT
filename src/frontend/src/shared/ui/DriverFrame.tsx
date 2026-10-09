import type { ReactNode } from 'react'
import { LogoHojaRuta } from './icons'
import { MODULE_ICONS } from './moduleIcons'
import { modulesForRole } from './roles'
import type { ModuleId } from './roles'

type DriverBarProps = {
  /** Título de la sección o enlace de regreso. */
  children: ReactNode
  plate?: string
  initials: string
}

// Cabecera bosque de las vistas móviles del conductor.
export function DriverBar({ children, plate, initials }: DriverBarProps) {
  return (
    <header className="eco-phone__bar">
      <LogoHojaRuta className="eco-mark--sm" />
      {children}
      {plate ? <span className="eco-tag eco-tag--on-dark eco-code eco-phone__plate">{plate}</span> : null}
      <span className="eco-avatar" aria-hidden="true">{initials}</span>
    </header>
  )
}

// Barra inferior: Mi ruta, Pedido actual e Incidencias. Incidencias aún no tiene pantalla.
export function DriverTabBar({ current, onNavigate }: { current: ModuleId; onNavigate?: (id: ModuleId, href: string) => void }) {
  return (
    <nav className="eco-tabbar" aria-label="Secciones del conductor">
      {modulesForRole('driver').filter(module => ['mi-ruta', 'pedido-actual', 'incidencias'].includes(module.id)).map(module => {
        const Icon = MODULE_ICONS[module.id]
        const unavailable = module.id === 'incidencias'
        return (
          <a
            key={module.id}
            href={module.href}
            aria-current={module.id === current ? 'page' : undefined}
            aria-disabled={unavailable ? true : undefined}
            title={unavailable ? 'Próximamente' : undefined}
            onClick={event => {
              if (unavailable) {
                event.preventDefault()
              } else if (onNavigate) {
                event.preventDefault()
                onNavigate(module.id, module.href)
              }
            }}
          >
            <Icon />
            {module.label}
          </a>
        )
      })}
    </nav>
  )
}
