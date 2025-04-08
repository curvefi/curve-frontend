import { injected } from '@wagmi/connectors'
import { createConfig, type Transport, unstable_connector } from '@wagmi/core'
import { chains, type WagmiChainId } from './chains'
import { connectors } from './connectors'

declare module 'wagmi' {
  /** Enable Wagmi to infer types in places that wouldn't normally have access to type info via React Context alone. */
  interface Register {
    config: typeof config
  }
}

const transports = Object.fromEntries(chains.map((chain) => [chain.id, unstable_connector(injected)])) as Record<
  WagmiChainId,
  Transport
>

export const config = createConfig({
  chains,
  connectors: Object.values(connectors),
  transports,
})
