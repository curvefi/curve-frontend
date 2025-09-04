import React, { type ReactElement } from 'react'
import { WagmiProvider, type ResolvedRegister } from 'wagmi'
import { createMemoryHistory, createRootRoute, createRouter, RouterProvider } from '@tanstack/react-router'
import { persister, queryClient, QueryProvider } from '@ui-kit/lib/api'
import { ThemeProvider } from '@ui-kit/shared/ui/ThemeProvider'

export type Config = ResolvedRegister['config']

type Props = {
  config: Config
  children: ReactElement
  autoConnect: boolean
}

/**
 * Client wrapper for Cypress component testing.
 *
 * Provides the necessary providers (Wagmi, Query, Theme, Router) for testing components
 * that depend on web3 functionality, UI theming, and routing.
 *
 * Similar to apps/main/src/app/ClientWrapper.tsx but optimized for the testing environment.
 */
export function ClientWrapper({ config, children, autoConnect }: Props) {
  // Create a minimal router for testing environment
  const router = createRouter({
    routeTree: createRootRoute({
      component: () => children,
    }),
    history: createMemoryHistory({
      initialEntries: ['/'],
    }),
  })

  return (
    <>
      <ThemeProvider theme="light">
        <WagmiProvider config={config} reconnectOnMount={autoConnect}>
          <QueryProvider persister={persister} queryClient={queryClient}>
            <RouterProvider router={router} />
          </QueryProvider>
        </WagmiProvider>
      </ThemeProvider>
    </>
  )
}
