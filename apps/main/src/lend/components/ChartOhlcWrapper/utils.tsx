export function combinations<T>(inputArray: T[], size: number): T[][] {
  const result: T[][] = []

  function combinationHelper(start: number, chosen: T[]) {
    if (chosen.length === size) {
      result.push([...chosen])
      return
    }

    inputArray.forEach((element, i) => {
      // Choose one element
      chosen.push(element)
      // Generate combinations of smaller size
      combinationHelper(i + 1, chosen)
      // Un-choose the chosen element
      chosen.pop()
    })
  }

  combinationHelper(0, [])
  return result
}

export const convertFullTime = (input: string | number) => {
  // handle difference in llamma and pool time format
  let inputString = input
  if (typeof input === 'number') {
    const date: Date = new Date(input * 1000)
    const dateString: string = date.toISOString()
    inputString = dateString
  }

  const dateObj = new Date(inputString)

  return `${dateObj.toLocaleDateString()}`
}

export const convertTime = (input: string | number) => {
  // handle difference in llamma and pool time format
  let inputString = input
  if (typeof input === 'number') {
    const date: Date = new Date(input * 1000)
    const dateString: string = date.toISOString()
    inputString = dateString
  }

  const dateObj = new Date(inputString)
  const options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }
  return dateObj.toLocaleTimeString(undefined, options)
}

export const convertTimeAgo = (input: string | number) => {
  // handle difference in llamma and pool time format
  let inputString = input
  if (typeof input === 'number') {
    const date: Date = new Date(input * 1000)
    const dateString: string = date.toISOString()
    inputString = dateString
  }

  const now = new Date()
  const dateObj = new Date(inputString)

  const diffInMs = Math.abs(now.getTime() - dateObj.getTime())

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
