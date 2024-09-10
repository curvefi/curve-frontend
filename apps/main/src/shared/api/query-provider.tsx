import { type QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { type Persister, PersistQueryClientProvider } from "@tanstack/react-query-persist-client"
import type { ReactNode } from "react"

type QueryProviderWrapperProps = {
  children: ReactNode
  persister: Persister | null
  queryClient: QueryClient
}

export function QueryProviderWrapper({ children, persister, queryClient }: QueryProviderWrapperProps) {
  if (persister) {
    return (
      <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
        {children}
      </PersistQueryClientProvider>
    )
  }
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
