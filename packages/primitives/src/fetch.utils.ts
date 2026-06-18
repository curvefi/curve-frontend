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
  ) {
    super(message)
  }
}

/**
 * Fetches data from a URL and parses the response as JSON.
 * @template T - The expected type of the parsed JSON data.
 * @param url - The URL to fetch from.
 * @param body - Optional request body for POST requests.
 * @param signal - Optional AbortSignal to abort the fetch request.
 * @param init - Optional fetch configuration for cache mode, credentials, etc.
 * @returns A Promise that resolves to the parsed JSON data of type T.
 * @throws Error if the fetch fails or returns a non-2xx status code.
 */
export async function fetchJson<T>(
  url: string,
  body?: Record<string, unknown>,
  signal?: AbortSignal,
  init?: Omit<RequestInit, 'body' | 'method' | 'signal'>,
): Promise<T> {
  let headers = init?.headers ? new Headers(init.headers) : undefined
  if (body) {
    headers = headers ?? new Headers()
    headers.set('Accept', headers.get('Accept') ?? 'application/json')
    headers.set('Content-Type', headers.get('Content-Type') ?? 'application/json')
  }

  const resp = await fetch(url, {
    ...init,
    method: body ? 'POST' : 'GET',
    ...(headers && { headers }),
    ...(body && {
      body: JSON.stringify(body),
    }),
    signal,
  })

  if (!resp.ok) {
    throw new FetchError(resp.status, `Fetch error ${resp.status} for URL: ${url}`)
  }
  return (await resp.json()) as T
}
