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
