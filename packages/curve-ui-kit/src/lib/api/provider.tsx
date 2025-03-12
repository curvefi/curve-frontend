import { isCypress } from 'curve-ui-kit/src/utils'
import { ReactNode } from 'react'
import { type QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { type Persister, PersistQueryClientProvider } from '@tanstack/react-query-persist-client'

type QueryProviderWrapperProps = {
  children: ReactNode
  persister: Persister | null
  queryClient: QueryClient
}

// Cypress runs in dev mode which means the devtools button is visible, which may break tests.
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
