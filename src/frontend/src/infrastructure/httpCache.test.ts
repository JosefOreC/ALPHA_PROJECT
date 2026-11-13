import { afterEach, expect, it, vi } from 'vitest'
import { clearRequestCache, requestJson, setCsrfToken } from './httpClient'

afterEach(() => { clearRequestCache(); vi.unstubAllGlobals(); vi.useRealTimers() })
const response = (data: unknown, etag = '"v1"') => new Response(JSON.stringify(data), { headers: { ETag: etag, 'Cache-Control': 'private, max-age=0, must-revalidate' } })

it('reutiliza solo respuestas optadas y copia los datos para evitar mutaciones compartidas', async () => {
  const fetcher = vi.fn().mockImplementation(async () => response({ value: 1 }))
  vi.stubGlobal('fetch', fetcher)
  const first = await requestJson<{value:number}>('/api/settings', { cacheMs: 1000 })
  first.value = 99
  expect(await requestJson('/api/settings', { cacheMs: 1000 })).toEqual({ value: 1 })
  expect(fetcher).toHaveBeenCalledTimes(1)
  await requestJson('/api/live')
  await requestJson('/api/live')
  expect(fetcher).toHaveBeenCalledTimes(3)
})

it('revalida por ETag al vencer y no confunde una respuesta 304 con un error', async () => {
  vi.useFakeTimers()
  const fetcher = vi.fn().mockResolvedValueOnce(response({ value: 1 })).mockResolvedValueOnce(new Response(null, { status: 304 }))
  vi.stubGlobal('fetch', fetcher)
  await requestJson('/api/settings', { cacheMs: 100 })
  vi.advanceTimersByTime(101)
  expect(await requestJson('/api/settings', { cacheMs: 100 })).toEqual({ value: 1 })
  expect(fetcher.mock.calls[1][1].headers['If-None-Match']).toBe('"v1"')
})

it('invalida al mutar y cambiar de sesión; no almacena no-store ni errores', async () => {
  const fetcher = vi.fn().mockImplementation(async () => response({ value: 1 }))
  vi.stubGlobal('fetch', fetcher)
  await requestJson('/api/settings', { cacheMs: 1000 })
  await requestJson('/api/settings', { method: 'PUT', body: {} })
  await requestJson('/api/settings', { cacheMs: 1000 })
  setCsrfToken('another-user')
  await requestJson('/api/settings', { cacheMs: 1000 })
  expect(fetcher).toHaveBeenCalledTimes(4)
  fetcher.mockResolvedValueOnce(new Response('{}', { status: 403 }))
  await expect(requestJson('/api/forbidden', { cacheMs: 1000 })).rejects.toThrow()
  await requestJson('/api/settings', { cacheMs: 1000 })
  expect(fetcher).toHaveBeenCalledTimes(6)
  fetcher.mockImplementation(async () => new Response('{}', { headers: { ETag: '"x"', 'Cache-Control': 'no-store' } }))
  await requestJson('/api/session', { cacheMs: 1000 })
  await requestJson('/api/session', { cacheMs: 1000 })
  expect(fetcher).toHaveBeenCalledTimes(8)
})

it('una petición anterior al cierre de sesión no rellena la caché de la sesión nueva', async () => {
  let finish!: (value: Response) => void
  const fetcher = vi.fn().mockImplementationOnce(() => new Promise<Response>(resolve => { finish = resolve })).mockResolvedValue(response({ value: 2 }))
  vi.stubGlobal('fetch', fetcher)
  const pending = requestJson('/api/settings', { cacheMs: 1000 })
  setCsrfToken(null)
  finish(response({ value: 1 }))
  await pending
  expect(await requestJson('/api/settings', { cacheMs: 1000 })).toEqual({ value: 2 })
  const controller = new AbortController(); controller.abort()
  await expect(requestJson('/api/settings', { cacheMs: 1000, signal: controller.signal })).rejects.toThrow()
})

it('acota el número de entradas y no almacena respuestas sin un validador del servidor', async () => {
  const fetcher=vi.fn().mockImplementation(async () => response({value:1}))
  vi.stubGlobal('fetch',fetcher)
  for (let i=0;i<61;i++) await requestJson('/api/catalog/'+i,{cacheMs:100000})
  await requestJson('/api/catalog/0',{cacheMs:100000})
  expect(fetcher).toHaveBeenCalledTimes(62)
  fetcher.mockImplementation(async () => Response.json({value:2}))
  await requestJson('/api/no-validator',{cacheMs:1000})
  await requestJson('/api/no-validator',{cacheMs:1000})
  expect(fetcher).toHaveBeenCalledTimes(64)
})
