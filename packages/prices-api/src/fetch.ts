export class FetchError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/**
 * Fetches data from a URL and parses the response as JSON.
 * Custom made to avoid a ky or axios dependency.
 *
 * @template T - The expected type of the parsed JSON data.
 * @param url - The URL to fetch from.
 * @param body - Optional request body for POST requests.
 * @param signal - Optional AbortSignal to abort the fetch request.
 * @returns A Promise that resolves to the parsed JSON data of type T.
 * @throws Error if the fetch fails or returns a non-2xx status code.
 */
export async function fetchJson<T>(
  url: string,
  body?: Record<string, unknown>,
  signal?: AbortSignal
): Promise<T> {
  try {
    const resp = await fetch(url, {
      method: body ? "POST" : "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal,
    });

    if (!resp.ok) {
      // Make the promise be rejected if we didn't get a 2xx response
      throw new FetchError(
        resp.status,
        `Fetch error ${resp.status} for URL: ${url}`
      );
    } else {
      const json = (await resp.json()) as T;

      return json;
    }
  } catch (err) {
    if (err instanceof Error) {
      throw err;
    }

    throw new Error(`Unknown fetch error`);
  }
}
