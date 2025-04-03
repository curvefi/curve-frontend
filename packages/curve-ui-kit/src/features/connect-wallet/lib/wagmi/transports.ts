import type { FallbackTransport } from 'viem'
import { injected } from '@wagmi/connectors'
import { fallback, http, type Transport, unstable_connector } from '@wagmi/core'
import { chains, type WagmiChainId } from './chains'

export const transports = Object.fromEntries(
  chains.map((chain) => [chain.id, fallback([unstable_connector(injected), http()])]),
) as Record<WagmiChainId, FallbackTransport<Transport[]>>
