import { requireLib } from '@ui-kit/features/connect-wallet'
import { queryFactory } from '@ui-kit/lib/model/query'
import { marketIdValidationSuite } from '@ui-kit/lib/model/query/market-id-validation'
import type { MarketQuery, MarketParams } from '@ui-kit/lib/model/query/root-keys'
import { rootKeys } from '@ui-kit/lib/model/query/root-keys'

/**
 * The purpose of this query is to allow fetching market max leverage on chain
 * in order to display the most current data when a wallet is connected.
 * */
const _getMintMarketMaxLeverage = async ({ marketId }: MarketQuery): Promise<number> => {
  const api = requireLib('llamaApi')
  const market = api.getMintMarket(marketId)
  const hasMaxLeverage = market.leverageV2.hasLeverage()

  if (hasMaxLeverage) {
    const v2MaxLeverage = await market.leverageV2.maxLeverage(market?.minBands)
    return +v2MaxLeverage
  }

  const v1MaxLeverage = await market.leverage.maxLeverage(market?.minBands)
  return +v1MaxLeverage
}

export const { useQuery: useMintMarketMaxLeverage } = queryFactory({
  queryKey: (params: MarketParams) => [...rootKeys.market(params), 'mintMarketMaxLeverage', 'v1'] as const,
  queryFn: _getMintMarketMaxLeverage,
  validationSuite: marketIdValidationSuite,
})
