// Usa TypeScript ya existente y node:test; no agrega un runner ni genera archivos.
const ts = require('typescript')
const fs = require('node:fs')
require.extensions['.ts'] = function compile(module, filename) {
  const source = fs.readFileSync(filename, 'utf8')
  module._compile(ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
  } }).outputText, filename)
}
module.exports = {}
