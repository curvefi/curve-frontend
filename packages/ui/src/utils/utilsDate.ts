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
 * @param date - The date to format. Can be a Date object, a string representation of a date, or a timestamp in milliseconds.
 * @param variant - The format variant to use. Defaults to 'short'.
 *   - 'short': Returns date in format "DD MMM YYYY" (e.g., "31 Jan 2025")
 *   - 'long': Returns date and time in format "MMM D, YYYY, H:MM AM/PM" (e.g., "Jan 31, 2025, 12:00 AM")
 *
 * @returns A formatted date string adjusted for the local timezone.
 */
export const formatDate = (date: Date | string | number, variant: 'short' | 'long' = 'short') =>
  new Intl.DateTimeFormat(
    undefined,
    variant === 'short'
      ? {
          // short - example: 31/01/25 adjusted for local timezone
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }
      : {
          // long - example: 31 January, 12:00 AM adjusted for local timezone
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        },
  ).format(typeof date === 'object' ? date : new Date(date))

/**
 * Formats a timestamp into HH:MM:SS time format (24-hour clock).
 *
 * @param timestamp - The timestamp to format. Can be a Date object, string, or Unix timestamp in seconds.
 * @returns A formatted time string in HH:MM:SS format (e.g., "14:30:25")
 *
 * @example
 * formatTime(1677649423) // "14:30:23" from Unix timestamp
 * formatTime(new Date()) // "14:30:23" from Date object
 * formatTime('2025-09-08T04:13:47.000Z') // "04:13:47" from ISO string
 */
export const formatTime = (timestamp: number | Date | string) =>
  new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(convertDate(timestamp))

/**
 * Converts a Unix timestamp to a formatted date string.
 *
 * @param unixTime - The Unix timestamp in seconds (not milliseconds)
 * @param variant - The format variant to use. Defaults to 'short'.
 * @returns A formatted date string adjusted for the local timezone.
 *
 * @see {@link formatDate} for formatting the resulting timestamp into human-readable strings
 */
export const formatDateFromTimestamp = (unixTime: number, variant: 'short' | 'long' = 'short') =>
  formatDate(new Date(unixTime * 1000), variant)

/**
 * Converts a Unix timestamp to a locale-adjusted timestamp by accounting for the local timezone offset.
 * This function subtracts the timezone offset (in seconds) from the Unix timestamp.
 *
 * @param unixTime - The Unix timestamp in seconds to be converted
 * @returns The adjusted timestamp in seconds, accounting for the local timezone offset
 */
export const convertToLocaleTimestamp = (unixTime: number) => unixTime - new Date().getTimezoneOffset() * 60

/**
 * Formats a Unix timestamp into a human-readable date string adjusted for the local timezone.
 * @param unixTime - The Unix timestamp in seconds
 * @returns A formatted date string adjusted for the local timezone
 */
export const formatLocaleDateFromTimestamp = (unixTime: number) =>
  formatDateFromTimestamp(convertToLocaleTimestamp(unixTime))

/**
 * Formats a Unix timestamp in milliseconds into a human-readable date string adjusted for the local timezone.
 *
 * @param unixTimeMs - The Unix timestamp in milliseconds. If wished this can be easily expanded to accept Date or string types.
 * @returns A formatted date string adjusted for the local timezone
 */
export const formatLocaleDate = (unixTimeMs: number) => formatDate(unixTimeMs - new Date().getTimezoneOffset() * 60000)
