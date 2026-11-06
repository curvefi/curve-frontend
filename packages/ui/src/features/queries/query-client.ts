import { maybe } from '@primitives/objects.utils'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import type { PersistedClient, Persister } from '@tanstack/query-persist-client-core'
import { QueryCache, QueryClient } from '@tanstack/react-query'
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

export const persister: Persister = createAsyncStoragePersister({
  storage: window.localStorage,
  // Tag bigint values to preserve their type without changing ordinary strings or importing viem.
  serialize: data =>
    JSON.stringify(data, (_, value: unknown) => (typeof value === 'bigint' ? { $bigint: value.toString() } : value)),
  deserialize: data =>
    JSON.parse(
      data,
      (_, value: unknown) => maybe((value as { $bigint?: string } | null)?.$bigint, BigInt) ?? value,
    ) as PersistedClient,
})
