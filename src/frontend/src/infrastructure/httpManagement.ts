import { ManagementError, statusLabels, validTimestamp } from '../domain/managedOrder'
import type { ManagedOrder, ManagementPort, OrderData, OrderFilters, OrderPage, OrderPermissions } from '../domain/managedOrder'

function object(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}
function readWindow(value: unknown): boolean {
  return typeof value === 'string' && (validTimestamp(value) || /^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(value))
}
export function decodeOrder(value: unknown): ManagedOrder {
  if (!object(value) || ['id', 'customer', 'address', 'district', 'window_start', 'window_end', 'instructions'].some(key => typeof value[key] !== 'string')
    || typeof value.status !== 'string' || !Object.hasOwn(statusLabels, value.status)
    || typeof value.weight_kg !== 'number' || !Number.isFinite(value.weight_kg) || value.weight_kg <= 0
    || typeof value.assigned !== 'boolean' || !Number.isSafeInteger(value.version) || Number(value.version) < 1
    || !readWindow(value.window_start) || !readWindow(value.window_end)
    || (value.confirmed_at !== null && (typeof value.confirmed_at !== 'string' || !Number.isFinite(Date.parse(value.confirmed_at))))) {
    throw new ManagementError('La API devolvió un pedido inválido. Intenta volver a cargar.')
  }
  // Comprobación de todos los campos antes de construir el DTO.
  return { id: value.id as string, customer: value.customer as string, address: value.address as string,
    district: value.district as string, window_start: value.window_start as string, window_end: value.window_end as string,
    instructions: value.instructions as string, weight_kg: value.weight_kg,
    status: value.status as ManagedOrder['status'], confirmed_at: value.confirmed_at as string | null,
    assigned: value.assigned, version: value.version as number }
}

export class HttpManagement implements ManagementPort {
  private readonly baseUrl: string
  private readonly csrfToken: () => string | null
  constructor(baseUrl: string, csrfToken: () => string | null = () => null) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); this.csrfToken = csrfToken
  }
  private async request(path: string, method = 'GET', body?: unknown): Promise<unknown> {
    const headers: Record<string, string> = { Accept: 'application/json' }
    if (body !== undefined) {
      headers['Content-Type'] = 'application/json'
      const token = this.csrfToken()
      if (token) headers['X-CSRF-Token'] = token
    }
    let response: Response
    try {
      response = await fetch(`${this.baseUrl}/api/pedidos${path}`, { method, credentials: 'include', headers,
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}) })
    } catch { throw new ManagementError(method === 'POST' && path === ''
      ? 'No pudimos confirmar el resultado. Conservamos el formulario; consulta el listado antes de reenviar para evitar duplicados.'
      : 'No se pudo conectar con la API. Revisa tu conexión y vuelve a intentar.') }
    if (!response.ok) {
      const messages: Record<number, string> = { 401: 'Se requiere una sesión verificada para gestionar pedidos.',
        403: 'Acceso denegado o protección de la operación pendiente de integración.', 404: 'Pedido no encontrado.',
        409: 'El pedido cambió. Consulta su versión actual antes de continuar.', 422: 'Revisa los campos, la ventana, el peso y el distrito.' }
      throw new ManagementError(messages[response.status] ?? 'No se pudo completar la operación. Inténtalo nuevamente.', response.status)
    }
    try { return await response.json() } catch { throw new ManagementError('La API devolvió una respuesta inválida.') }
  }
  async permissions(): Promise<OrderPermissions> {
    const value = await this.request('/permisos')
    if (!object(value) || typeof value.can_write !== 'boolean') throw new ManagementError('Permisos inválidos en la respuesta de la API.')
    return { can_write: value.can_write }
  }
  async list(filters: OrderFilters): Promise<OrderPage> {
    const query = new URLSearchParams({ limit: String(filters.limit), offset: String(filters.offset) })
    if (filters.status) query.set('status', filters.status)
    if (filters.district) query.set('district', filters.district)
    const value = await this.request(`?${query}`)
    if (!object(value) || !Array.isArray(value.items) || typeof value.has_more !== 'boolean'
      || value.limit !== filters.limit || value.offset !== filters.offset || value.items.length > filters.limit) throw new ManagementError('La API devolvió un listado inválido.')
    return { items: value.items.map(decodeOrder), has_more: value.has_more, limit: filters.limit, offset: filters.offset }
  }
  async view(id: string) { return decodeOrder(await this.request(`/${encodeURIComponent(id)}`)) }
  async create(data: OrderData) { return decodeOrder(await this.request('', 'POST', data)) }
  async update(id: string, data: OrderData, version: number) { return decodeOrder(await this.request(`/${encodeURIComponent(id)}`, 'PUT', { ...data, expected_version: version })) }
  async cancel(id: string, version: number) { return decodeOrder(await this.request(`/${encodeURIComponent(id)}/cancelacion`, 'POST', { expected_version: version })) }
}
