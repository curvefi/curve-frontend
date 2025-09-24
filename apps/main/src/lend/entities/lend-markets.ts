import { useMemo } from 'react'
import networks from '@/lend/networks'
import { ChainId } from '@/lend/types/lend.types'
import { requireLib } from '@ui-kit/features/connect-wallet'
import { ChainParams, ChainQuery, queryFactory } from '@ui-kit/lib/model/query'
import { llamaApiValidationSuite } from '@ui-kit/lib/model/query/curve-api-validation'

export const { useQuery: useLendMarkets, prefetchQuery: prefetchLendMarkets } = queryFactory({
  queryKey: ({ chainId }: ChainParams) => ['chain', { chainId }, 'lend-markets'] as const,
  queryFn: async ({ chainId }: ChainQuery<ChainId>) => {
    const useAPI = chainId !== 146 // disable API for sonic
    const api = requireLib('llamaApi')
    await api.lendMarkets.fetchMarkets(useAPI)
    return api.lendMarkets
      .getMarketList()
      .filter((marketName) => !networks[chainId].hideMarketsInUI[marketName])
      .map((name) => api.getLendMarket(name))
  },
  staleTime: '5m',
  refetchInterval: '1m',
  validationSuite: llamaApiValidationSuite,
})

/**
 * Hook to get a specific lending market by its id or controller address.
 * @param chainId The chain for which to get the lending market of.
 * @param marketId Lend market id or controller address
 * @returns The market instance, if found.
 */
export const useLendMarket = ({ chainId, marketId }: { chainId: ChainId; marketId: string }) => {
  const { data: markets, isSuccess, error } = useLendMarkets({ chainId })

  /** Create mappings from market name or controller id to market instance. */
  const mapping = useMemo(
    () =>
      markets &&
      Object.fromEntries(
        markets.flatMap((market) => [
          [market.name, market],
          [market.addresses.controller, market],
        ]),
      ),
    [markets],
  )

  const market = mapping?.[marketId]
  return { data: market, isSuccess, error }
}
