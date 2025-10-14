import { useMemo } from 'react'
import type { Chain } from 'viem'
import { mapRecord, recordValues } from '@curvefi/prices-api/objects.util'
import type { NetworkMapping } from '@ui/utils'
import { createChainFromNetwork } from './chains'
import { defaultGetRpcUrls } from './rpc'
import { createTransportFromNetwork } from './transports'
import { createWagmiConfig } from './wagmi-config'

export const useWagmiConfig = <T extends NetworkMapping>(networks: T | undefined) =>
  useMemo(
    () =>
      networks &&
      createWagmiConfig({
        chains: recordValues(networks).map((network) => createChainFromNetwork(network, defaultGetRpcUrls)) as [
          Chain,
          ...Chain[],
        ],
        transports: mapRecord(networks, (_, network) => createTransportFromNetwork(network, defaultGetRpcUrls)),
      }),
    [networks],
  )
