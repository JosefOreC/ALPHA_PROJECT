let csrfToken: string | null = null
let cacheEpoch = 0
const cache = new Map<string, { data: unknown; etag: string | null; expires: number }>()
export function clearRequestCache() { cacheEpoch++; cache.clear() }
export function setCsrfToken(value: string | null) {
  clearRequestCache()
  csrfToken = value
  let meta = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
  if (!meta) { meta = document.createElement('meta'); meta.name = 'csrf-token'; document.head.append(meta) }
  meta.content = value ?? ''
}
export const getCsrfToken = () => csrfToken
export const apiBaseUrl = (import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')
export async function requestJson<T>(path: string, options: { method?: string; body?: unknown; signal?: AbortSignal; cacheMs?: number } = {}): Promise<T> {
  const method = options.method ?? 'GET'
  const ttl = method === 'GET' ? Math.min(60_000, Math.max(0, options.cacheMs ?? 0)) : 0
  const entry = ttl ? cache.get(path) : undefined
  if (entry && entry.expires > Date.now()) {
    if (options.signal?.aborted) throw options.signal.reason ?? new DOMException('Aborted', 'AbortError')
    return structuredClone(entry.data) as T
  }
  if (method !== 'GET') clearRequestCache()
  const epoch = cacheEpoch
  let response: Response
  try { response = await fetch(`${apiBaseUrl}${path}`, {
    method, credentials: 'include', signal: options.signal,
    headers: { Accept: 'application/json', ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(entry?.etag ? { 'If-None-Match': entry.etag } : {}),
      ...(method !== 'GET' && csrfToken ? { 'X-CSRF-Token': csrfToken } : {}) },
    ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
  }) } catch (reason) {
    if (options.signal?.aborted) throw reason
    throw new Error('No se pudo conectar con el servidor. Revisa tu conexión e intenta de nuevo.')
  }
  if (response.status === 304 && entry && epoch === cacheEpoch) {
    entry.expires = Date.now() + ttl
    return structuredClone(entry.data) as T
  }
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) clearRequestCache()
    const data = await response.json().catch(() => null)
    const fallback = response.status === 401 ? 'Inicia sesión para continuar.' : response.status === 403 ? 'Tu perfil no tiene permiso para esta operación.' : 'No se pudo completar la operación. Intenta de nuevo.'
    throw new Error(typeof data?.detail === 'string' ? data.detail : fallback)
  }
  const data = response.status === 204 ? undefined : await response.json()
  if (ttl && epoch === cacheEpoch && !options.signal?.aborted && response.headers?.get('ETag') && !response.headers?.get('Cache-Control')?.includes('no-store')) {
    if (cache.size >= 60) cache.delete(cache.keys().next().value!)
    cache.set(path, { data: structuredClone(data), etag: response.headers?.get('ETag') ?? null, expires: Date.now() + ttl })
  }
  return data as T
}
