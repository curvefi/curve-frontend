import type { TimeOptions } from './types'

const seconds = {
  '5m': 5 * 60,
  '15m': 15 * 60,
  '30m': 30 * 60,
  '1h': 60 * 60,
  '4h': 4 * 60 * 60,
  '6h': 6 * 60 * 60,
  '12h': 12 * 60 * 60,
  '1d': 24 * 60 * 60,
  '7d': 7 * 24 * 60 * 60,
  '14d': 14 * 24 * 60 * 60,
} as const

export const subtractTimeUnit = (timeOption: TimeOptions, timestamp: number) => timestamp - seconds[timeOption]

export const getThreeHundredResultsAgo = (timeOption: TimeOptions, timestamp: number) =>
  Math.floor(timestamp - 299 * seconds[timeOption])

export const convertToLocaleTimestamp = (unixTimestamp: number) => {
  const offsetInSeconds = new Date().getTimezoneOffset() * 60
  return unixTimestamp - offsetInSeconds
}

/**
 * Converts an HSLA color string to RGB format
 * Lightweight Cahrts v5 adds support for HSLA, but until then we need to convert to RGB
 * @param hsla - HSLA color string (e.g. "hsla(230, 60%, 29%, 1)")
 * @returns RGB color string (e.g. "rgb(44, 57, 118)")
 * @example
 * hslaToRgb("hsla(230, 60%, 29%, 1)") // returns "rgb(44, 57, 118)"
 * hslaToRgb("hsl(230, 60%, 29%)") // returns "rgb(44, 57, 118)"
 */
export function hslaToRgb(hsla: string) {
  return hsla.replace(/hsla?\((\d+),\s*(\d+)%,\s*(\d+)%(?:,\s*[\d.]+)?\)/, (_, h, s, l) => {
    const a = s / 100
    const b = l / 100
    const k = (n: number) => (n + h / 30) % 12
    const f = (n: number) => b - a * Math.min(b, 1 - b) * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1))
    return `rgb(${Math.round(255 * f(0))}, ${Math.round(255 * f(8))}, ${Math.round(255 * f(4))})`
  })
}
