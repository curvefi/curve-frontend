import { describe, expect, it } from 'vitest'
import { relativeTime } from './time.utils'

const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const WEEK = 7 * DAY
const MONTH = 30 * DAY
const YEAR = 365 * DAY
const NOW = Date.UTC(2026, 0, 1)

const ago = (elapsedMs: number) => relativeTime(NOW, NOW - elapsedMs)

describe('relativeTime', () => {
  it('shows just now below five minutes and for future timestamps', () => {
    expect(ago(0)).toBe('just now')
    expect(ago(5 * MINUTE - SECOND)).toBe('just now')
    expect(relativeTime(NOW, NOW + YEAR)).toBe('just now')
  })

  it('uses the largest matching time unit with singular and plural labels', () => {
    expect(ago(5 * MINUTE)).toBe('5 minutes')
    expect(ago(HOUR)).toBe('1 hour')
    expect(ago(2 * HOUR)).toBe('2 hours')
    expect(ago(DAY)).toBe('1 day')
    expect(ago(5 * DAY)).toBe('5 days')
    expect(ago(WEEK)).toBe('1 week')
    expect(ago(2 * WEEK)).toBe('2 weeks')
    expect(ago(MONTH)).toBe('1 month')
    expect(ago(2 * MONTH)).toBe('2 months')
    expect(ago(YEAR)).toBe('1 year')
    expect(ago(2 * YEAR)).toBe('2 years')
  })

  it('rounds values to the nearest whole unit', () => {
    expect(ago(5.5 * MINUTE)).toBe('6 minutes')
    expect(ago(1.5 * HOUR)).toBe('2 hours')
  })
})
