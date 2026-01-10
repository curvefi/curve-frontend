import memoize from 'memoizee'
import type { Chain } from 'viem'
import { createConfig, type Transport, type CreateConnectorFn } from '@wagmi/core'
import { connectors as defaultConnectors } from './connectors'

declare module 'wagmi' {
  /** Enable Wagmi to infer types in places that wouldn't normally have access to type info via React Context alone. */
  interface Register {
    config: ReturnType<typeof createWagmiConfig>
  }
}

type CreateWagmiConfigOptions<TChains extends readonly [Chain, ...Chain[]]> = {
  /** An array of Chain objects to configure */
  chains: TChains
  /** A record mapping chain IDs to their respective transport configurations */
  transports: Record<TChains[number]['id'], Transport>
  /** Optional record of connector functions (defaults to defaultConnectors) */
  connectors?: CreateConnectorFn[]
}

/**
 * Creates a Wagmi configuration based on chains, transports and connectors.
 * We use memoize here to ensure only one config instance exists, preventing issues with wagmi auto-reconnect.
 * @return A Wagmi configuration object that includes chains, connectors, and transports.
 */
export const createWagmiConfig = memoize(
  <TChains extends readonly [Chain, ...Chain[]]>({
    chains,
    transports,
    connectors = defaultConnectors,
  }: CreateWagmiConfigOptions<TChains>) =>
    createConfig({
      chains,
      connectors,
      transports,
      /**
       * As much as we'd like to enable EIP-6963, enabling this somehow causes duplicate rehydration issues.
       * We won't be able to turn this on (and remove this memoize and custom isWagmiReconnecting logic)
       * until hydration logic is no longer dependant on many wallet side effects and / or stores.
       */
      multiInjectedProviderDiscovery: false,
    }),
  {
    max: 1, // only memoize the last call
    normalizer: ([{ chains, transports }]) =>
      JSON.stringify({
        chainIds: chains.map((c) => c.id),
        transportIds: Object.keys(transports),
      }),
  },
)

export type WagmiChainId = ReturnType<typeof createWagmiConfig>['chains'][number]['id']
