import { decodeSession } from '../domain/session'
import type { SessionSource } from '../domain/session'

export class HttpSession implements SessionSource {
  private readonly baseUrl: string
  constructor(baseUrl: string) { this.baseUrl = baseUrl }
  async load(signal?: AbortSignal) {
    const response = await fetch(`${this.baseUrl.replace(/\/$/, '')}/api/session`, { credentials: 'include', signal, headers: { Accept: 'application/json' } })
    if (response.status === 401) return null
    if (!response.ok) throw new Error('No se pudo verificar tu sesión. Intenta de nuevo.')
    return decodeSession(await response.json())
  }
  async logout() {
    const token = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content
    const response = await fetch(`${this.baseUrl.replace(/\/$/, '')}/api/session`, { method: 'DELETE', credentials: 'include', headers: token ? { 'X-CSRF-Token': token } : {} })
    if (!response.ok && response.status !== 401) throw new Error('No se pudo cerrar la sesión. Intenta de nuevo.')
  }
}
