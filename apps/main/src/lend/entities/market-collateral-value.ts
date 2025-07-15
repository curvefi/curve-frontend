import { USE_API } from '@/lend/shared/config'
import { ChainId } from '@/lend/types/lend.types'
import { requireLib } from '@ui-kit/features/connect-wallet'
import { FieldsOf } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model/query'
import type { ChainQuery } from '@ui-kit/lib/model/query'
import { llamaApiValidationSuite } from '@ui-kit/lib/model/query/curve-api-validation'

type MarketQuery = ChainQuery<ChainId> & { marketId: string }
type MarketParams = FieldsOf<MarketQuery>

type MarketCollateralValue = {
  totalUsdValue: number
  collateral: {
    amount: number
    usdRate: number
    usdValue: number
  }
  borrowed: {
    amount: number
    usdRate: number
    usdValue: number
  }
}

/**
 * The purpose of this query is to allow fetching market collateral values on chain
 * in order to display the most current data when a wallet is connected.
 * */
const _getMarketCollateralValue = async ({ marketId }: MarketQuery): Promise<MarketCollateralValue> => {
  const api = requireLib('llamaApi')
  const market = api.getLendMarket(marketId)
  const { collateral_token, borrowed_token } = market
  const [ammBalance, collateralUsdRate, borrowedUsdRate] = await Promise.all([
    market.stats.ammBalances(false, USE_API),
    api.getUsdRate(collateral_token.address),
    api.getUsdRate(borrowed_token.address),
  ])
  const borrowedUsd = +ammBalance.borrowed * +borrowedUsdRate
  const collateralUsd = +ammBalance.collateral * +collateralUsdRate
  const total = +borrowedUsd + +collateralUsd
  return {
    totalUsdValue: total,
    collateral: {
      amount: +ammBalance.collateral,
      usdRate: collateralUsdRate,
      usdValue: collateralUsd,
    },
    borrowed: {
      amount: +ammBalance.borrowed,
      usdRate: borrowedUsdRate,
      usdValue: borrowedUsd,
    },
  }
}

export const { useQuery: useMarketCollateralValue } = queryFactory({
  queryKey: (params: MarketParams) =>
    ['marketCollateralValue', { chainId: params.chainId }, { marketId: params.marketId }] as const,
  queryFn: _getMarketCollateralValue,
  validationSuite: llamaApiValidationSuite,
})
