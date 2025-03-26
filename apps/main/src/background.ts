import type { ReadonlyHeaders } from 'next/dist/server/web/spec-extension/adapters/headers'

const RefreshTimeoutMs = 1000 * 60 // 1 minute

/**
 * Refreshes data in the background at a fixed interval. This is useful for keeping data up-to-date without relying on
 * the client to trigger a refresh. The client never needs to wait for the data because it is waiting ready.
 *
 * Note when changing the api routes in development this can be called multiple times,
 * that shouldn't happen when running from a built app.
 */
export async function refreshDataInBackground(name: string, callback: () => Promise<unknown>) {
  // noinspection InfiniteLoopJS
  while (true) {
    const start = Date.now()
    await callback().catch((e) => {
      console.error(`Failed to refresh ${name}`, e)
    })
    const end = new Date()
    const elapsed = end.getTime() - start
    console.log(`${end.toISOString()} Refreshed ${name} in ${elapsed}ms`)
    if (elapsed < RefreshTimeoutMs) {
      await new Promise((resolve) => setTimeout(resolve, RefreshTimeoutMs - elapsed))
    }
  }
}

/**
 * Fetches data from the Next.js server API route. We use API routes to fetch cached data because Next is unable to
 * properly handle fetch failures and background fetching.
 */
export async function getServerData<T>(path: string, headers: ReadonlyHeaders) {
  const hostHeader = headers.get('host') || 'curve.fi'
  const hostName = hostHeader.startsWith('localhost:') ? `http://${hostHeader}` : `https://${hostHeader}`
  const url = `${hostName}/api/${path}`
  let text: string | undefined = undefined
  try {
    const response = await fetch(url, {
      cache: 'no-cache',
    })
    text = await response.text()
    return JSON.parse(text) as T
  } catch (e) {
    console.error(`Failed to parse ${url}: "${text}"`, e)
    return {} as Partial<T>
  }
}
