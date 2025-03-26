import type { ReadonlyHeaders } from 'next/dist/server/web/spec-extension/adapters/headers'

const RefreshTimeoutMs = 1000 * 60 // 1 minute

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
  const response = await fetch(url, {
    cache: 'no-cache',
  })
  return (await response.json()) as T
}
