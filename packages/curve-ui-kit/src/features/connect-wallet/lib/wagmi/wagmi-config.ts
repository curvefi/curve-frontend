import uniq from 'lodash/uniq'
import memoize from 'memoizee'
import type { Chain } from 'viem'
import { defineChain } from 'viem/utils'
import type { BaseConfig } from '@ui/utils'
import { wagmiChains } from '@ui-kit/features/connect-wallet/lib/wagmi/chains'
import { injected } from '@wagmi/connectors'
import { createConfig, fallback, http, type Transport, unstable_connector } from '@wagmi/core'
import { connectors } from './connectors'

declare module 'wagmi' {
  /** Enable Wagmi to infer types in places that wouldn't normally have access to type info via React Context alone. */
  interface Register {
    config: ReturnType<typeof createWagmiConfig>
  }
}

const DECIMALS: Record<number, number> = {
  2390: 8, // TAC
}

/**
 * Creates a Wagmi configuration based on the provided network configurations.
 * We use memoize here because useMemo may be called multiple times, breaking the wagmi auto-reconnect.
 * @param networks - A record mapping chain IDs to their respective network configurations.
 * @return A Wagmi configuration object that includes chains, connectors, and transports.
 */
export const createWagmiConfig = memoize(
  <ChainId extends number, NetworkConfig extends BaseConfig>(networks: Record<ChainId, NetworkConfig>) => {
    const chains = Object.fromEntries(wagmiChains.map((chain) => [chain.id, chain]))
    const networkEntries = Object.entries(networks).map(([id, config]) => [+id, config]) as [ChainId, NetworkConfig][]
    return createConfig({
      chains: networkEntries.map(([id, config]): Chain => {
        // use the backend data to configure new chains, but use wagmi contract addresses and useful properties/RPCs
        const wagmiChain = chains[id] as Chain | undefined
        return defineChain({
          id,
          testnet: config.isTestnet,
          nativeCurrency: { name: config.symbol, symbol: config.symbol, decimals: DECIMALS[id] ?? 18 },
          ...wagmiChain,
          name: config.name,
          rpcUrls: {
            default: { http: uniq([config.rpcUrl, ...(wagmiChain?.rpcUrls.default.http ?? [])]) },
          },
          ...(config.explorerUrl && {
            blockExplorers: {
              default: { name: new URL(config.explorerUrl).host, url: config.explorerUrl },
            },
          }),
        })
      }) as [Chain, ...Chain[]],
      connectors: Object.values(connectors),
      transports: Object.fromEntries(
        networkEntries.map(([id]) => [
          id,
          /**
           * Transport configuration for Wagmi:
           * 1. unstable_connector(injected) - Uses the user's injected wallet for transactions
           *
           *    According to Wagmi docs, it is highly recommended to use unstable_connector
           *    inside a fallback transport because connector requests may fail due to:
           *    - Chain ID mismatches
           *    - Limited RPC method support
           *    - Rate-limiting of wallet provider
           *
           * 2. http transport - Used as fallback when connector transport fails
           *    - Configured with batch size of 3 to comply with DRPC free tier limits
           *    - Prevents error code 29 from exceeding batch limits
           *
           * Note: WalletConnect ignores this http endpoint and uses chain.rpcUrls.default.http[0]
           * regardless of the configuration here.
           */
          fallback([unstable_connector(injected), http(undefined, { batch: { batchSize: 3 } })]),
        ]),
      ) as Record<ChainId, Transport>,
      /**
       * Disabled to prevent auto-reconnect on disconnecting an injected wallet.
       * Solves the same issue as discussed on https://github.com/wevm/wagmi/discussions/3537.
       * We don't use wallet specific injected connectors anyway and prefer to use the single global one.
       */
      multiInjectedProviderDiscovery: false,
    })
  },
  {
    max: 1, // only memoize the last call
  },
)

export type WagmiChainId = ReturnType<typeof createWagmiConfig>['chains'][number]['id']
