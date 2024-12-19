import { type QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type Persister, PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ReactNode } from 'react'

type QueryProviderWrapperProps = {
  children: ReactNode
  persister: Persister | null
  queryClient: QueryClient
}

// Cypress runs in dev mode which means the devtools button is visible, which may break tests.
const isCypress = typeof window !== 'undefined' && (window as any).Cypress

export function QueryProvider({ children, persister, queryClient }: QueryProviderWrapperProps) {
  children = (
    <>
      {children}
      {!isCypress && <ReactQueryDevtools />}
    </>
  )

  if (persister) {
    return (
      <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
        {children}
      </PersistQueryClientProvider>
    )
  }

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
