const TZ_OFFSET = /[+-]\d{2}:?\d{2}$/

/**
 * Converts a timestamp string or number to UTC Date object
 * @param timestamp - Timestamp as string (ISO format) or number (unix seconds)
 * @returns UTC Date object
 * @example
 * toUTC(1234567890)
 * toUTC("2024-01-01T00:00:00.000Z")
 * toUTC("2024-01-01T00:00:00.000Z+01:00")
 * toUTC("2024-01-01T00:00:00") // (assumes UTC)
 */
export function toUTC(timestamp: string | number): Date {
  // Convert actual unix timestamp numbers to Date.
  if (typeof timestamp === 'number') {
    return new Date(timestamp * 1000)
  }

  // Convert actual unix timestamp strings to Date.
  const parsed = Number(timestamp)
  if (!Number.isNaN(parsed)) {
    return new Date(parsed * 1000)
  }

  // Append 'Z' only if no timezone info is present, assuming UTC (Z or +00:00 for example).
  const hasTimezone = timestamp.endsWith('Z') || TZ_OFFSET.test(timestamp)
  const utcTimestamp = hasTimezone ? timestamp : `${timestamp}Z`

  return new Date(utcTimestamp)
}

const ONE_DAY_IN_SECONDS = 24 * 60 * 60

type TimeRangeParams = {
  end?: number
  start?: number
  daysRange?: number
}

/**
 * Get start and end unix timestamps for a time range for the prices API.
 * @param params - Configuration object
 * @returns Object with start and end timestamps
 * @example
 * getTimeRange() // {end: <now>, start: <now - 10 days>}
 * getTimeRange({ end: 1704067200 }) // {end: 1704067200, start: 1703203200}
 * getTimeRange({ end: 1704067200, start: 1703203200 }) // {end: 1704067200, start: 1703203200}
 * getTimeRange({ daysRange: 30 }) // {end: <now>, start: <now - 30 days>}
 */
export function getTimeRange({ end, start, daysRange = 10 }: TimeRangeParams = {}) {
  end ??= Math.floor(Date.now() / 1000)
  start ??= end - daysRange * ONE_DAY_IN_SECONDS

  return {
    end,
    start,
  }
}
