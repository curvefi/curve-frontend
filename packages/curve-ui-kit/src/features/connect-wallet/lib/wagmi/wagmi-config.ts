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
 * @return A Wagmi configuration object that includes chains, connectors, and transports.
 */
export const createWagmiConfig = <TChains extends readonly [Chain, ...Chain[]]>({
  chains,
  transports,
  connectors = defaultConnectors,
}: CreateWagmiConfigOptions<TChains>) => createConfig({ chains, connectors, transports })

export type WagmiChainId = ReturnType<typeof createWagmiConfig>['chains'][number]['id']
