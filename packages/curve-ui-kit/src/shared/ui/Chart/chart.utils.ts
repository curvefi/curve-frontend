import { TIME_FRAMES } from '@ui-kit/lib/model/time'

type MovingAverageConfig<T> = {
  /** Extract the numeric value to average */
  getValue: (item: T) => number
  /** Extract the timestamp in milliseconds */
  getTimestamp: (item: T) => number
  /** Window size in milliseconds (defaults to 7 days) */
  windowMs?: number
}

type WithAverages = { movingAverage: number; totalAverage: number }

/**
 * Enriches a sorted time-series array with a moving average and total average.
 * Data must be sorted by timestamp ascending before calling this function.
 */
export function addMovingAverages<T>(data: T[], config: MovingAverageConfig<T>): (T & WithAverages)[] {
  const { getValue, getTimestamp, windowMs = 7 * TIME_FRAMES.DAY_MS } = config

  if (data.length === 0) return []

  const totalAverage = data.reduce((sum, item) => sum + getValue(item), 0) / data.length

  const values = data.map(getValue)
  const timestamps = data.map(getTimestamp)

  let windowStart = 0
  let windowSum = 0

  return data.map((item, i) => {
    windowSum += values[i]
    while (timestamps[windowStart] < timestamps[i] - windowMs) {
      windowSum -= values[windowStart]
      windowStart++
    }

    return {
      ...item,
      movingAverage: windowSum / (i - windowStart + 1),
      totalAverage,
    }
  })
}
