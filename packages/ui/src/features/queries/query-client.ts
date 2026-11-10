import { throttle } from 'lodash'
import { captureException } from '@sentry/react'
import type { PersistedClient, Persister } from '@tanstack/query-persist-client-core'
import { QueryCache, QueryClient } from '@tanstack/react-query'
import { createIndexedDBStore } from '@ui/features/storage/indexed-db'
import { REFRESH_INTERVAL } from '@ui/lib/time'
import { mutationCache } from './cache'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // Double each attempt, from 1s up to 30s
      retry: 3, // retry failed requests before displaying an error
    },
  },
  queryCache: new QueryCache(),
  mutationCache,
})

const STORAGE_KEY = 'REACT_QUERY_OFFLINE_CACHE'
const queryStorage = createIndexedDBStore<PersistedClient>(STORAGE_KEY, 'cache')
let persistenceDisabled = !('indexedDB' in window)

/** Persistence is optional; storage failures leave the query client's memory cache available. */
const withPersistence = async <T>(operation: () => Promise<T>) => {
  if (persistenceDisabled) return
  try {
    return await operation()
  } catch (error) {
    if (!persistenceDisabled) captureException(error)
    persistenceDisabled = true
  }
}

export const persister = {
  persistClient: throttle(
    (data: PersistedClient) => withPersistence(() => queryStorage.set(STORAGE_KEY, data)),
    REFRESH_INTERVAL['1s'],
  ),
  restoreClient: () =>
    withPersistence(async () => {
      window.localStorage.removeItem(STORAGE_KEY) // Discard the legacy cache to free its localStorage quota.
      return await queryStorage.get(STORAGE_KEY)
    }),
  removeClient: () => {
    persister.persistClient.cancel()
    return withPersistence(() => queryStorage.remove(STORAGE_KEY))
  },
} satisfies Persister
