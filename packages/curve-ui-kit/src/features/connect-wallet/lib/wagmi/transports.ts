import lodash from 'lodash'
import type { HttpTransportConfig } from 'viem'
import type { NetworkDef } from '@ui/utils'
import { Duration } from '@ui-kit/themes/design/0_primitives'
import { injected } from '@wagmi/connectors'
import { fallback, http, unstable_connector } from '@wagmi/core'
import { wagmiChainsMap } from './chains'
import { RPC } from './rpc'

const { Size, Time } = Duration.WagmiBatch

export const WAGMI_HTTP_OPTIONS = {
  batch: { batchSize: Size, wait: Time },
  // exclude write methods from fallbacks: even if the RPC fails, it might have processed the transaction
  methods: { exclude: ['eth_sendTransaction', 'eth_sendRawTransaction'] },
} satisfies HttpTransportConfig

/**
 * Gets a list of unique RPC URLs for a given chain in priority order:
 * 1. Hardcoded RPC URLs from RPC configuration
 * 2. Network-specific RPC URL from the provided configuration
 * 3. Default Wagmi chain RPC URLs as fallbacks
 *
 * @param chainId - The chain ID to get RPC URLs for
 * @param networkRpcUrl - The primary RPC URL from the network configuration
 * @returns Array of unique RPC URLs in priority order
 */
export const defaultGetRpcUrls = <ChainId extends number>(chainId: ChainId, networkRpcUrl: string) =>
  lodash.uniq([...(RPC[chainId] ?? []), networkRpcUrl, ...(wagmiChainsMap[chainId]?.rpcUrls.default.http ?? [])])

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
 *    - Gives browsers a time window for the opportunity to batch multiple calls
 *
 * Note: WalletConnect ignores this transport configuration and uses chain.rpcUrls.default.http
 * in order, but having multiple transports helps with injected wallet resilience.
 *
 * @param network - Network definition containing chain ID and RPC configuration
 * @param getRpcUrls - Function to resolve primary and fallback RPC URLs
 * @returns Configured fallback transport for the specified network
 */
export const createTransportFromNetwork = (network: NetworkDef, getRpcUrls: typeof defaultGetRpcUrls) =>
  fallback([
    unstable_connector(injected),
    ...getRpcUrls(network.chainId, network.rpcUrl).map((url) => http(url, WAGMI_HTTP_OPTIONS)),
  ])
