import { useMemo } from 'react'
import type { Chain } from 'viem'
import { generatePrivateKey } from 'viem/accounts'
import { mapRecord, recordValues } from '@curvefi/primitives/objects.utils'
import type { NetworkMapping } from '@ui/utils'
import { Chain as ChainEnum, isCypress, noCypressTestConnector } from '@ui-kit/utils'
import { createChainFromNetwork } from './chains'
import { defaultGetRpcUrls } from './rpc'
import { createTransportFromNetwork } from './transports'
import { createWagmiConfig } from './wagmi-config'
import { createTestConnector } from './wagmi-test'

export const useWagmiConfig = <T extends NetworkMapping>(networks: T | undefined) =>
  useMemo(() => {
    if (networks == null) return

    const chains = recordValues(networks).map((network) => createChainFromNetwork(network, defaultGetRpcUrls)) as [
      Chain,
      ...Chain[],
    ]

    return createWagmiConfig({
      chains,
      transports: mapRecord(networks, (_, network) => createTransportFromNetwork(network, defaultGetRpcUrls)),
      ...(isCypress &&
        !noCypressTestConnector && {
          connectors: [
            createTestConnector({
              privateKey: generatePrivateKey(),
              chain: chains.find((chain) => chain.id === ChainEnum.Ethereum)!,
            })!,
          ],
        }),
    })
  }, [networks])
