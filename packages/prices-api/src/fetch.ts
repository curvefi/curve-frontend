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
 * @returns A Promise that resolves to the parsed JSON data of type T.
 * @throws Error if the fetch fails or returns a non-2xx status code.
 */
export async function fetchJson<T>(url: string, body?: Record<string, unknown>, signal?: AbortSignal): Promise<T> {
  const resp = await fetch(url, {
    method: body ? 'POST' : 'GET',
    ...(body && {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }),
    signal,
  })

  if (!resp.ok) {
    // Make the promise be rejected if we didn't get a 2xx response
    throw new FetchError(resp.status, `Fetch error ${resp.status} for URL: ${url}`)
  }
  return (await resp.json()) as T
}
