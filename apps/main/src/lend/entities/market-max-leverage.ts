import { ChainId } from '@/lend/types/lend.types'
import { requireLib } from '@ui-kit/features/connect-wallet'
import { FieldsOf } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model/query'
import type { ChainQuery } from '@ui-kit/lib/model/query'
import { llamaApiValidationSuite } from '@ui-kit/lib/model/query/curve-api-validation'

type MarketQuery = ChainQuery<ChainId> & { marketId: string }
type MarketParams = FieldsOf<MarketQuery>

type MarketMaxLeverage = {
  value: string
}

/**
 * The purpose of this query is to allow fetching market max leverage on chain
 * in order to display the most current data when a wallet is connected.
 * */
const _getMarketMaxLeverage = async ({ marketId }: MarketQuery): Promise<MarketMaxLeverage> => {
  const api = requireLib('llamaApi')
  const market = api.getLendMarket(marketId)
  const maxLeverage = market.leverage.hasLeverage() ? await market.leverage.maxLeverage(market?.minBands) : ''
  return { value: maxLeverage }
}

export const { useQuery: useMarketMaxLeverage } = queryFactory({
  queryKey: (params: MarketParams) =>
    ['marketMaxLeverage', { chainId: params.chainId }, { marketId: params.marketId }] as const,
  queryFn: _getMarketMaxLeverage,
  refetchInterval: '1m',
  validationSuite: llamaApiValidationSuite,
})
