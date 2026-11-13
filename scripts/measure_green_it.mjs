// Production assets + isolated real FastAPI HTTP, three Lighthouse runs per page.
import { createRequire } from 'node:module'
import { mkdir, writeFile } from 'node:fs/promises'
import { spawn, execFileSync } from 'node:child_process'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { request as httpsRequest } from 'node:https'
const requireTool = createRequire(resolve('.test-deps/green-it/package.json'))
const { default: lighthouse } = await import(pathToFileURL(requireTool.resolve('lighthouse')).href)
const chromeLauncher = await import(pathToFileURL(requireTool.resolve('chrome-launcher')).href)
const [stage, dist, out, runCount = '3'] = process.argv.slice(2)
if (!stage || !dist || !out) throw new Error('Usage: node scripts/measure_green_it.mjs label dist output [runs=3]')
const runs = Number(runCount)
if (!Number.isInteger(runs) || runs < 1 || runs > 10) throw new Error('Runs must be an integer from 1 to 10')
await mkdir(out, { recursive: true })
const commit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
const started = new Date().toISOString()
const tls = Boolean(process.env.GREEN_IT_TLS_CERT)
const origin = `${tls ? 'https' : 'http'}://127.0.0.1:5189`
async function fixtureRequest(path, method = 'GET') {
  if (!tls) return fetch(origin + path, { method })
  // Only this isolated localhost fixture uses a self-signed test certificate.
  return new Promise((resolve, reject) => {
    const request = httpsRequest(origin + path, { method, rejectUnauthorized: false }, response => {
      response.resume()
      response.on('end', () => resolve({ ok: response.statusCode === 200 }))
    })
    request.on('error', reject)
    request.end()
  })
}
const api = spawn(resolve('.venv/Scripts/python.exe'), ['scripts/green_it_fixture.py', resolve(dist)], {
  env: { ...process.env, PYTHONPATH: resolve(stage === 'before' ? '.test-deps/green-it/before/src/backend' : 'src/backend'), PYTHONIOENCODING: 'utf-8' }, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true,
})
let serverLog = ''
api.stdout.on('data', data => { serverLog += data })
api.stderr.on('data', data => { serverLog += data })
let chrome
const results = []
try {
  let ready = false
  for (let i = 0; i < 100; i++) {
    try { ready = (await fixtureRequest('/health')).ok } catch {}
    if (ready) break
    await new Promise(done => setTimeout(done, 200))
  }
  if (!ready) throw new Error('Fixture did not start: ' + serverLog)
  chrome = await chromeLauncher.launch({ chromePath: process.env.GREEN_IT_CHROME_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu', ...(tls ? ['--ignore-certificate-errors'] : []), '--host-resolver-rules=MAP fonts.googleapis.com 127.0.0.1,MAP fonts.gstatic.com 127.0.0.1'] })
  for (const scenario of ['login', 'pedidos']) {
    await fixtureRequest('/_measure/' + scenario, 'POST')
    for (let run = 1; run <= runs; run++) {
      const url = origin + '/' + (scenario === 'pedidos' ? '?vista=pedidos' : '')
      const result = await lighthouse(url, { port: chrome.port, output: ['json', 'html'], logLevel: 'error',
        onlyCategories: ['performance', 'accessibility'], blockedUrlPatterns: ['*kaspersky-labs.com*'], throttlingMethod: 'simulate' })
      const lhr = result.lhr
      const name = `${stage}-${scenario}-${run}`
      await writeFile(resolve(out, name + '.json'), result.report[0])
      await writeFile(resolve(out, name + '.html'), result.report[1])
      if (lhr.runtimeError) throw new Error(lhr.runtimeError.message)
      const metric = id => lhr.audits[id]?.numericValue ?? null
      results.push({ scenario, run, performance: lhr.categories.performance.score * 100,
        accessibility: lhr.categories.accessibility.score * 100, fcp_ms: metric('first-contentful-paint'),
        lcp_ms: metric('largest-contentful-paint'), tbt_ms: metric('total-blocking-time'), cls: metric('cumulative-layout-shift'),
        transfer_bytes: metric('total-byte-weight'), requests: lhr.audits['network-requests'].details.items.length,
        protocols: [...new Set(lhr.audits['network-requests'].details.items.map(item => item.protocol))],
        browser: lhr.environment.hostUserAgent, lighthouse: lhr.lighthouseVersion })
      console.log(name, JSON.stringify(results.at(-1)))
    }
  }
} finally {
  if (chrome) await chrome.kill()
  api.kill()
  await writeFile(resolve(out, stage + '-server.txt'), serverLog)
  await writeFile(resolve(out, stage + '-summary.json'), JSON.stringify({ stage, commit, started_utc: started,
    finished_utc: new Date().toISOString(), scenarios: '150 synthetic orders; real HTTP; no database; external fonts blocked equally; mobile simulated throttling',
    origin, tls_certificate: tls ? 'self-signed isolated test certificate; browser exception for this measurement only' : null,
    source_diff: execFileSync('git', ['diff', '--name-only', 'HEAD', '--', 'src', 'scripts'], { encoding: 'utf8' }), results }, null, 2))
}
// All reports and child-process cleanup are awaited above; Lighthouse may retain handles.
process.exit(0)
