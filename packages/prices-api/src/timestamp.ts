declare const TimestampBrand: unique symbol

/** ISO 8601 date string shape (e.g. `"2024-01-01T00:00:00.000Z"`), always including timezone info. */
type IsoDateString = `${number}-${number}-${number}T${string}`

/**
 * A raw, serialized timestamp as returned by the Prices API. The exact shape varies
 * between endpoints, so this is the union of all variants we receive from the backend.
 *
 * Underlying shape is one of:
 * - unix seconds as `number` (e.g. `1704067200`)
 * - unix seconds as `string` (e.g. `"1704067200"`)
 * - ISO 8601 date string (e.g. `"2024-01-01T00:00:00.000Z"`)
 */
export type TimestampResponse = number | `${number}` | IsoDateString

/** Unix epoch milliseconds. Pass to `new Date(t)` to get a `Date`. Branded to enforce being parsed. */
export type Timestamp = number & { readonly [TimestampBrand]: true }

/** Converts a `Date` to the exact type that is expected by a `Timestamp`. */
export const fromDate = (date: Date) => date.getTime() as Timestamp

const TZ_OFFSET = /[+-]\d{2}:?\d{2}$/

/** Coerces any `TimestampResponse` shape to a `Date`. ISO strings without timezone info are assumed UTC. */
function toDate(timestamp: TimestampResponse) {
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

/** Parses a raw `TimestampResponse` (in any of the formats the Prices API returns) into a serializable timestamp in milliseconds to be consumed by `new Date()` */
export const parseTimestamp = (timestamp: TimestampResponse) => fromDate(toDate(timestamp))

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
