import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { QueryClient } from '@tanstack/react-query'
import { mutationCache, queryCache } from './cache'

export const queryClient = new QueryClient({
  defaultOptions: {},
  queryCache,
  mutationCache,
})

export const persister =
  typeof window !== 'undefined'
    ? createSyncStoragePersister({
        storage: window.localStorage,
      })
    : null
