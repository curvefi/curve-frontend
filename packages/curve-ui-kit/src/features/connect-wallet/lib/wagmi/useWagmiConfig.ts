import { useMemo } from 'react'
import type { Chain } from 'viem'
import { generatePrivateKey } from 'viem/accounts'
import { assert, mapRecord, recordValues } from '@primitives/objects.utils'
import type { NetworkMapping } from '@ui/utils'
import { CypressConnectorChain, isCypress, noCypressTestConnector } from '@ui-kit/utils/env'
import { createChainFromNetwork } from './chains'
import { createTransportFromNetwork, defaultGetRpcUrls } from './transports'
import { createWagmiConfig } from './wagmi-config'
import { createTestConnector } from './wagmi-test'

export const useWagmiConfig = <T extends NetworkMapping>(networks: T | undefined) =>
  useMemo(() => {
    if (networks == null) return

    const chains = recordValues(networks).map(network => createChainFromNetwork(network, defaultGetRpcUrls)) as [
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
              chain: assert(
                chains.find(chain => chain.id === CypressConnectorChain),
                `Chain ${CypressConnectorChain} not found in networks ${chains.map(chain => chain.id).join(', ')}`,
              ),
            }),
          ],
        }),
    })
  }, [networks])
