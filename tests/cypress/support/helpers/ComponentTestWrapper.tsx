import { type ReactElement, useMemo } from 'react'
import { type ResolvedRegister, WagmiProvider } from 'wagmi'
import { prefetchMarkets } from '@/lend/entities/chain/chain-query'
import { NetworkConfig } from '@/loan/types/loan.types'
import { createTestWagmiConfigFromVNet } from '@cy/support/helpers/tenderly'
import Box from '@mui/material/Box'
import { createMemoryHistory, createRootRoute, createRouter, RouterProvider } from '@tanstack/react-router'
import { ConnectionProvider, type LlamaApi, requireLib, WalletToast } from '@ui-kit/features/connect-wallet'
import { persister, queryClient, QueryProvider } from '@ui-kit/lib/api'
import { ThemeProvider } from '@ui-kit/shared/ui/ThemeProvider'
import { WithWrapper } from '@ui-kit/shared/ui/WithWrapper'

export type Config = ResolvedRegister['config']

type Props = {
  config?: Config
  children: ReactElement
  autoConnect?: boolean
}

/**
 * Client wrapper for Cypress component testing.
 *
 * Provides the necessary providers (Wagmi, Query, Theme, Router) for testing components
 * that depend on web3 functionality, UI theming, and routing.
 *
 * Similar to apps/main/src/app/ClientWrapper.tsx but optimized for the testing environment.
 */
export function ComponentTestWrapper({ config, children, autoConnect }: Props) {
  // Create a minimal router for testing environment
  const router = createRouter({
    routeTree: createRootRoute({ component: () => children }),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })

  return (
    <ThemeProvider theme="light">
      <WithWrapper Wrapper={WagmiProvider} shouldWrap={config} config={config!} reconnectOnMount={autoConnect}>
        <QueryProvider persister={persister} queryClient={queryClient}>
          <RouterProvider router={router} />
          <WalletToast />
        </QueryProvider>
      </WithWrapper>
    </ThemeProvider>
  )
}

export const LlamalendComponentWrapper = ({
  network,
  wagmi,
  children,
  onHydrated,
}: {
  network: NetworkConfig
  wagmi: Parameters<typeof createTestWagmiConfigFromVNet>[0]
  children: ReactElement
  onHydrated?: (lib: LlamaApi) => Promise<void>
}) => (
  <ComponentTestWrapper config={createTestWagmiConfigFromVNet(wagmi)} autoConnect>
    <ConnectionProvider
      app="llamalend"
      network={network}
      onChainUnavailable={console.error}
      hydrate={useMemo(
        () => ({
          llamalend: async () => {
            await prefetchMarkets({})
            await onHydrated?.(requireLib('llamaApi'))
          },
        }),
        [onHydrated],
      )}
    >
      <Box sx={{ maxWidth: 500 }}>{children}</Box>
    </ConnectionProvider>
  </ComponentTestWrapper>
)
