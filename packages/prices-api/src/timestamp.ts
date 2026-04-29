declare const TimestampBrand: unique symbol

/**
 * A serialized timestamp that can indicate many of the timestamp variants
 * as returned by the Prices API.
 *
 * Branded so it can't be used directly as a `number` or `string`. To read
 * the value, pass it through `toDate(...)`. This is intentional: it forces
 * a single, consistent parsing path and prevents accidental arithmetic
 * (e.g. `timestamp * 1000`) or string concatenation on values whose unit
 * (seconds vs. ms) and format (unix vs. ISO) are not guaranteed.
 *
 * Underlying shape is one of:
 * - unix seconds as `number` (e.g. `1704067200`)
 * - unix seconds as `string` (e.g. `"1704067200"`)
 * - ISO 8601 date string (e.g. `"2024-01-01T00:00:00.000Z"`)
 */
export type Timestamp = (number | `${number}` | `${number}-${number}-${number}T${string}`) & {
  readonly [TimestampBrand]: true
}

const TZ_OFFSET = /[+-]\d{2}:?\d{2}$/

/**
 * Converts a timestamp string or number to UTC Date object
 * @param timestamp - Timestamp as string (ISO format or unix seconds) or number (unix seconds)
 * @returns UTC Date object
 * @example
 * toDate(1234567890) // Unix timestamp number
 * toDate("1234567890") // Unix timestamp string
 * toDate("2024-01-01T00:00:00.000Z") // ISO with UTC
 * toDate("2024-01-01T00:00:00.000+01:00") // ISO with timezone
 * toDate("2024-01-01T00:00:00") // ISO without timezone (assumes UTC)
 */
export function toDate(timestamp: Timestamp): Date {
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
