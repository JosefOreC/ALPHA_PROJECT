import type { ReactNode } from 'react'

/** What a card renders: skeletons, a "no data" dash, or the real figures. */
export type CardState = 'loading' | 'error' | 'data'

export function Icon({
  d,
  size = 16,
  extra,
  className,
}: {
  d: string
  size?: number
  extra?: string
  className?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d={d} />
      {extra ? <path d={extra} /> : null}
    </svg>
  )
}

/** Placeholder bars; hidden from assistive tech (the busy state is announced elsewhere). */
export function SkeletonGroup({ lines }: { lines: Array<[height: number, width?: string]> }) {
  return (
    <div className="dash-skeleton-group">
      {lines.map(([height, width], i) => (
        <div
          key={i}
          data-sk=""
          aria-hidden="true"
          className="dash-skeleton"
          style={{ height, width: width ?? '100%' }}
        />
      ))}
    </div>
  )
}

/** Big dash for a figure that could not be loaded, with a screen-reader label. */
export function NoData({ trailing }: { trailing?: ReactNode }) {
  return (
    <div className="dash-figure">
      <span className="dash-figure__value">
        <span aria-hidden="true">—</span>
        <span className="dash-sr-only">sin dato</span>
      </span>
      {trailing}
    </div>
  )
}
