import { type ReactNode, useMemo } from 'react'
import { useConnection } from 'wagmi'
import type { IChainId as LlamaChainId, INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import { useCurve } from '@evm-ui/features/connect-wallet'
import { useReleaseChannel } from '@evm-ui/hooks/useLocalStorage'
import type { MarketType } from '@evm-ui/types/market'
import { q, type QueryProp } from '@ui/features/queries/util'
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
  const [releaseChannel] = useReleaseChannel()
  const { data: market, isLoading: isMarketLoading, error: marketError } = marketQuery
  const { data: apiMarketData, isLoading: isApiMarketLoading, error: apiMarketError } = apiMarket
  return (
    <MarketContext
      value={useMemo(
        () =>
          createMarketContextValue({
            chainId: network.chainId,
            blockchainId: network.id,
            marketQuery: q({
              data: market,
              isLoading: isMarketLoading || (!market && !marketError && !!userAddress),
              error: marketError,
            }),
            apiMarket: q({
              data: apiMarketData,
              isLoading: isApiMarketLoading || (!apiMarketData && !apiMarketError && !userAddress),
              error: apiMarketError,
            }),
            marketType,
            userAddress,
            api,
            releaseChannel,
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
          releaseChannel,
          userAddress,
        ],
      )}
    >
      {children}
    </MarketContext>
  )
}
