import { readFile, writeFile, readdir } from 'node:fs/promises'
import { promisify } from 'node:util'
import { brotliCompress, gzip, constants } from 'node:zlib'

// Build-time compression keeps serving cheap, with original assets preserved.
const br = promisify(brotliCompress)
const gz = promisify(gzip)
const assets = new URL('../dist/assets/', import.meta.url)
for (const name of await readdir(assets)) {
  if (!/\.(js|css)$/.test(name)) continue
  const source = await readFile(new URL(name, assets))
  if (source.length < 1000) continue
  for (const [extension, data] of [['br', await br(source, { params: { [constants.BROTLI_PARAM_QUALITY]: 9 } })], ['gz', await gz(source, { level: 9 })]]) {
    if (data.length < source.length) await writeFile(new URL(`${name}.${extension}`, assets), data)
  }
}
