/** Captures fetch URLs per async test case so live endpoint failures show the exact request. */
import { AsyncLocalStorage } from 'node:async_hooks'

type FetchTrackerContext = {
  urls: string[]
}

const fetchTracker = new AsyncLocalStorage<FetchTrackerContext>()
const originalFetch = globalThis.fetch.bind(globalThis)

const fetchInputUrl = (input: Parameters<typeof fetch>[0]) =>
  typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url

/** Patches global fetch once; AsyncLocalStorage keeps concurrent endpoint cases isolated. */
globalThis.fetch = (input, init) => {
  // eslint-disable-next-line local/no-mutable-array-methods -- Existing violation before creating this rule.
  fetchTracker.getStore()?.urls.push(fetchInputUrl(input))
  return originalFetch(input, init)
}

/** Creates an isolated URL capture context around one async operation. */
export const createFetchTracker = () => {
  const context: FetchTrackerContext = { urls: [] }

  return {
    urls: context.urls,
    run: <T>(run: () => Promise<T>) => fetchTracker.run(context, run),
  }
}

/** Formats captured URLs for Vitest failure annotations. */
export const formatTrackedFetchUrls = (urls: string[]) => {
  const uniqueUrls = [...new Set(urls)]
  return uniqueUrls.length === 0 ? 'No endpoint URL was captured before the failure.' : uniqueUrls.join('\n')
}
