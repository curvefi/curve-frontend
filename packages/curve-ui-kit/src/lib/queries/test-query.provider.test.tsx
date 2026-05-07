import { type ReactNode, useEffect, useMemo } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export function TestQueryProvider({
  children,
  data,
}: {
  children: ReactNode
  data: Parameters<QueryClient['setQueryData']>[]
}) {
  const client = useMemo(() => new QueryClient({ defaultOptions: { queries: { retry: false } } }), [])
  useEffect(
    () => data.forEach(([key, data]) => void client.setQueryData(key, data)),
    // eslint-disable-next-line @eslint-react/exhaustive-deps
    [client],
  )
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
