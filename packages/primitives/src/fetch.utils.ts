import { notFalsy } from './objects.utils'
import { retry } from './promise.utils'

const RETRIES = 2
const RETRY_DELAY_MS = 500
const REQUEST_TIMEOUT_MS = 30_000
const EXPONENTIAL_BACKOFF = 2
const RETRY_STATUSES = [0, 408, 425, 429, 500, 502, 503, 504]

/**
 * Converts a Record of string key-value pairs to a URL query string.
 * Ignores keys with null or undefined values, automatically converting other values to strings.
 */
export const addQueryString = (params: Record<string, string | number | boolean | null | undefined>) => {
  const query = new URLSearchParams(
    Object.fromEntries(
      Object.entries(params)
        .filter(([_, value]) => value != null)
        .map(([key, value]) => [key, value!.toString()]),
    ),
  ).toString()
  return query && `?${query}`
}

export class FetchError extends Error {
  constructor(
    public status: number,
    message: string,
    public body: string,
  ) {
    super(message)
  }
}

type RequestOptions = { body?: Record<string, unknown>; headers?: Record<string, unknown>; signal?: AbortSignal }

async function requestJson<T>(url: string, { body, headers, signal }: RequestOptions): Promise<T> {
  const resp = await fetch(url, {
    method: body ? 'POST' : 'GET',
    ...{
      headers: {
        ...headers,
        ...(body && {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        }),
      },
      body: JSON.stringify(body),
    },
    ...(body && { body: JSON.stringify(body) }),
    signal: AbortSignal.any(notFalsy(signal, AbortSignal.timeout(REQUEST_TIMEOUT_MS))),
  }).catch(error => {
    const { message } = error as Error
    if (message == 'Failed to fetch') throw new FetchError(0, `Cannot fetch ${url}`, message)
    throw error
  })
  if (!resp.ok) {
    throw new FetchError(resp.status, `Fetch error ${resp.status} for URL: ${url}`, await resp.text())
  }
  return (await resp.json()) as T
}

const isRetryable = (error: unknown) =>
  (error instanceof FetchError && RETRY_STATUSES.includes(error.status)) || (error as Error).name === 'TimeoutError'

/**
 * Fetches data from a URL and parses the response as JSON.
 * @template T - The expected type of the parsed JSON data.
 * @param url - The URL to fetch from.
 * @param options - Optional request options. A body is JSON-stringified and defaults the method to POST.
 * @returns A Promise that resolves to the parsed JSON data of type T.
 * @throws Error if the fetch fails or returns a non-2xx status code.
 */
export const fetchJson = async <T>(url: string, options: RequestOptions = {}): Promise<T> =>
  retry(() => requestJson<T>(url, options), {
    retries: RETRIES,
    delay: attempt => RETRY_DELAY_MS * EXPONENTIAL_BACKOFF ** attempt,
    signal: options.signal,
    shouldRetry: error => !options.body && !options.signal?.aborted && isRetryable(error),
  })
