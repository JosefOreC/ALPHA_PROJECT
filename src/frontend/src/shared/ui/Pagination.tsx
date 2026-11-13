export function Pagination({ offset, limit = 20, hasMore, busy = false, onPage, label = 'Páginas del listado' }:
  { offset: number; limit?: number; hasMore: boolean; busy?: boolean; onPage: (offset: number) => void; label?: string }) {
  return <nav className="eco-toolbar" aria-label={label}>
    <button type="button" className="eco-btn eco-btn--secondary" disabled={busy || offset === 0} onClick={() => onPage(Math.max(0, offset - limit))}>Anterior</button>
    <span className="eco-muted" aria-live="polite">Página {Math.floor(offset / limit) + 1}</span>
    <button type="button" className="eco-btn eco-btn--secondary" disabled={busy || !hasMore} onClick={() => onPage(offset + limit)}>Siguiente</button>
  </nav>
}
