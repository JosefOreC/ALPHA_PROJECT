const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const { JSDOM, VirtualConsole } = require('jsdom')

const docs = path.resolve(__dirname, '../../../docs')
const folder = path.join(docs, fs.readdirSync(docs).find(name => name.startsWith('04 ')))

async function preview() {
  const dom = new JSDOM(fs.readFileSync(path.join(folder, 'Dashboard del dia.dc.html'), 'utf8'), {
    url: 'https://preview.example/Dashboard.dc.html?untrusted=ignored',
    runScripts: 'outside-only', virtualConsole: new VirtualConsole(),
  })
  const parent = new JSDOM('', { url: 'https://preview.example/editor' })
  const messages = []
  Object.defineProperty(dom.window, 'parent', { value: parent.window })
  parent.window.postMessage = (message, origin) => messages.push({ message, origin })
  dom.window.React = require('react')
  dom.window.ReactDOM = { createRoot: () => ({ render() {} }) }
  dom.window.Function = () => { throw new Error('Dynamic code construction is forbidden') }
  dom.window.fetch = () => { throw new Error('Unexpected preview network request') }
  const context = dom.getInternalVMContext()
  vm.runInContext(fs.readFileSync(path.join(folder, 'dashboard-logic.js'), 'utf8'), context)
  vm.runInContext(fs.readFileSync(path.join(folder, 'support.js'), 'utf8'), context)
  await new Promise(resolve => setImmediate(resolve))
  return { window: dom.window, parent: parent.window, messages, close() { dom.window.close(); parent.window.close() } }
}

test('the exported dashboard boots with static logic and never executes streamed source', async () => {
  const page = await preview()
  try {
    const root = page.window.__dcRootName()
    const logic = page.window.__dcRegistry[root].Logic
    assert.equal(typeof logic, 'function')
    assert.equal(new logic({}).renderVals().hasData, true)
    page.window.__dcUpdate(root, 'js', 'window.__executed = true; class Component {}', false)
    assert.equal(page.window.__executed, undefined)
    assert.equal(new page.window.__dcRegistry[root].Logic({}).renderVals().hasData, true)
    assert.ok(page.messages.length > 0)
    assert.ok(page.messages.every(item => item.origin === 'https://preview.example'))
  } finally { page.close() }
})

test('preview messages require both the allowed origin and the actual parent window', async () => {
  const page = await preview()
  try {
    page.window.__dcUpdate(page.window.__dcRootName(), 'html', '<meta name="design_doc_mode" content="canvas"><div>Preview</div>', false)
    const style = page.window.document.querySelector('style[data-dc-canvas]')
    assert.ok(style)
    const before = style.textContent
    const message = (origin, source) => new page.window.MessageEvent('message', { origin, source, data: { type: '__dc_theme', theme: 'dark' } })
    page.window.dispatchEvent(message('https://attacker.example', page.parent))
    assert.equal(style.textContent, before)
    page.window.dispatchEvent(message('https://preview.example', page.window))
    assert.equal(style.textContent, before)
    page.window.dispatchEvent(message('https://preview.example', page.parent))
    assert.notEqual(style.textContent, before)
  } finally { page.close() }
})
