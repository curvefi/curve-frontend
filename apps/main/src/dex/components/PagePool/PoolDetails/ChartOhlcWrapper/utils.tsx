export function combinations<T>(inputArray: T[], size: number): T[][] {
  const result: T[][] = []

  function combinationHelper(start: number, chosen: T[]) {
    if (chosen.length === size) {
      result.push([...chosen])
      return
    }

    for (let i = start; i < inputArray.length; i++) {
      // Choose one element
      chosen.push(inputArray[i])
      // Generate combinations of smaller size
      combinationHelper(i + 1, chosen)
      // Un-choose the chosen element
      chosen.pop()
    }
  }

  combinationHelper(0, [])
  return result
}

export const convertFullTime = (inputDateString: string) => {
  const dateObj = new Date(inputDateString + 'Z')

  return `${dateObj.toLocaleDateString()}`
}

export const convertTime = (inputDateString: string) => {
  const dateObj = new Date(inputDateString + 'Z')
  const options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }
  return dateObj.toLocaleTimeString(undefined, options)
}

export const convertTimeAgo = (inputDateString: string) => {
  const now = new Date()
  const dateObj = new Date(inputDateString + 'Z')

  const diffInMs = Math.abs(now.getTime() - dateObj.getTime())

  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInDays > 0) {
    return `${diffInDays}d`
  } else if (diffInHours > 0) {
    return `${diffInHours}h`
  } else {
    return `${diffInMinutes}m`
  }
}
