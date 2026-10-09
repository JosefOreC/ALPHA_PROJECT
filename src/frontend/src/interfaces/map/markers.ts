import type { OrderStatus } from '../../domain/order'
import { ORDER_STATUS_CLASS } from '../../domain/mapData'
import type { MapRoute, MapVehicle } from '../../domain/mapData'

// Marcadores SVG; los colores y estados se resuelven dentro de `.eco-map`.

/** Pin de ubicación con símbolo de estado; la punta coincide con la coordenada. */
export function pinHtml(status: OrderStatus, selected: boolean, dimmed: boolean): string {
  const classes = ['pin', `pin--${ORDER_STATUS_CLASS[status]}`, selected ? 'is-sel' : '', dimmed ? 'is-dim' : ''].filter(Boolean).join(' ')
  return (
    `<svg class="${classes}" viewBox="-18 -18 36 44" width="36" height="44" aria-hidden="true" focusable="false">` +
    '<circle class="hit" r="17"></circle><circle class="halo" cy="-3" r="15"></circle>' +
    '<path class="pin-body" d="M0 20C-3 15-12 5-12-3a12 12 0 1 1 24 0C12 5 3 15 0 20z"></path>' +
    '<g transform="translate(0,-3)"><circle class="pc" r="4.5"></circle>' +
    '<rect class="pd" x="-3.5" y="-3.5" width="7" height="7" rx="1" transform="rotate(45)"></rect>' +
    '<path class="pk" d="M-4 0l2.5 2.5L4-3"></path><path class="px" d="M-3 -3l6 6M3 -3l-6 6"></path></g></svg>'
  )
}

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] as string)

/** Camión compacto centrado en su coordenada; la placa aparece al interactuar. */
export function vehicleHtml(route: Pick<MapRoute | MapVehicle, 'plate' | 'color'>, dimmed: boolean, selected = false): string {
  return (
    `<svg class="veh r${route.color}${dimmed ? ' is-dim' : ''}${selected ? ' is-sel' : ''}" viewBox="-22 -22 44 44" width="44" height="44" aria-hidden="true" focusable="false">` +
    `<rect class="tag" x="-30" y="-36" width="60" height="18" rx="5"></rect><text x="0" y="-23" text-anchor="middle">${escapeHtml(route.plate)}</text>` +
    '<circle class="truck-halo" r="13"></circle>' +
    '<g class="truck" transform="translate(-12,-13)"><rect x="2.5" y="6.5" width="11" height="10" rx="1"></rect><path d="M13.5 9.5h4.2l3.3 3.4v3.6h-7.5z"></path><circle cx="7" cy="17.5" r="1.8"></circle><circle cx="17.2" cy="17.5" r="1.8"></circle></g></svg>'
  )
}

export function depotHtml(name: string): string {
  return (
    '<svg class="depot" viewBox="-14 -14 120 28" width="120" height="28" aria-hidden="true" focusable="false">' +
    `<rect x="-11" y="-11" width="22" height="22" rx="5"></rect><circle r="4.5"></circle><text x="16" y="4">${escapeHtml(name)}</text></svg>`
  )
}
