export const notFalsy = <T>(...items: (T | null | undefined | false | 0)[]): T[] => items.filter(Boolean) as T[]

export const handleTimeout = <T>(promise: Promise<T>, timeout: number, message?: string): Promise<T> =>
  new Promise((resolve, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id)
      reject(new Error(message || `Promise timed out after ${timeout}ms`))
    }, timeout)
    promise.then(resolve, reject)
  })
