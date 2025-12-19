/**
 * Handles a promise with a timeout. If the promise does not resolve within the specified timeout, it rejects with an error.
 */
export const handleTimeout = <T>(promise: Promise<T>, timeout: number, message?: string): Promise<T> =>
  new Promise((resolve, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id)
      reject(new Error(message || `Promise timed out after ${timeout}ms`))
    }, timeout)
    promise.then(resolve, reject)
  })

/**
 * Waits for a callback to return a truthy value, polling at specified intervals, with a timeout.
 */
export const waitFor = async (
  callback: () => unknown,
  { timeout, step = 1000, message }: { timeout: number; message?: string; step?: number },
) => {
  const waitUntil = async () => {
    while (!(await callback())) {
      await new Promise((resolve) => setTimeout(resolve, step))
    }
  }
  await handleTimeout<void>(waitUntil(), timeout, message)
}
