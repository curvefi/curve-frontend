import { type ReactNode, useMemo } from 'react'
import { useConnection } from 'wagmi'
import type { IChainId as LlamaChainId, INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import { useCurve } from '@ui-kit/features/connect-wallet'
import type { LlamaMarketType } from '@ui-kit/types/market'
import type { QueryProp } from '@ui-kit/types/util'
import type { LlamaMarketTemplate } from '../../llamalend.types'
import type { LlamaMarket } from '../../queries/market-list/llama-markets'
import { MarketContext } from './MarketContext'
import { createMarketContextValue } from './MarketContextValue'

export const MarketContextProvider = <ChainId extends LlamaChainId>({
  children,
  network,
  marketQuery,
  apiMarket,
  marketType,
}: {
  children: ReactNode
  network: { id: LlamaNetworkId; chainId: ChainId }
  marketQuery: QueryProp<LlamaMarketTemplate>
  apiMarket: QueryProp<LlamaMarket>
  marketType: LlamaMarketType
}) => {
  const { address: userAddress } = useConnection()
  const { llamaApi: api = null } = useCurve()
  return (
    <MarketContext
      value={useMemo(
        () =>
          createMarketContextValue({
            chainId: network.chainId,
            blockchainId: network.id,
            marketQuery,
            apiMarket,
            marketType,
            userAddress,
            api,
          }),
        [api, apiMarket, marketQuery, marketType, network.chainId, network.id, userAddress],
      )}
    >
      {children}
    </MarketContext>
  )
}
