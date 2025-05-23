import { injected } from '@wagmi/connectors'
import { createConfig, type Transport, unstable_connector, fallback, http } from '@wagmi/core'
import { chains, type WagmiChainId } from './chains'
import { connectors } from './connectors'

declare module 'wagmi' {
  /** Enable Wagmi to infer types in places that wouldn't normally have access to type info via React Context alone. */
  interface Register {
    config: typeof config
  }
}

const transports = Object.fromEntries(
  chains.map((chain) => [
    chain.id,
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
) as Record<WagmiChainId, Transport>

export const config = createConfig({
  chains,
  connectors: Object.values(connectors),
  transports,
  /**
   * Disabled to prevent auto-reconnect on disconnecting an injected wallet.
   * Solves the same issue as discussed on https://github.com/wevm/wagmi/discussions/3537.
   * We don't use wallet specific injected connectors anyway and prefer to use the single global one.
   */
  multiInjectedProviderDiscovery: false,
})
