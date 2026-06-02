import { ReactNode } from 'react'
import { type QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type Persister, PersistQueryClientProvider } from '@tanstack/react-query-persist-client'

type QueryProviderWrapperProps = {
  children: ReactNode
  persister: Persister | null
  queryClient: QueryClient
}

export const QueryProvider = ({ children, persister, queryClient }: QueryProviderWrapperProps) =>
  persister ? (
    <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
      {children}
    </PersistQueryClientProvider>
  ) : (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
