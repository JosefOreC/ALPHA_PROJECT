import type { ReactNode, KeyboardEvent } from 'react'

/** Pestañas con flechas, Inicio y Fin y activación automática. */
export function TabList({ label, children }: { label: string; children: ReactNode }) {
  function navigate(event: KeyboardEvent<HTMLDivElement>) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
    const tabs = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]:not(:disabled)'))
    const index = tabs.indexOf(event.target as HTMLButtonElement)
    if (index < 0 || !tabs.length) return
    event.preventDefault()
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1
      : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length
    tabs[next].focus()
    tabs[next].click()
  }
  return <div className="eco-tabs" role="tablist" aria-label={label} onKeyDown={navigate}>{children}</div>
}
