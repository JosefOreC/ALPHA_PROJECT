let csrfToken: string | null = null
export function setCsrfToken(value: string | null) {
  csrfToken = value
  let meta = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
  if (!meta) { meta = document.createElement('meta'); meta.name = 'csrf-token'; document.head.append(meta) }
  meta.content = value ?? ''
}
export const getCsrfToken = () => csrfToken
export const apiBaseUrl = (import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')
export async function requestJson<T>(path: string, options: { method?: string; body?: unknown; signal?: AbortSignal } = {}): Promise<T> {
  const method = options.method ?? 'GET'
  let response: Response
  try { response = await fetch(`${apiBaseUrl}${path}`, {
    method, credentials: 'include', signal: options.signal,
    headers: { Accept: 'application/json', ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(method !== 'GET' && csrfToken ? { 'X-CSRF-Token': csrfToken } : {}) },
    ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
  }) } catch (reason) {
    if (options.signal?.aborted) throw reason
    throw new Error('No se pudo conectar con el servidor. Revisa tu conexión e intenta de nuevo.')
  }
  if (!response.ok) {
    const data = await response.json().catch(() => null)
    const fallback = response.status === 401 ? 'Inicia sesión para continuar.' : response.status === 403 ? 'Tu perfil no tiene permiso para esta operación.' : 'No se pudo completar la operación. Intenta de nuevo.'
    throw new Error(typeof data?.detail === 'string' ? data.detail : fallback)
  }
  return response.status === 204 ? undefined as T : response.json() as Promise<T>
}
