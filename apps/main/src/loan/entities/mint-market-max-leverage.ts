import { ChainId } from '@/loan/types/loan.types'
import { requireLib } from '@ui-kit/features/connect-wallet'
import { FieldsOf } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model/query'
import type { ChainQuery } from '@ui-kit/lib/model/query'
import { llamaApiValidationSuite } from '@ui-kit/lib/model/query/curve-api-validation'

type MarketQuery = ChainQuery<ChainId> & { marketId: string }
type MarketParams = FieldsOf<MarketQuery>

/**
 * The purpose of this query is to allow fetching market max leverage on chain
 * in order to display the most current data when a wallet is connected.
 * */
const _getMintMarketMaxLeverage = async ({ marketId }: MarketQuery): Promise<{ value: string }> => {
  const api = requireLib('llamaApi')
  const market = api.getMintMarket(marketId)
  const hasMaxLeverage = market.leverageV2.hasLeverage()

  if (hasMaxLeverage) {
    const v2MaxLeverage = await market.leverageV2.maxLeverage(market?.minBands)
    return { value: v2MaxLeverage }
  }

  const v1MaxLeverage = await market.leverage.maxLeverage(market?.minBands)
  return { value: v1MaxLeverage }
}

export const { useQuery: useMintMarketMaxLeverage } = queryFactory({
  queryKey: (params: MarketParams) =>
    ['mintMarketMaxLeverage', { chainId: params.chainId }, { marketId: params.marketId }, 'v1'] as const,
  queryFn: _getMintMarketMaxLeverage,
  validationSuite: llamaApiValidationSuite,
})
