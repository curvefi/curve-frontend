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
  '1h': 1000 * 60 * 60,
  '1d': 1000 * 60 * 60 * 24,
  Inf: Infinity,
} as const

export const TIME_FRAMES = {
  WEEK: 7 * 24 * 60 * 60,
  MONTH: 30 * 24 * 60 * 60,
} as const
