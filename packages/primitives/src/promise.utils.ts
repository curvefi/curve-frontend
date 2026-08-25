export const handleTimeout = async <T>(promise: Promise<T>, ms: number, message?: string): Promise<T> => {
  let id: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<never>(
    (_, reject) => (id = setTimeout(() => reject(new Error(message || `Promise timed out after ${ms}ms`)), ms)),
  )
  return await Promise.race([promise, timeout]).finally(() => clearTimeout(id))
}

type RetryOptions = {
  retries: number
  delay: (attempt: number) => number
  shouldRetry: (error: unknown) => boolean
  signal?: AbortSignal
  timeout?: number
  timeoutMessage?: string
}

const getAbortError = (signal: AbortSignal) =>
  signal.reason instanceof Error ? signal.reason : new Error('Request aborted')

const sleep = (ms: number, signal?: AbortSignal) => {
  if (signal?.aborted) return Promise.reject(getAbortError(signal))

  return new Promise<void>((resolve, reject) => {
    const id = setTimeout(resolve, ms)
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(id)
        reject(getAbortError(signal))
      },
      { once: true },
    )
  })
}

export async function retry<T>(
  fn: () => Promise<T>,
  { retries, delay, shouldRetry, signal, timeout, timeoutMessage }: RetryOptions,
) {
  for (let attempt = 0; ; attempt++) {
    try {
      const promise = fn()
      return await (timeout == null ? promise : handleTimeout(promise, timeout, timeoutMessage))
    } catch (error) {
      if (signal?.aborted) throw getAbortError(signal)
      if (attempt >= retries || !shouldRetry(error)) throw error
      await sleep(delay(attempt), signal)
    }
  }
}
