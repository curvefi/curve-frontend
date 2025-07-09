import { ChainId } from '@/lend/types/lend.types'
import { requireLib } from '@ui-kit/features/connect-wallet'
import { FieldsOf } from '@ui-kit/lib'
import type { ChainQuery } from '@ui-kit/lib/model/query'
import { queryFactory } from '@ui-kit/lib/model/query'
import { llamaApiValidationSuite } from '@ui-kit/lib/model/query/chain-validation'

type MarketQuery = ChainQuery<ChainId> & { marketId: string }
type MarketParams = FieldsOf<MarketQuery>

const _fetchOnChainMarketRate = async ({ marketId }: MarketQuery) => ({
  rates: await requireLib('llamaApi').getLendMarket(marketId).stats.rates(false, false),
})

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
  validationSuite: llamaApiValidationSuite,
})
