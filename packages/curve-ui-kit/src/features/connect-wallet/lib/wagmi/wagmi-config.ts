import lodash from 'lodash'
import memoize from 'memoizee'
import type { Chain } from 'viem'
import { defineChain } from 'viem/utils'
import type { NetworkDef } from '@ui/utils'
import { wagmiChains } from '@ui-kit/features/connect-wallet/lib/wagmi/chains'
import { Chain as ChainId } from '@ui-kit/utils/network'
import { injected } from '@wagmi/connectors'
import { createConfig, fallback, http, type Transport, unstable_connector } from '@wagmi/core'
import { connectors } from './connectors'
import { RPC } from './rpc'

declare module 'wagmi' {
  /** Enable Wagmi to infer types in places that wouldn't normally have access to type info via React Context alone. */
  interface Register {
    config: ReturnType<typeof createWagmiConfig>
  }
}

const DECIMALS: Record<number, number> = {
  [ChainId.Tac]: 8, // TAC has 8 decimals instead of 18
}

/**
 * Creates a Wagmi configuration based on the provided network configurations.
 * We use memoize here because useMemo may be called multiple times, breaking the wagmi auto-reconnect.
 * @param networks - A record mapping chain IDs to their respective network configurations.
 * @return A Wagmi configuration object that includes chains, connectors, and transports.
 */
export const createWagmiConfig = memoize(
  <ChainId extends number, NetworkConfig extends NetworkDef>(networks: Record<ChainId, NetworkConfig>) => {
    const wagmi = Object.fromEntries(wagmiChains.map((chain) => [chain.id, chain]))
    const networkEntries = Object.entries(networks).map(([id, config]) => [+id, config]) as [ChainId, NetworkConfig][]

    /**
     * Gets a list of the RPC URLs for a given chain.
     * First the hardcoded RPC URLs, then the CurveJS URL and then all default wagmi URLs
     */
    const getRpcUrls = (id: ChainId) =>
      lodash.uniq([...(RPC[id] ?? []), networks[id].rpcUrl, ...(wagmi[id]?.rpcUrls.default.http ?? [])])

    return createConfig({
      chains: networkEntries.map(
        ([id, config]): Chain =>
          // use the backend data to configure new chains, but use wagmi contract addresses and useful properties/RPCs
          defineChain({
            ...(wagmi[id] ?? {
              nativeCurrency: { name: config.symbol, symbol: config.symbol, decimals: DECIMALS[id] ?? 18 },
            }),
            id,
            testnet: config.isTestnet,
            name: config.name,
            rpcUrls: { default: { http: getRpcUrls(id) } },
            ...(config.explorerUrl && {
              blockExplorers: { default: { name: new URL(config.explorerUrl).host, url: config.explorerUrl } },
            }),
          }),
      ) as [Chain, ...Chain[]],
      connectors: Object.values(connectors),
      transports: Object.fromEntries(
        networkEntries.map(([id, config]) => [
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
           * 2. Multiple http transports - Used as fallback when connector transport fails
           *    - Primary: http transport with default URL (batch size 3 for DRPC compliance)
           *    - Fallbacks: Additional http transports for each fallback RPC URL
           *    - Prevents error code 29 from exceeding batch limits
           *
           * Note: WalletConnect ignores this transport configuration and uses chain.rpcUrls.default.http
           * in order, but having multiple transports helps with injected wallet resilience.
           */
          fallback([
            unstable_connector(injected),
            ...getRpcUrls(id).map((url) => http(url, { batch: { batchSize: 3 } })),
          ]),
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
