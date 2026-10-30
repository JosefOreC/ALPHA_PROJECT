import type { Order, OrdersPort } from '../domain/order'
export class HttpOrders implements OrdersPort {
  private readonly baseUrl: string
  constructor(baseUrl: string) { this.baseUrl = baseUrl }
  private async request(path: string, method = 'GET'): Promise<Order> {
    const token = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content
    const response = await fetch(`${this.baseUrl.replace(/\/$/, '')}/api/conductor/pedidos/${path}`, {
      method, credentials: 'include', headers: { Accept: 'application/json', ...(method !== 'GET' && token ? { 'X-CSRF-Token': token } : {}) },
    })
    if (!response.ok) {
      const messages: Record<number, string> = {
        401: 'Inicia sesión para consultar tus pedidos.', 403: 'Tu usuario no tiene permisos de conductor.',
        404: 'Pedido no encontrado o no asignado a tu usuario.', 409: 'El pedido cambió de estado. Vuelve a cargarlo.',
      }
      throw new Error(messages[response.status] ?? 'No se pudo completar la operación. Inténtalo nuevamente.')
    }
    return response.json() as Promise<Order>
  }
  view(id: string) { return this.request(encodeURIComponent(id)) }
  confirm(id: string) { return this.request(`${encodeURIComponent(id)}/confirmacion`, 'POST') }
}
