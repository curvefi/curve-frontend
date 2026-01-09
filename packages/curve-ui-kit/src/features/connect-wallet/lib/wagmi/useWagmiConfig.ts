import { useMemo } from 'react'
import type { Chain } from 'viem'
import { generatePrivateKey } from 'viem/accounts'
import { createConfig, type Config } from 'wagmi'
import { mapRecord, recordValues } from '@curvefi/prices-api/objects.util'
import type { NetworkMapping } from '@ui/utils'
import { Chain as ChainEnum, isCypress, noCypressTestConnector } from '@ui-kit/utils'
import { createChainFromNetwork } from './chains'
import { connectors } from './connectors'
import { defaultGetRpcUrls } from './rpc'
import { createTransportFromNetwork } from './transports'
import { createTestConnector } from './wagmi-test'

export const useWagmiConfig = <T extends NetworkMapping>(networks: T | undefined): Config | undefined =>
  useMemo(() => {
    if (networks == null) return

    const chains = recordValues(networks).map((network) => createChainFromNetwork(network, defaultGetRpcUrls)) as [
      Chain,
      ...Chain[],
    ]

    return createConfig({
      chains,
      transports: mapRecord(networks, (_, network) => createTransportFromNetwork(network, defaultGetRpcUrls)),
      connectors,
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
