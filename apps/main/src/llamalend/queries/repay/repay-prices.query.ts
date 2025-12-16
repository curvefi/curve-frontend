import { getLlamaMarket } from '@/llamalend/llama.utils'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import type { Decimal } from '@ui-kit/utils'
import { type RepayFromCollateralParams, type RepayFromCollateralQuery } from '../validation/manage-loan.types'
import { repayFromCollateralValidationSuite } from '../validation/manage-loan.validation'

export const { useQuery: useRepayPrices } = queryFactory({
  queryKey: ({
    chainId,
    marketId,
    stateCollateral = '0',
    userCollateral = '0',
    userBorrowed = '0',
    userAddress,
  }: RepayFromCollateralParams) =>
    [
      ...rootKeys.userMarket({ chainId, marketId, userAddress }),
      'repayPrices',
      { stateCollateral },
      { userCollateral },
      { userBorrowed },
    ] as const,
  queryFn: async ({ marketId, stateCollateral, userCollateral, userBorrowed }: RepayFromCollateralQuery) => {
    const market = getLlamaMarket(marketId)
    return (
      market instanceof LendMarketTemplate
        ? await market.leverage.repayPrices(stateCollateral, userCollateral, userBorrowed)
        : market.leverageV2.hasLeverage()
          ? await market.leverageV2.repayPrices(stateCollateral, userCollateral, userBorrowed)
          : await market.deleverage.repayPrices(userCollateral)
    ) as Decimal[]
  },
  validationSuite: repayFromCollateralValidationSuite,
})
