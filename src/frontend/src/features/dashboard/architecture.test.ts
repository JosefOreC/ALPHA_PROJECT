/// <reference types="node" />
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { checkFeature, sourceFiles } from '../../test/architectureRules'

const LAYERS = ['domain', 'application', 'infrastructure', 'ui']

describe('dashboard hexagonal boundaries (real feature)', () => {
  it('has no violations', () => {
    expect(checkFeature(__dirname)).toEqual([])
  })

  it('scans a non-empty set of files per layer plus index.ts and test/', () => {
    const files = sourceFiles(__dirname)
    for (const dir of LAYERS) expect(files.some((f) => f.startsWith(`${dir}/`))).toBe(true)
    expect(files).toContain('index.ts')
    expect(files.some((f) => f.startsWith('test/'))).toBe(true)
  })
})

// Each rule is proven against a temp-dir feature containing a deliberate violation.
describe('architecture checker detects violations (fixtures)', () => {
  const dirs: string[] = []
  afterEach(() => {
    for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true })
  })

  function feature(files: Record<string, string>): string[] {
    const root = mkdtempSync(join(tmpdir(), 'arch-'))
    dirs.push(root)
    for (const [rel, source] of Object.entries(files)) {
      const path = join(root, rel)
      mkdirSync(dirname(path), { recursive: true })
      writeFileSync(path, source)
    }
    return checkFeature(root)
  }

  it('accepts a clean feature', () => {
    expect(
      feature({
        'domain/a.ts': "import type { B } from './b'\nexport type A = B\n",
        'domain/b.ts': 'export type B = string\n',
        'application/h.ts':
          "import { useState } from 'react'\nimport type { A } from '../domain/a'\nexport const x = useState<A>\n",
        'ui/p.tsx': "import { x } from '../application/h'\nexport const p = x\n",
        'infrastructure/g.ts': 'export const g = (f: typeof fetch) => fetch\n',
        'index.ts': "export { g } from './infrastructure/g'\n",
        'test/f.ts': "import type { A } from '../domain/a'\nexport type F = A\n",
      }),
    ).toEqual([])
  })

  describe('domain', () => {
    const cases: Record<string, string> = {
      'a bare npm package': "import z from 'zod'\n",
      react: "import { useState } from 'react'\n",
      'a type-only bare import': "import type { X } from 'some-lib'\n",
      'a relative import escaping domain': "import { g } from '../infrastructure/g'\n",
      'a relative import into application': "import type { h } from '../application/h'\n",
      'an export-from of a package': "export { y } from 'lodash'\n",
      'a side-effect import': "import 'polyfill'\n",
      'a dynamic import': "const m = import('axios')\n",
      'global fetch': "export const f = () => fetch('/x')\n",
      'global window': 'export const w = window.innerWidth\n',
      'global document': 'export const d = document.title\n',
      'global localStorage': "export const s = localStorage.getItem('k')\n",
    }
    for (const [name, source] of Object.entries(cases)) {
      it(`flags ${name}`, () => {
        const found = feature({
          'domain/a.ts': source,
          'application/h.ts': 'export const h = 1\n',
          'infrastructure/g.ts': 'export const g = 1\n',
        })
        expect(found.some((v) => v.startsWith('domain/a.ts'))).toBe(true)
      })
    }

    it('allows relative type-only imports inside domain', () => {
      expect(
        feature({
          'domain/a.ts': "import type { B } from './sub/b'\n",
          'domain/sub/b.ts': 'export type B = 1\n',
        }),
      ).toEqual([])
    })
  })

  describe('application', () => {
    const cases: Record<string, string> = {
      'infrastructure import': "import { g } from '../infrastructure/g'\n",
      'ui import': "import { p } from '../ui/p'\n",
      'a dynamic import of infrastructure': "const m = import('../infrastructure/g')\n",
      'export-from infrastructure': "export { g } from '../infrastructure/g'\n",
      'global fetch': "export const f = () => fetch('/x')\n",
      'global window': 'export const w = window\n',
      'global document': 'export const d = document\n',
    }
    for (const [name, source] of Object.entries(cases)) {
      it(`flags ${name}`, () => {
        const found = feature({
          'application/h.ts': source,
          'infrastructure/g.ts': 'export const g = 1\n',
          'ui/p.tsx': 'export const p = 1\n',
        })
        expect(found.some((v) => v.startsWith('application/h.ts'))).toBe(true)
      })
    }

    it('allows react (deliberate exception for hooks)', () => {
      expect(
        feature({ 'application/h.ts': "import { useState } from 'react'\nexport const s = useState\n" }),
      ).toEqual([])
    })
  })

  describe('ui', () => {
    const cases: Record<string, string> = {
      'infrastructure import': "import { g } from '../infrastructure/g'\n",
      'side-effect infrastructure import': "import '../infrastructure/g'\n",
      'global fetch': "export const f = () => fetch('/x')\n",
    }
    for (const [name, source] of Object.entries(cases)) {
      it(`flags ${name}`, () => {
        const found = feature({ 'ui/p.tsx': source, 'infrastructure/g.ts': 'export const g = 1\n' })
        expect(found.some((v) => v.startsWith('ui/p.tsx'))).toBe(true)
      })
    }

    it('does not flag property access named fetch or comments mentioning it', () => {
      expect(
        feature({ 'ui/p.tsx': '// fetch window document\nexport const x = { fetch: 1 }.fetch\n' }),
      ).toEqual([])
    })
  })

  describe('files outside the layers', () => {
    it('scans index.ts and flags bare packages there', () => {
      expect(feature({ 'index.ts': "export { y } from 'lodash'\n" }).length).toBeGreaterThan(0)
    })

    it('flags test/ helpers importing infrastructure or ui', () => {
      const found = feature({
        'test/f.ts': "import { g } from '../infrastructure/g'\n",
        'infrastructure/g.ts': 'export const g = 1\n',
      })
      expect(found.some((v) => v.startsWith('test/f.ts'))).toBe(true)
    })

    it('flags unclassified files and unknown top-level directories', () => {
      expect(feature({ 'stray.ts': 'export const s = 1\n' }).length).toBeGreaterThan(0)
      expect(feature({ 'newlayer/a.ts': 'export const s = 1\n' }).length).toBeGreaterThan(0)
    })

    it('does not scan *.test.* files', () => {
      expect(feature({ 'domain/a.test.ts': "import z from 'zod'\n" })).toEqual([])
    })
  })
})
