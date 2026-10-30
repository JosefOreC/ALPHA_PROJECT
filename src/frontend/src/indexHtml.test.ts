/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const html = readFileSync(join(__dirname, '..', 'index.html'), 'utf8')

describe('index.html accessibility metadata', () => {
  it('declares the page language as Peruvian Spanish (WCAG 3.1.1)', () => {
    expect(html).toMatch(/<html[^>]*\slang="es-PE"/)
  })

  it('has a descriptive title (WCAG 2.4.2)', () => {
    expect(html).toContain('<title>EcoLogística Lima</title>')
  })
})
