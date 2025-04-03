import { createConfig } from '@wagmi/core'
import { chains } from './chains'
import { connectors } from './connectors'
import { transports } from './transports'

declare module 'wagmi' {
  /** Enable Wagmi to infer types in places that wouldn't normally have access to type info via React Context alone. */
  interface Register {
    config: typeof config
  }
}

export const config = createConfig({
  chains,
  connectors: Object.values(connectors),
  transports,
})
