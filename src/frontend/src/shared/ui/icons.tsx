import type { ReactNode, SVGProps } from 'react'

type IconProps = Omit<SVGProps<SVGSVGElement>, 'children'> & { size?: 'md' }

function Glyph({ className, size, children, ...rest }: IconProps & { children: ReactNode }) {
  const classes = ['eco-icon', size === 'md' ? 'eco-icon--md' : '', className ?? ''].filter(Boolean).join(' ')
  return (
    <svg className={classes} viewBox="0 0 24 24" aria-hidden="true" {...rest}>
      {children}
    </svg>
  )
}

// Set Ruta: trazo currentColor, punto de parada con className="acc".
export function CloseIcon(props: IconProps) {
  return <Glyph {...props}><path d="m6 6 12 12M18 6 6 18" /></Glyph>
}

export function CamionetaIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M2.5 6.5h11v10h-11z" />
      <path d="M13.5 9.5h4.2l3.3 3.4v3.6h-7.5" />
      <circle cx="7" cy="17.5" r="2" className="acc" />
      <circle cx="17.2" cy="17.5" r="2" />
      <path d="M5 10h5" />
    </Glyph>
  )
}

export function CombustibleIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M12 3.5s6 6.5 6 10.5a6 6 0 0 1-12 0c0-4 6-10.5 6-10.5z" />
      <path d="M9.5 15.5c1.5 0 2.5-1 2.5-2.5" />
      <circle cx="14" cy="16" r="1.8" className="acc" />
    </Glyph>
  )
}

export function ConductorIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="2.4" className="acc" />
      <path d="M12 14.4v6.1M9.7 11.3L3.8 9.6M14.3 11.3l5.9-1.7" />
    </Glyph>
  )
}

export function DistritoIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M3.5 6.5l5.5-2 6 2 5.5-2v13l-5.5 2-6-2-5.5 2z" />
      <path d="M9 4.5v13M15 6.5v13" />
      <circle cx="12" cy="11" r="1.9" className="acc" />
    </Glyph>
  )
}

export function EntregaIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M12 20.5s-6.5-5.8-6.5-10.8a6.5 6.5 0 0 1 13 0c0 5-6.5 10.8-6.5 10.8z" />
      <path d="M9.3 9.8l1.9 1.9 3.6-3.7" />
      <ellipse cx="12" cy="21.2" rx="3.2" ry="1" className="acc" />
    </Glyph>
  )
}

export function FlotaIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M4 15.5V8.5h8v7" />
      <path d="M12 10.5h3.5l2.5 2.6v2.4" />
      <circle cx="7" cy="16.5" r="1.6" className="acc" />
      <circle cx="15.5" cy="16.5" r="1.6" />
      <path d="M2.5 20.5h19" strokeDasharray="2.2 2.8" />
    </Glyph>
  )
}

export function HojaCo2Icon(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M4.5 19.5C4.5 10.5 10.5 4.5 19.5 4.5c0 9-6 15-15 15z" />
      <path d="M4.5 19.5c3.5-3.5 6-6.5 9.5-9.5" strokeDasharray="2.2 2.6" />
      <circle cx="14.6" cy="9.4" r="2" className="acc" />
    </Glyph>
  )
}

export function IncidenciaIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M9.6 3.5h4.8l4.6 16H5z" />
      <path d="M7.5 12.2h9l.7 2.6H6.8z" className="acc" />
      <path d="M3.5 19.5h17" />
    </Glyph>
  )
}

export function PaqueteIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" />
      <path d="M4 7.5l8 4.5 8-4.5M12 12v9" />
      <circle cx="8" cy="9.8" r="1.8" className="acc" />
    </Glyph>
  )
}

export function RutaIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M7 17c2.5-2.5 1.5-5 5-5s2.5-2.5 5-5" strokeDasharray="2.4 2.8" />
      <circle cx="5" cy="19" r="2.4" className="acc" />
      <circle cx="19" cy="5" r="2.4" />
    </Glyph>
  )
}

export function TableroIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
      <path d="M7.5 16v-3M12 16V8M16.5 16v-5" />
      <circle cx="12" cy="8" r="1.8" className="acc" />
    </Glyph>
  )
}

export function VentanaIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 3.5a8.5 8.5 0 0 1 8.5 8.5" className="acc-stroke" />
      <path d="M12 7.5V12l3 2" />
    </Glyph>
  )
}

// Glifos de interfaz que usa el diseño junto al set Ruta.
export function SearchIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.5 4.5" />
    </Glyph>
  )
}

export function PlusIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M12 5v14M5 12h14" />
    </Glyph>
  )
}

export function MinusIcon(props: IconProps) {
  return <Glyph {...props}><path d="M5 12h14" /></Glyph>
}

export function RecenterIcon(props: IconProps) {
  return <Glyph {...props}>
    <circle cx="12" cy="12" r="6.5" /><circle cx="12" cy="12" r="2" />
    <path d="M12 2v3.5M12 18.5V22M2 12h3.5M18.5 12H22" />
  </Glyph>
}

export function AlertIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M12 4l9 16H3z" />
      <path d="M12 10v4.5M12 17.5v.01" />
    </Glyph>
  )
}

export function CheckIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </Glyph>
  )
}

export function SlidersIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M4 7h10M18 7h2M4 17h4M12 17h8M14 4.5v5M8 14.5v5" />
    </Glyph>
  )
}

export function LogoHojaRuta({ className }: { className?: string }) {
  return (
    <svg className={['eco-mark', className ?? ''].filter(Boolean).join(' ')} viewBox="0 0 32 32" aria-hidden="true">
      <path className="leaf" d="M5 27C5 14 13 5 27 5c0 14-9 22-22 22z" />
      <path className="vein" d="M8.5 23.5c3.5-3.5 6-8.5 10.5-10.5" />
      <circle className="stop" cx="21.5" cy="11.5" r="2.6" />
    </svg>
  )
}
