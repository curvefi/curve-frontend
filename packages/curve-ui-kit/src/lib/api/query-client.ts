import { hashFn } from 'wagmi/query'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import type { Persister } from '@tanstack/query-persist-client-core'
import { QueryClient } from '@tanstack/react-query'
import { mutationCache, queryCache } from './cache'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Double each attempt, from 1s up to 30s
      retry: 3, // retry failed requests before displaying an error
      queryKeyHashFn: hashFn,
    },
  },
  queryCache,
  mutationCache,
})

export const persister: Persister = createAsyncStoragePersister({ storage: window.localStorage })
