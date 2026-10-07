import type { ReactNode } from 'react'

/** What a card renders: skeletons, a "no data" dash, or the real figures. */
export type CardState = 'loading' | 'error' | 'data'

/** Placeholder bars; hidden from assistive tech (the busy state is announced elsewhere). */
export function SkeletonGroup({ lines }: { lines: Array<[height: number, width?: string]> }) {
  return (
    <div className="eco-skeleton-group">
      {lines.map(([height, width], i) => (
        <div key={i} data-sk="" aria-hidden="true" className="eco-skeleton" style={{ height, width: width ?? '100%' }} />
      ))}
    </div>
  )
}

/** Big dash for a figure that could not be loaded, with a screen-reader label. */
export function NoData({ trailing }: { trailing?: ReactNode }) {
  return (
    <span className="eco-nodata">
      <span aria-hidden="true">—</span>
      <span className="eco-sr">sin dato</span>
      {trailing}
    </span>
  )
}
