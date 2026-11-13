const { test } = require('node:test')
const assert = require('node:assert/strict')
const { mkdtempSync, mkdirSync, writeFileSync, readFileSync, copyFileSync, existsSync, rmSync } = require('node:fs')
const { tmpdir } = require('node:os')
const { resolve, join, sep } = require('node:path')
const { execFileSync } = require('node:child_process')
const { brotliDecompressSync, gunzipSync } = require('node:zlib')

test('the production build preserves assets and emits valid Brotli/gzip variants', () => {
  const temporaryRoot = resolve(tmpdir())
  const directory = mkdtempSync(join(temporaryRoot, 'eco-precompress-'))
  try {
    mkdirSync(join(directory, 'scripts'))
    const assets = join(directory, 'dist', 'assets')
    mkdirSync(assets, { recursive: true })
    copyFileSync(resolve(__dirname, '../scripts/precompress.mjs'), join(directory, 'scripts', 'precompress.mjs'))
    const javascript = Buffer.from('const fixture = "build compression";\n'.repeat(100))
    const css = Buffer.from('.fixture { color: inherit; }\n'.repeat(100))
    writeFileSync(join(assets, 'app.js'), javascript)
    writeFileSync(join(assets, 'app.css'), css)
    writeFileSync(join(assets, 'small.js'), 'export const small = true')
    writeFileSync(join(assets, 'image.svg'), '<svg/>')
    execFileSync(process.execPath, [join(directory, 'scripts', 'precompress.mjs')], { windowsHide: true })
    for (const [name, source] of [['app.js', javascript], ['app.css', css]]) {
      assert.deepEqual(readFileSync(join(assets, name)), source)
      assert.deepEqual(brotliDecompressSync(readFileSync(join(assets, name + '.br'))), source)
      assert.deepEqual(gunzipSync(readFileSync(join(assets, name + '.gz'))), source)
    }
    assert.equal(existsSync(join(assets, 'small.js.br')), false)
    assert.equal(existsSync(join(assets, 'image.svg.gz')), false)
  } finally {
    const target = resolve(directory)
    assert.ok(target.startsWith(temporaryRoot + sep) && target.split(sep).at(-1).startsWith('eco-precompress-'))
    rmSync(target, { recursive: true, force: true })
  }
})
