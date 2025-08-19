import { useMemo } from 'react'
import type { Chain } from 'viem'
import type { NetworkDef } from '@ui/utils'
import { createChainFromNetwork } from './chains'
import { defaultGetRpcUrls } from './rpc'
import { createTransportFromNetwork } from './transports'
import { createWagmiConfig } from './wagmi-config'

export function useWagmiConfig(networks: NetworkDef[]) {
  const chains = useMemo(
    () => networks.map((network) => createChainFromNetwork(network, defaultGetRpcUrls)) as [Chain, ...Chain[]],
    [networks],
  )
  const transports = useMemo(
    () =>
      Object.fromEntries(
        networks.map((network) => [network.chainId, createTransportFromNetwork(network, defaultGetRpcUrls)]),
      ),
    [networks],
  )
  return useMemo(() => createWagmiConfig({ chains, transports }), [chains, transports])
}
