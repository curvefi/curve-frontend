import { useMemo } from 'react'
import type { Chain } from 'viem'
import { generatePrivateKey } from 'viem/accounts'
import { CYPRESS_CONNECTOR_CHAIN, IS_CYPRESS, NO_CYPRESS_TEST_CONNECTOR } from '@evm-ui/utils/env'
import { assert, fromEntries } from '@primitives/objects.utils'
import { createChain } from './chains'
import { createTransport, defaultGetRpcUrls } from './transports'
import { createWagmiConfig } from './wagmi-config'
import { createTestConnector } from './wagmi-test'

export const useWagmiConfig = (chainIds: number[] | undefined) =>
  useMemo(() => {
    if (chainIds == null) return

    const chains = chainIds.map(chainId => createChain(chainId, defaultGetRpcUrls)) as [Chain, ...Chain[]]

    return createWagmiConfig({
      chains,
      transports: fromEntries(chainIds.map(chainId => [chainId, createTransport(chainId, defaultGetRpcUrls)] as const)),
      ...(IS_CYPRESS &&
        !NO_CYPRESS_TEST_CONNECTOR && {
          connectors: [
            createTestConnector({
              privateKey: generatePrivateKey(),
              chain: assert(
                chains.find(chain => chain.id === CYPRESS_CONNECTOR_CHAIN),
                `Chain ${CYPRESS_CONNECTOR_CHAIN} not found in networks ${chains.map(chain => chain.id).join(', ')}`,
              ),
            }),
          ],
        }),
    })
  }, [chainIds])
