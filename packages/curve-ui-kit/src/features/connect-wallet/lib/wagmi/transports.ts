import { http, type Transport } from '@wagmi/core'
import { chains, type WagmiChainId } from './chains'

export const transports = Object.fromEntries(chains.map((chain) => [chain.id, http()])) as Record<
  WagmiChainId,
  Transport
>
