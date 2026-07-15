import { type ReactNode, useMemo } from 'react'
import { useConnection } from 'wagmi'
import type { IChainId as LlamaChainId, INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import { useCurve } from '@ui-kit/features/connect-wallet'
import type { MarketType } from '@ui-kit/types/market'
import { q, type QueryProp } from '@ui-kit/types/util'
import type { MarketTemplate } from '../../llamalend.types'
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
  marketQuery: QueryProp<MarketTemplate>
  apiMarket: QueryProp<LlamaMarket>
  marketType: MarketType
}) => {
  const { address: userAddress } = useConnection()
  const { llamaApi: api = null } = useCurve()
  const { data: market, isLoading: isMarketLoading, error: marketError } = marketQuery
  const { data: apiMarketData, isLoading: isApiMarketLoading, error: apiMarketError } = apiMarket
  return (
    <MarketContext
      value={useMemo(
        () =>
          createMarketContextValue({
            chainId: network.chainId,
            blockchainId: network.id,
            marketQuery: q({ data: market, isLoading: isMarketLoading, error: marketError }),
            apiMarket: q({ data: apiMarketData, isLoading: isApiMarketLoading, error: apiMarketError }),
            marketType,
            userAddress,
            api,
          }),
        [
          api,
          apiMarketData,
          apiMarketError,
          isApiMarketLoading,
          isMarketLoading,
          market,
          marketError,
          marketType,
          network.chainId,
          network.id,
          userAddress,
        ],
      )}
    >
      {children}
    </MarketContext>
  )
}
