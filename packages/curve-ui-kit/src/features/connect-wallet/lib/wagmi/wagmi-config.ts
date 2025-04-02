import { createConfig, http } from '@wagmi/core'
import { chains } from './chains'
import { Connectors } from './connectors'

declare module 'wagmi' {
  /** Enable Wagmi to infer types in places that wouldn't normally have access to type info via React Context alone. */
  interface Register {
    config: typeof config
  }
}

export const config = createConfig({
  chains,
  connectors: Object.values(Connectors) as any, // todo: get rid of this any
  transports: Object.fromEntries(chains.map((chain) => [chain.id, http()])) as Record<
    (typeof chains)[number]['id'],
    ReturnType<typeof http>
  >,
})

export type WagmiChainId = (typeof config)['chains'][number]['id']
