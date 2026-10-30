/// <reference types="node" />
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

// Reglas de ecologistica-ui/CLAUDE-diseno.md y GUIA.md que se pueden comprobar leyendo el código.
const SRC = join(__dirname, '..', '..')
const FRONTEND = join(SRC, '..')
const DESIGN_FILES = new Set(['shared/ui/tokens.css', 'shared/ui/eco.css'])

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    return statSync(path).isDirectory() ? walk(path) : [path]
  })
}

const rel = (path: string) => relative(SRC, path).replace(/\\/g, '/')
const isTest = (path: string) => /\.test\.tsx?$/.test(path)

/** Código y estilos de la aplicación, sin pruebas ni los dos archivos del sistema de diseño. */
const sources = walk(SRC).filter((path) => /\.(ts|tsx|css)$/.test(path) && !isTest(path) && !DESIGN_FILES.has(rel(path)))

function offenders(pattern: RegExp, files = sources) {
  return files.flatMap((path) =>
    readFileSync(path, 'utf8')
      .split('\n')
      .flatMap((line, index) => (pattern.test(line) ? [`${rel(path)}:${index + 1}: ${line.trim().slice(0, 80)}`] : [])),
  )
}

describe('sistema de diseño', () => {
  it('no queda ninguno de los CSS heredados ni nadie los importa', () => {
    for (const legacy of ['index.css', 'App.css', 'interfaces/orderManagement.css', 'features/dashboard/ui/dashboard.css']) {
      expect(existsSync(join(SRC, legacy)), legacy).toBe(false)
    }
    expect(offenders(/(index|App|orderManagement|dashboard)\.css/)).toEqual([])
  })

  it('los estilos vienen solo de tokens.css y eco.css, cargados una vez en main.tsx', () => {
    const cssFiles = walk(SRC).filter((path) => path.endsWith('.css')).map(rel).sort()
    expect(cssFiles).toEqual(['shared/ui/eco.css', 'shared/ui/tokens.css'])
    const main = readFileSync(join(SRC, 'main.tsx'), 'utf8')
    expect(main).toContain("import './shared/ui/tokens.css'")
    expect(main).toContain("import './shared/ui/eco.css'")
  })

  it('no hay colores en hexadecimal, rgb() ni hsl() fuera de tokens.css y eco.css', () => {
    expect(offenders(/#[0-9a-fA-F]{3,8}\b(?![\w-])/)).toEqual([])
    expect(offenders(/\b(rgba?|hsla?)\(/)).toEqual([])
  })

  it('no hay fuentes sueltas: la identidad es Geist por las variables del sistema', () => {
    expect(offenders(/font-family|fontFamily/)).toEqual([])
    const html = readFileSync(join(FRONTEND, 'index.html'), 'utf8')
    expect(html).toContain('family=Geist:')
    expect(html).toContain('family=Geist+Mono:')
    expect(html).not.toMatch(/Inter|Plus\+Jakarta|JetBrains/)
    const tokens = readFileSync(join(SRC, 'shared/ui/tokens.css'), 'utf8')
    expect(tokens).toMatch(/--font-sans: Geist/)
    expect(tokens).toMatch(/--font-mono: "Geist Mono"/)
  })

  it('no hay emoji en la interfaz', () => {
    const emoji = /[\u{1F300}-\u{1FAFF}\u{1F600}-\u{1F64F}☀-➿⭐⬆✅❌]/u
    expect(offenders(emoji)).toEqual([])
  })

  it('no hay degradados de color ni sombras fuera del sistema', () => {
    expect(offenders(/(?<!repeating-)(linear|radial|conic)-gradient|box-shadow|boxShadow/)).toEqual([])
  })

  it('los estilos en línea solo usan variables del sistema, nunca un color literal', () => {
    const inline = offenders(/style=\{\{[^}]*(color|background|border)[^}]*\}\}/)
    for (const line of inline) expect(line, line).toMatch(/var\(--/)
  })

  it('eco.css respeta prefers-reduced-motion y nunca mueve nada con rebotes o pulsos', () => {
    const eco = readFileSync(join(SRC, 'shared/ui/eco.css'), 'utf8')
    expect(eco).toContain('prefers-reduced-motion: reduce')
    expect(eco).not.toMatch(/@keyframes\s+(pulse|bounce)/)
  })
})
