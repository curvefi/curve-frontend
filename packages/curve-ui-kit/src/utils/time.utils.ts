/**
 * Handles a promise with a timeout. If the promise does not resolve within the specified timeout, it rejects with an error.
 */
const handleTimeout = <T>(promise: Promise<T>, timeout: number, message?: string): Promise<T> =>
  new Promise((resolve, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id)
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- Existing violation before enabling this rule.
      reject(new Error(message || `Promise timed out after ${timeout}ms`))
    }, timeout)
    promise.then(resolve, reject).finally(() => clearTimeout(id))
  })

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Waits for a callback to return a truthy value, polling at specified intervals, with a timeout.
 */
export const waitFor = async (
  callback: () => unknown,
  { timeout, step = 1000, message }: { timeout: number; message?: string; step?: number },
) => {
  const waitUntil = async () => {
    while (!(await callback())) await sleep(step)
  }
  await handleTimeout<void>(waitUntil(), timeout, message)
}

export const formatTimeDiff = (start: Date) => `${(new Date().getTime() - start.getTime()).toLocaleString()}ms`
