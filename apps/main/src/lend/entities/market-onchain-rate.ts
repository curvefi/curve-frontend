import { lendingJsValidationSuite } from '@/lend/entities/validation/lending-js-validation'
import { ChainId } from '@/lend/types/lend.types'
import { FieldsOf } from '@ui-kit/lib'
import type { ChainQuery } from '@ui-kit/lib/model/query'
import { queryFactory } from '@ui-kit/lib/model/query'
import { useApiStore } from '@ui-kit/shared/useApiStore'

type MarketQuery = ChainQuery<ChainId> & { marketId: string }
type MarketParams = FieldsOf<MarketQuery>

const _fetchOnChainMarketRate = async ({ marketId }: MarketQuery) => {
  const { llamalend } = useApiStore.getState()
  const market = llamalend!.getLendMarket(marketId)
  return await market.stats.rates(false, false)
}

/**
 * The purpose of this query is to allow fetching market parameters on chain
 * in order to display the most current data when a wallet is connected.
 * The api data can have a few minutes delay.
 * */
export const { useQuery: useMarketOnChainRates, invalidate: invalidateMarketOnChainRates } = queryFactory({
  queryKey: (params: MarketParams) =>
    ['marketOnchainData', { chainId: params.chainId }, { marketId: params.marketId }] as const,
  queryFn: _fetchOnChainMarketRate,
  refetchInterval: '1m',
  validationSuite: lendingJsValidationSuite,
})
