import { throttle } from 'lodash'
import { maybe } from '@primitives/objects.utils'
import type { PersistedClient, Persister } from '@tanstack/query-persist-client-core'
import { QueryCache, QueryClient } from '@tanstack/react-query'
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

/**
 * TanStack's async persister swallows save errors; this implementation lets them surface.
 * Tagged bigints preserve query data without wallet dependencies.
 */
export const persister = {
  persistClient: throttle(
    (data: PersistedClient) =>
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data, (_, value: unknown) =>
          typeof value === 'bigint' ? { $bigint: value.toString() } : value,
        ),
      ),
    REFRESH_INTERVAL['1s'],
  ),
  restoreClient: () =>
    maybe(
      window.localStorage.getItem(STORAGE_KEY),
      data =>
        JSON.parse(
          data,
          (_, value: unknown) => maybe((value as { $bigint?: string } | null)?.$bigint, BigInt) ?? value,
        ) as PersistedClient,
    ),
  removeClient: () => {
    persister.persistClient.cancel()
    window.localStorage.removeItem(STORAGE_KEY)
  },
} satisfies Persister
