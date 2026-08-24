const MILLISECONDS_PER_SECOND = 1000
const SECONDS_PER_MINUTE = 60
const SECONDS_PER_HOUR = 60 * SECONDS_PER_MINUTE
const SECONDS_PER_DAY = 24 * SECONDS_PER_HOUR
const SECONDS_PER_WEEK = 7 * SECONDS_PER_DAY
const SECONDS_PER_MONTH = 30 * SECONDS_PER_DAY
const SECONDS_PER_HALF_YEAR = 180 * SECONDS_PER_DAY
const SECONDS_PER_YEAR = 365 * SECONDS_PER_DAY

const toMilliseconds = (seconds: number) => seconds * MILLISECONDS_PER_SECOND

export const REFRESH_INTERVAL = {
  '1s': MILLISECONDS_PER_SECOND,
  '2s': toMilliseconds(2),
  '3s': toMilliseconds(3),
  '4s': toMilliseconds(4),
  '10s': toMilliseconds(10),
  '15s': toMilliseconds(15),
  '1m': toMilliseconds(SECONDS_PER_MINUTE),
  '5m': toMilliseconds(5 * SECONDS_PER_MINUTE),
  '10m': toMilliseconds(10 * SECONDS_PER_MINUTE),
  '11m': toMilliseconds(11 * SECONDS_PER_MINUTE),
  '15m': toMilliseconds(15 * SECONDS_PER_MINUTE),
  '1h': toMilliseconds(SECONDS_PER_HOUR),
  '1d': toMilliseconds(SECONDS_PER_DAY),
  Inf: Infinity,
} as const

export const TIME_FRAMES = {
  DAY_MS: toMilliseconds(SECONDS_PER_DAY),
  WEEK: SECONDS_PER_WEEK,
  MONTH: SECONDS_PER_MONTH,
  MONTH_MS: toMilliseconds(SECONDS_PER_MONTH),
  HALF_YEAR_MS: toMilliseconds(SECONDS_PER_HALF_YEAR),
  YEAR_MS: toMilliseconds(SECONDS_PER_YEAR),
} as const

/** Selectable time range options (in ms) for chart x-axis timeframes and candle sizes. */
export const TIME_OPTION_MS = {
  '15m': toMilliseconds(15 * SECONDS_PER_MINUTE),
  '30m': toMilliseconds(30 * SECONDS_PER_MINUTE),
  '1h': toMilliseconds(SECONDS_PER_HOUR),
  '4h': toMilliseconds(4 * SECONDS_PER_HOUR),
  '6h': toMilliseconds(6 * SECONDS_PER_HOUR),
  '12h': toMilliseconds(12 * SECONDS_PER_HOUR),
  '1d': toMilliseconds(SECONDS_PER_DAY),
  '7d': toMilliseconds(7 * SECONDS_PER_DAY),
  '14d': toMilliseconds(14 * SECONDS_PER_DAY),
  '1M': toMilliseconds(SECONDS_PER_MONTH),
  '6M': toMilliseconds(SECONDS_PER_HALF_YEAR),
  '1Y': toMilliseconds(SECONDS_PER_YEAR),
} as const

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/** Handles a promise with a timeout. If the promise does not resolve within the specified timeout, it rejects with an error. */
const handleTimeout = <T>(promise: Promise<T>, timeout: number, message?: string): Promise<T> =>
  new Promise((resolve, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id)
      reject(new Error(message || `Promise timed out after ${timeout}ms`))
    }, timeout)
    promise.then(resolve, reject).finally(() => clearTimeout(id))
  })

/** Waits for a callback to return a truthy value, polling at specified intervals, with a timeout. */
export const waitFor = async (
  callback: () => unknown,
  { timeout, step = 1000, message }: { timeout: number; message?: string; step?: number },
) => {
  const waitUntil = async () => {
    while (!(await callback())) await sleep(step)
  }
  await handleTimeout<void>(waitUntil(), timeout, message)
}

export const formatTimeDiff = (start: Date) => `${(new Date().getTime() - start.getTime()).toLocaleString()}ms`

const TIME_UNITS = [
  { unit: 'year', seconds: SECONDS_PER_YEAR },
  { unit: 'month', seconds: SECONDS_PER_MONTH },
  { unit: 'week', seconds: SECONDS_PER_WEEK },
  { unit: 'day', seconds: SECONDS_PER_DAY },
  { unit: 'hour', seconds: SECONDS_PER_HOUR },
  { unit: 'minute', seconds: SECONDS_PER_MINUTE },
] as const

const JUST_NOW_SECONDS = 5 * SECONDS_PER_MINUTE

/** Formats an elapsed timestamp using the largest matching unit. */
export const relativeTime = (nowMs: number, timestampMs: number): string => {
  const elapsedSeconds = Math.round((nowMs - timestampMs) / MILLISECONDS_PER_SECOND)

  if (elapsedSeconds < JUST_NOW_SECONDS) return 'just now'

  for (const { unit, seconds } of TIME_UNITS) {
    if (elapsedSeconds >= seconds) {
      const value = Math.round(elapsedSeconds / seconds)
      return `${value} ${value === 1 ? unit : `${unit}s`}`
    }
  }

  return 'just now'
}
