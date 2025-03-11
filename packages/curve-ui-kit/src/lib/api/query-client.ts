import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { QueryClient } from '@tanstack/react-query'
import { mutationCache, queryCache } from './cache'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Double each attempt, from 1s up to 30s
      retry: 3, // retry failed requests before displaying an error
    },
  },
  queryCache,
  mutationCache,
})

export const persister =
  typeof window !== 'undefined'
    ? createSyncStoragePersister({
        storage: window.localStorage,
      })
    : null
