/**
 * Handles a promise with a timeout. If the promise does not resolve within the specified timeout, it rejects with an error.
 */
const handleTimeout = <T>(promise: Promise<T>, timeout: number, message?: string): Promise<T> =>
  new Promise((resolve, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id)
      reject(new Error(message || `Promise timed out after ${timeout}ms`))
    }, timeout)
    promise.then(resolve, reject).finally(() => clearTimeout(id))
  })

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Waits for a callback to return a truthy value, polling at specified intervals, with a timeout.
 */
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

const JUST_NOW_SECONDS = 5 * 60

const TIME_UNITS = [
  { unit: 'year', seconds: 365 * 24 * 60 * 60 },
  { unit: 'month', seconds: 30 * 24 * 60 * 60 },
  { unit: 'week', seconds: 7 * 24 * 60 * 60 },
  { unit: 'day', seconds: 24 * 60 * 60 },
  { unit: 'hour', seconds: 60 * 60 },
  { unit: 'minute', seconds: 60 },
] as const

/** Formats an elapsed timestamp using the largest matching unit. */
export const relativeTime = (nowMs: number, timestampMs: number): string => {
  const elapsedSeconds = Math.round((nowMs - timestampMs) / 1000)

  if (elapsedSeconds < JUST_NOW_SECONDS) return 'just now'

  for (const { unit, seconds } of TIME_UNITS) {
    if (elapsedSeconds >= seconds) {
      const value = Math.round(elapsedSeconds / seconds)
      return `${value} ${value === 1 ? unit : `${unit}s`}`
    }
  }

  return 'just now'
}
