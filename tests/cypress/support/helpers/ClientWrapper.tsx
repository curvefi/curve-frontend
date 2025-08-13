import React, { type ReactNode } from 'react'
import { WagmiProvider, type ResolvedRegister } from 'wagmi'
import GlobalStyle from '@/globalStyle'
import { persister, queryClient, QueryProvider } from '@ui-kit/lib/api'
import { ThemeProvider } from '@ui-kit/shared/ui/ThemeProvider'

export type Config = ResolvedRegister['config']

type Props = {
  config: Config
  children: ReactNode
  autoConnect: boolean
}

/**
 * Client wrapper for Cypress component testing.
 *
 * Provides the necessary providers (Wagmi, Query, Theme) for testing Vue components
 * that depend on web3 functionality and UI theming.
 *
 * Similar to apps/main/src/app/ClientWrapper.tsx but optimized for the testing environment.
 */
export function ClientWrapper({ config, children, autoConnect }: Props) {
  return (
    <>
      <GlobalStyle />
      <ThemeProvider theme="light">
        <WagmiProvider config={config} reconnectOnMount={autoConnect}>
          <QueryProvider persister={persister} queryClient={queryClient}>
            {children}
          </QueryProvider>
        </WagmiProvider>
      </ThemeProvider>
    </>
  )
}
