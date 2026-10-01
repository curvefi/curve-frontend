import { type ReactNode, useEffect, useMemo } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { QueryKeyObject } from '@ui/features/queries/factory'

export function TestQueryProvider({ children, data }: { children: ReactNode; data: [QueryKeyObject, unknown][] }) {
  const client = useMemo(() => new QueryClient({ defaultOptions: { queries: { retry: false } } }), [])
  data.forEach(([key, data]) =>
    // eslint-disable-next-line @eslint-react/rules-of-hooks
    useEffect(
      () => void client.setQueryData([key], data),
      // eslint-disable-next-line @eslint-react/exhaustive-deps, @typescript-eslint/no-unsafe-assignment -- Existing violation before enabling this rule.
      [client, ...(data && typeof data === 'object' ? Object.values(data) : [data])],
    ),
  )
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
