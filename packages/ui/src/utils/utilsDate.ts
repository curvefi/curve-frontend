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
