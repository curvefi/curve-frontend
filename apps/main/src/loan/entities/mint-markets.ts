import { useMemo } from 'react'
import { ChainId } from '@/loan/types/loan.types'
import { requireLib } from '@ui-kit/features/connect-wallet'
import { ChainParams, ChainQuery, queryFactory } from '@ui-kit/lib/model/query'
import { llamaApiValidationSuite } from '@ui-kit/lib/model/query/curve-api-validation'

export const { useQuery: useMintMarkets, fetchQuery: fetchMintMarkets } = queryFactory({
  queryKey: ({ chainId }: ChainParams) => ['chain', { chainId }, 'mint-markets'] as const,
  queryFn: async ({}: ChainQuery<ChainId>) => {
    const api = requireLib('llamaApi')
    return api.mintMarkets.getMarketList().map((name) => api.getMintMarket(name))
  },
  staleTime: '5m',
  refetchInterval: '1m',
  validationSuite: llamaApiValidationSuite,
})

/**
 * Hook to get a specific mint market by its id or controller address.
 * @param chainId The chain for which to get the mint market of.
 * @param marketId Mint market id or controller address
 * @returns The market instance, if found.
 */
export const useMintMarket = ({ chainId, marketId }: { chainId: ChainId; marketId: string }) => {
  const { data: markets, isSuccess, error } = useMintMarkets({ chainId })

  /** Create mappings from market name or controller id to market instance. */
  const mapping = useMemo(
    () =>
      markets &&
      Object.fromEntries(
        markets.flatMap((market) => [
          [market.id, market],
          [market.controller, market],
        ]),
      ),
    [markets],
  )

  const market = mapping?.[marketId]
  return { data: market, isSuccess, error }
}
