import type { OrderStatus } from '../../domain/order'
import { ORDER_STATUS_CLASS } from '../../domain/mapData'
import type { MapRoute } from '../../domain/mapData'

// Marcado SVG de los pines del diseño (Mapa.dc.html). Las clases las resuelve eco.css dentro de `.eco-map`.

/** Pin con la forma de su estado: rombo pendiente, anillo en camino, círculo con check entregado, aro con ✕ cancelado. */
export function pinHtml(status: OrderStatus, selected: boolean, dimmed: boolean): string {
  const classes = ['pin', `pin--${ORDER_STATUS_CLASS[status]}`, selected ? 'is-sel' : '', dimmed ? 'is-dim' : ''].filter(Boolean).join(' ')
  return (
    `<svg class="${classes}" viewBox="-18 -18 36 36" width="36" height="36" aria-hidden="true" focusable="false">` +
    '<circle class="hit" r="14"></circle><circle class="halo" r="14"></circle><circle class="pc" r="7.5"></circle>' +
    '<rect class="pd" x="-6.5" y="-6.5" width="13" height="13" rx="2" transform="rotate(45)"></rect>' +
    '<path class="pk" d="M-3.4 0.2l2.2 2.2 4.4-4.6"></path><path class="px" d="M-3 -3l6 6M3 -3l-6 6"></path></svg>'
  )
}

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] as string)

/** Vehículo en su posición actual, con la placa sobre una etiqueta del color de su ruta. */
export function vehicleHtml(route: MapRoute, dimmed: boolean): string {
  return (
    `<svg class="veh r${route.color}${dimmed ? ' is-dim' : ''}" viewBox="-34 -38 68 52" width="68" height="52" aria-hidden="true" focusable="false">` +
    `<rect class="tag" x="-30" y="-34" width="60" height="18" rx="5"></rect><text x="0" y="-21" text-anchor="middle">${escapeHtml(route.plate)}</text>` +
    '<circle class="ring" r="10"></circle><circle class="core" r="4"></circle></svg>'
  )
}

export function depotHtml(name: string): string {
  return (
    '<svg class="depot" viewBox="-14 -14 120 28" width="120" height="28" aria-hidden="true" focusable="false">' +
    `<rect x="-11" y="-11" width="22" height="22" rx="5"></rect><circle r="4.5"></circle><text x="16" y="4">${escapeHtml(name)}</text></svg>`
  )
}
