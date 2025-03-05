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
