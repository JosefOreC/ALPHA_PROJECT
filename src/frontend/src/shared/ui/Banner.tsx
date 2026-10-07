import type { ReactNode } from 'react'
import { AlertIcon, CheckIcon, HojaCo2Icon } from './icons'

export type BannerTone = 'info' | 'success' | 'warning' | 'error'

const TONE_ICON = { info: HojaCo2Icon, success: CheckIcon, warning: AlertIcon, error: AlertIcon }

type BannerProps = {
  tone?: BannerTone
  title?: string
  children?: ReactNode
  action?: ReactNode
}

export function Banner({ tone = 'info', title, children, action }: BannerProps) {
  const Icon = TONE_ICON[tone]
  return (
    <div className={`eco-banner${tone === 'info' ? '' : ` eco-banner--${tone}`}`} role={tone === 'error' ? 'alert' : 'status'}>
      <Icon size="md" />
      <div className="eco-banner__text">
        {title ? <span className="eco-banner__title">{title} </span> : null}
        {children}
      </div>
      {action}
    </div>
  )
}
