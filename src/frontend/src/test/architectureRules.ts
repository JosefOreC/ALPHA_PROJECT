/// <reference types="node" />
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
import ts from 'typescript'

/**
 * Pure hexagonal-boundary checker for one feature folder (domain / application /
 * infrastructure / ui, plus index.ts and test/). Imports and global references are
 * read from the TypeScript AST, so every import syntax is covered.
 */

const LAYERS = ['domain', 'application', 'infrastructure', 'ui'] as const
type Layer = (typeof LAYERS)[number]
type Zone = Layer | 'test' | 'index'

const DOMAIN_GLOBALS = new Set(['fetch', 'window', 'document', 'localStorage', 'sessionStorage', 'globalThis'])
const APPLICATION_GLOBALS = new Set(['fetch', 'window', 'document', 'globalThis'])
const UI_GLOBALS = new Set(['fetch'])

export function sourceFiles(root: string, dir = ''): string[] {
  return readdirSync(join(root, dir)).flatMap((name) => {
    const rel = dir ? `${dir}/${name}` : name
    if (statSync(join(root, rel)).isDirectory()) return sourceFiles(root, rel)
    return /\.(ts|tsx)$/.test(name) && !/\.test\.tsx?$/.test(name) ? [rel] : []
  })
}

function zoneOf(file: string): Zone | null {
  const [first] = file.split('/')
  if ((LAYERS as readonly string[]).includes(first) && file.includes('/')) return first as Layer
  if (first === 'test' && file.includes('/')) return 'test'
  return file === 'index.ts' ? 'index' : null
}

interface Reference {
  specifier: string
}

function importsOf(sourceFile: ts.SourceFile): Reference[] {
  const found: Reference[] = []
  const visit = (node: ts.Node): void => {
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier) {
      if (ts.isStringLiteralLike(node.moduleSpecifier)) found.push({ specifier: node.moduleSpecifier.text })
    } else if (
      ts.isImportEqualsDeclaration(node) &&
      ts.isExternalModuleReference(node.moduleReference) &&
      ts.isStringLiteralLike(node.moduleReference.expression)
    ) {
      found.push({ specifier: node.moduleReference.expression.text })
    } else if (ts.isCallExpression(node)) {
      const callee = node.expression
      const isDynamic = callee.kind === ts.SyntaxKind.ImportKeyword
      const isRequire = ts.isIdentifier(callee) && callee.text === 'require'
      if ((isDynamic || isRequire) && node.arguments.length > 0) {
        const [arg] = node.arguments
        found.push({ specifier: ts.isStringLiteralLike(arg) ? arg.text : '<non-literal dynamic import>' })
      }
    } else if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument)) {
      if (ts.isStringLiteral(node.argument.literal)) found.push({ specifier: node.argument.literal.text })
    }
    ts.forEachChild(node, visit)
  }
  visit(sourceFile)
  return found
}

/** Global identifiers referenced as free variables (not `x.fetch`, not `{ fetch: 1 }`). */
function globalsUsed(sourceFile: ts.SourceFile, names: Set<string>): string[] {
  const used = new Set<string>()
  const visit = (node: ts.Node): void => {
    if (ts.isIdentifier(node) && names.has(node.text) && isReference(node)) used.add(node.text)
    ts.forEachChild(node, visit)
  }
  visit(sourceFile)
  return [...used]
}

function isReference(id: ts.Identifier): boolean {
  const parent = id.parent
  if (ts.isPropertyAccessExpression(parent) && parent.name === id) return false
  if (ts.isQualifiedName(parent) && parent.right === id) return false
  if (
    (ts.isPropertyAssignment(parent) ||
      ts.isPropertySignature(parent) ||
      ts.isMethodDeclaration(parent) ||
      ts.isPropertyDeclaration(parent)) &&
    parent.name === id
  ) {
    return false
  }
  return true
}

function layerNamed(specifier: string, layer: Layer): boolean {
  return new RegExp(`(^|/)${layer}(/|$)`).test(specifier)
}

/** Which zone of the feature a relative specifier lands in (null when outside the feature). */
function resolvedZone(root: string, file: string, specifier: string): string | null {
  const target = relative(root, resolve(root, dirname(file), specifier))
  if (target.startsWith('..')) return null
  const [first] = target.split(sep)
  return first === '' ? 'index' : first
}

function checkFile(root: string, file: string): string[] {
  const zone = zoneOf(file)
  if (zone === null) return [`${file}: file is outside the domain/application/infrastructure/ui layers`]

  const sourceFile = ts.createSourceFile(file, readFileSync(join(root, file), 'utf8'), ts.ScriptTarget.Latest, true)
  const problems: string[] = []
  const fail = (message: string) => problems.push(`${file}: ${message}`)

  for (const { specifier } of importsOf(sourceFile)) {
    const isRelative = specifier.startsWith('.')
    const landed = isRelative ? resolvedZone(root, file, specifier) : null

    switch (zone) {
      case 'domain':
        if (!isRelative) fail(`domain imports package "${specifier}" (only relative paths inside domain)`)
        else if (landed !== 'domain') fail(`domain imports "${specifier}" outside domain`)
        break
      case 'application':
        // React is allowed on purpose: useDashboard is a React hook (pragmatic exception).
        if (landed === 'infrastructure' || landed === 'ui' || (!isRelative && (layerNamed(specifier, 'infrastructure') || layerNamed(specifier, 'ui')))) {
          fail(`application imports "${specifier}"`)
        }
        break
      case 'ui':
        if (landed === 'infrastructure' || (!isRelative && layerNamed(specifier, 'infrastructure'))) {
          fail(`ui imports "${specifier}"`)
        }
        break
      case 'test':
        if (!isRelative) fail(`test helper imports package "${specifier}"`)
        else if (landed !== 'domain') fail(`test helper imports "${specifier}" (only domain allowed)`)
        break
      case 'index':
        if (!isRelative) fail(`index imports package "${specifier}"`)
        else if (landed === null) fail(`index imports "${specifier}" outside the feature`)
        break
      case 'infrastructure':
        break
    }
  }

  const globals =
    zone === 'domain' ? DOMAIN_GLOBALS : zone === 'application' ? APPLICATION_GLOBALS : zone === 'ui' ? UI_GLOBALS : null
  if (globals) for (const name of globalsUsed(sourceFile, globals)) fail(`${zone} references global "${name}"`)

  return problems
}

export function checkFeature(root: string): string[] {
  return sourceFiles(root).flatMap((file) => checkFile(root, file))
}
