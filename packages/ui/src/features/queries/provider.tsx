import { ReactNode } from 'react'
import { type Query, type QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type Persister, PersistQueryClientProvider } from '@tanstack/react-query-persist-client'

type QueryProviderWrapperProps = {
  children: ReactNode
  persister: Persister | null
  queryClient: QueryClient
}

const shouldDehydrateQuery = (query: Query) => query.state.status === 'success' && query.meta?.persist !== false

export const QueryProvider = ({ children, persister, queryClient }: QueryProviderWrapperProps) =>
  persister ? (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister, dehydrateOptions: { shouldDehydrateQuery } }}
    >
      {children}
    </PersistQueryClientProvider>
  ) : (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
