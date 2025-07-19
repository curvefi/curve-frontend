import { ChainId } from '@/lend/types/lend.types'
import { requireLib } from '@ui-kit/features/connect-wallet'
import { FieldsOf } from '@ui-kit/lib'
import type { ChainQuery } from '@ui-kit/lib/model/query'
import { queryFactory } from '@ui-kit/lib/model/query'
import { llamaApiValidationSuite } from '@ui-kit/lib/model/query/curve-api-validation'

type MarketQuery = ChainQuery<ChainId> & { marketId: string }
type MarketParams = FieldsOf<MarketQuery>

const _fetchMarketPricePerShare = async ({ marketId }: MarketQuery) => {
  const api = requireLib('llamaApi')
  const market = api.getLendMarket(marketId)
  return await market.vault.previewRedeem(1)
}

/**
 * Fetches the price per share of a market on chain
 */
export const { useQuery: useMarketPricePerShare, invalidate: invalidateMarketPricePerShare } = queryFactory({
  queryKey: (params: MarketParams) =>
    ['marketPricePerShare', { chainId: params.chainId }, { marketId: params.marketId }] as const,
  queryFn: _fetchMarketPricePerShare,
  refetchInterval: '1m',
  validationSuite: llamaApiValidationSuite,
})
