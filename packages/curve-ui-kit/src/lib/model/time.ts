export const REFRESH_INTERVAL = {
  '1s': 1000,
  '2s': 1000 * 2,
  '3s': 1000 * 3,
  '4s': 1000 * 4,
  '10s': 1000 * 10,
  '15s': 1000 * 15,
  '1m': 1000 * 60,
  '5m': 1000 * 60 * 5,
  '10m': 1000 * 60 * 10,
  '11m': 1000 * 60 * 11,
  '15m': 1000 * 60 * 15,
  '1h': 1000 * 60 * 60,
  '1d': 1000 * 60 * 60 * 24,
  Inf: Infinity,
} as const

export const TIME_FRAMES = {
  DAY_MS: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60,
  MONTH: 30 * 24 * 60 * 60,
  MONTH_MS: 30 * 24 * 60 * 60 * 1000,
  HALF_YEAR_MS: 180 * 24 * 60 * 60 * 1000,
  YEAR_MS: 365 * 24 * 60 * 60 * 1000,
} as const

const MINUTE_MS = 60 * 1000
const HOUR_MS = 60 * MINUTE_MS

export const TIME_OPTION_MS = {
  '15m': 15 * MINUTE_MS,
  '30m': 30 * MINUTE_MS,
  '1h': HOUR_MS,
  '4h': 4 * HOUR_MS,
  '6h': 6 * HOUR_MS,
  '12h': 12 * HOUR_MS,
  '1d': TIME_FRAMES.DAY_MS,
  '7d': 7 * TIME_FRAMES.DAY_MS,
  '14d': 14 * TIME_FRAMES.DAY_MS,
  '1M': TIME_FRAMES.MONTH_MS,
  '6M': TIME_FRAMES.HALF_YEAR_MS,
  '1Y': TIME_FRAMES.YEAR_MS,
} as const
