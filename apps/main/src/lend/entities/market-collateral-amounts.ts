import { USE_API } from '@/lend/shared/config'
import { ChainId } from '@/lend/types/lend.types'
import { requireLib } from '@ui-kit/features/connect-wallet'
import { FieldsOf } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model/query'
import type { ChainQuery } from '@ui-kit/lib/model/query'
import { llamaApiValidationSuite } from '@ui-kit/lib/model/query/curve-api-validation'

type MarketQuery = ChainQuery<ChainId> & { marketId: string }
type MarketParams = FieldsOf<MarketQuery>

type MarketCollateralAmounts = {
  collateralAmount: number
  borrowedAmount: number
}

/**
 * The purpose of this query is to allow fetching market collateral amounts on chain
 * in order to display the most current data when a wallet is connected.
 * */
const _getMarketCollateralAmounts = async ({ marketId }: MarketQuery): Promise<MarketCollateralAmounts> => {
  const api = requireLib('llamaApi')
  const market = api.getLendMarket(marketId)
  const ammBalance = await market.stats.ammBalances(false, USE_API)
  return {
    collateralAmount: +ammBalance.collateral,
    borrowedAmount: +ammBalance.borrowed,
  }
}

export const { useQuery: useMarketCollateralAmounts } = queryFactory({
  queryKey: (params: MarketParams) =>
    ['marketCollateralAmounts', { chainId: params.chainId }, { marketId: params.marketId }] as const,
  queryFn: _getMarketCollateralAmounts,
  refetchInterval: '1m',
  validationSuite: llamaApiValidationSuite,
})
