import { createContext, type ReactElement, use, useState } from 'react'
import { WagmiProvider, type ResolvedRegister } from 'wagmi'
import { queryClient, QueryProvider } from '@evm-ui/lib/api'
import { ThemeProvider } from '@evm-ui/shared/ui/ThemeProvider'
import { WithWrapper } from '@evm-ui/shared/ui/WithWrapper'
import { Toast } from '@evm-ui/widgets/Toast'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { createMemoryHistory, createRootRoute, createRouter, RouterProvider } from '@tanstack/react-router'

export type Config = ResolvedRegister['config']

type Props = {
  config?: Config
  children: ReactElement
  autoConnect?: boolean
}

const ComponentTestChildrenContext = createContext<ReactElement | null>(null)
const ComponentTestRoute = () => use(ComponentTestChildrenContext)

/**
 * Client wrapper for Cypress component testing.
 *
 * Provides the necessary providers (Wagmi, Query, Theme, Router) for testing components
 * that depend on web3 functionality, UI theming, and routing.
 *
 * Similar to apps/main/src/app/ClientWrapper.tsx but optimized for the testing environment.
 */
export function ComponentTestWrapper({ config, children, autoConnect }: Props) {
  // Keep the stateful router stable when test children trigger a wrapper re-render.
  const [router] = useState(() =>
    createRouter({
      routeTree: createRootRoute({ component: ComponentTestRoute }),
      history: createMemoryHistory({ initialEntries: ['/'] }),
    }),
  )

  return (
    <ThemeProvider theme="light">
      <WithWrapper Wrapper={WagmiProvider} shouldWrap={config} config={config!} reconnectOnMount={autoConnect}>
        {/* Persistence can restore stale mocked queries after Cypress clears state, leaking data between tests. */}
        <QueryProvider persister={null} queryClient={queryClient}>
          <ComponentTestChildrenContext value={children}>
            <RouterProvider router={router} />
          </ComponentTestChildrenContext>
          <Toast />
          <ReactQueryDevtools />
        </QueryProvider>
      </WithWrapper>
    </ThemeProvider>
  )
}
