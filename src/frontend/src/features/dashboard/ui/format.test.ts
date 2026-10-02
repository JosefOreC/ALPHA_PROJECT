import { describe, expect, it } from 'vitest'
import { formatDay, formatDecimal, formatInt, formatPercentOf, formatTime, trimSeconds } from './format'

describe('number formatting', () => {
  it('groups integers with commas', () => {
    expect(formatInt(1248)).toBe('1,248')
  })

  it('shows one decimal for km/kg and a bare 0 for zero', () => {
    expect(formatDecimal(3482.6)).toBe('3,482.6')
    expect(formatDecimal(241)).toBe('241.0')
    expect(formatDecimal(0)).toBe('0')
  })

  it('expresses a share of the total as a percentage with one decimal', () => {
    expect(formatPercentOf(812, 1248)).toBe('65.1 %')
    expect(formatPercentOf(0, 0)).toBe('0 %')
  })
})

describe('date and time formatting', () => {
  it('shows weekday and dd/mm/yyyy in es-PE', () => {
    expect(formatDay('2026-10-01')).toEqual({ weekday: 'jueves', date: '01/10/2026' })
  })

  it('trims seconds from operating hours', () => {
    expect(trimSeconds('05:00:00')).toBe('05:00')
  })

  it('formats a Date as local HH:mm with zero padding', () => {
    expect(formatTime(new Date(2026, 9, 1, 9, 5))).toBe('09:05')
  })
})
