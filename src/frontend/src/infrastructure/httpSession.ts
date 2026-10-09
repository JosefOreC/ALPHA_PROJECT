import { decodeSession } from '../domain/session'
import type { SessionSource } from '../domain/session'
import { setCsrfToken } from './httpClient'

export class HttpSession implements SessionSource {
  private readonly baseUrl: string
  constructor(baseUrl: string) { this.baseUrl = baseUrl }
  async load(signal?: AbortSignal) {
    const response = await fetch(`${this.baseUrl.replace(/\/$/, '')}/api/session`, { credentials: 'include', signal, headers: { Accept: 'application/json' } })
    if (response.status === 401) { setCsrfToken(null); return null }
    if (!response.ok) throw new Error('No se pudo verificar tu sesión. Intenta de nuevo.')
    const data = await response.json()
    const user = decodeSession(data)
    setCsrfToken(data.csrf_token ?? null)
    return user
  }
  async login(email: string, password: string) {
    let response: Response
    try { response = await fetch(`${this.baseUrl.replace(/\/$/, '')}/api/session`, {
      method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ email, password }),
    }) } catch { throw new Error('No se pudo conectar con el servidor. Intenta de nuevo.') }
    const data = await response.json().catch(() => null)
    if (!response.ok) throw new Error(typeof data?.detail === 'string' ? data.detail : 'No se pudo iniciar sesión. Intenta de nuevo.')
    const user = decodeSession(data)
    setCsrfToken(data.csrf_token ?? null)
    return user
  }
  async logout() {
    const token = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content
    const response = await fetch(`${this.baseUrl.replace(/\/$/, '')}/api/session`, { method: 'DELETE', credentials: 'include', headers: token ? { 'X-CSRF-Token': token } : {} })
    if (!response.ok && response.status !== 401) throw new Error('No se pudo cerrar la sesión. Intenta de nuevo.')
    setCsrfToken(null)
  }
}
