import { type QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { type Persister, PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import React, { ReactNode } from 'react'

type QueryProviderWrapperProps = {
  children: ReactNode
  persister: Persister | null
  queryClient: QueryClient
}

export function QueryProvider({ children, persister, queryClient }: QueryProviderWrapperProps) {
  const content = (<>{children}<ReactQueryDevtools /></>)
  if (persister) {
    return (
      <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
        {content}
      </PersistQueryClientProvider>
    )
  }
  return <QueryClientProvider client={queryClient}>{content}</QueryClientProvider>
}
