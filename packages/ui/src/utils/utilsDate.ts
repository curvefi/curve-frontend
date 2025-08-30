/**
 * Converts various date formats to a Date object
 * @param input - Date input in various formats
 * @example
 * convertDate(1677649423) // Date object from Unix timestamp
 * convertDate('2023-03-01T12:30:23') // Date object from ISO string
 * convertDate(new Date()) // Returns the same Date object
 */
export const convertDate = (input: Date | number | string): Date => {
  if (typeof input === 'number') {
    return new Date(input * 1000)
  } else if (typeof input === 'string') {
    return new Date(input.includes('Z') ? input : `${input}Z`)
  }

  return input
}

/**
 * Converts date to relative time format
 * @example
 * convertTimeAgo(new Date(Date.now() - 2*60*60*1000)) // "2h"
 * convertTimeAgo(new Date(Date.now() - 30*60*1000)) // "30m"
 * convertTimeAgo(new Date(Date.now() - 2*24*60*60*1000)) // "2d"
 */
export const convertTimeAgo = (input: Date | number | string) => {
  const now = new Date()
  const diffInMs = Math.abs(now.getTime() - convertDate(input).getTime())

  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInDays > 0) {
    return `${diffInDays}d`
  }
  if (diffInHours > 0) {
    return `${diffInHours}h`
  }
  return `${diffInMinutes}m`
}

/**
 * Formats a date into a human-readable string with two variant options.
 *
 * @param date - The date to format. Can be a Date object or a string representation of a date.
 * @param variant - The format variant to use. Defaults to 'short'.
 *   - 'short': Returns date in format "DD MMM YYYY" (e.g., "31 Jan 2025")
 *   - 'long': Returns date and time in format "MMM D, YYYY, H:MM AM/PM" (e.g., "Jan 31, 2025, 12:00 AM")
 *
 * @returns A formatted date string adjusted for the local timezone.
 */
export const formatDate = (date: Date | string, variant: 'short' | 'long' = 'short') => {
  if (typeof date === 'string') {
    // `date` is a string when coming from query cache
    date = new Date(date)
  }
  if (variant === 'short') {
    // example: 31/01/25 adjusted for local timezone
    return new Intl.DateTimeFormat(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date)
    // long
  } else {
    // example: 31 January, 12:00 AM adjusted for local timezone
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date)
  }
}

/**
 * Converts a Unix timestamp to a formatted date string.
 *
 * @param unixTime - The Unix timestamp in seconds (not milliseconds)
 * @returns A formatted date string adjusted for the local timezone.
 *
 * @see {@link formatDate} for formatting the resulting timestamp into human-readable strings
 */
export const formatDateFromTimestamp = (unixTime: number) => {
  const date = new Date(unixTime * 1000)
  return formatDate(date)
}

/**
 * Converts a Unix timestamp to a locale-adjusted timestamp by accounting for the local timezone offset.
 * This function subtracts the timezone offset (in seconds) from the Unix timestamp.
 *
 * @param unixTime - The Unix timestamp in seconds to be converted
 * @returns The adjusted timestamp in seconds, accounting for the local timezone offset
 */
export const convertToLocaleTimestamp = (unixTime: number) => unixTime - new Date().getTimezoneOffset() * 60
