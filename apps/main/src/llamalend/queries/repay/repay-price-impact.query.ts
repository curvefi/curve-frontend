import { getLlamaMarket } from '@/llamalend/llama.utils'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { type RepayFromCollateralParams, type RepayFromCollateralQuery } from '../validation/manage-loan.types'
import { repayFromCollateralValidationSuite } from '../validation/manage-loan.validation'

type RepayPriceImpactResult = number

export const { useQuery: useRepayPriceImpact } = queryFactory({
  queryKey: ({
    chainId,
    marketId,
    stateCollateral = '0',
    userCollateral = '0',
    userAddress,
  }: RepayFromCollateralParams) =>
    [
      ...rootKeys.userMarket({ chainId, marketId, userAddress }),
      'repayPriceImpact',
      { stateCollateral },
      { userCollateral },
    ] as const,
  queryFn: async ({
    marketId,
    stateCollateral,
    userCollateral,
  }: RepayFromCollateralQuery): Promise<RepayPriceImpactResult> => {
    const market = getLlamaMarket(marketId)
    return market instanceof LendMarketTemplate
      ? +(await market.leverage.repayPriceImpact(stateCollateral, userCollateral))
      : market.leverageV2.hasLeverage()
        ? +(await market.leverageV2.repayPriceImpact(stateCollateral, userCollateral))
        : +(await market.deleverage.priceImpact(userCollateral))
  },
  staleTime: '1m',
  validationSuite: repayFromCollateralValidationSuite,
})
