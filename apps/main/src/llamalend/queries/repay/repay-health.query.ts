import { getLlamaMarket } from '@/llamalend/llama.utils'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import type { Decimal } from '@ui-kit/utils'
import {
  type RepayFromCollateralHealthQuery,
  type RepayFromCollateralHealthParams,
} from '../validation/manage-loan.types'
import { repayFromCollateralIsFullValidationSuite } from '../validation/manage-loan.validation'

export const { useQuery: useRepayHealth } = queryFactory({
  queryKey: ({
    chainId,
    marketId,
    stateCollateral = '0',
    userCollateral = '0',
    userBorrowed = '0',
    userAddress,
    isFull,
  }: RepayFromCollateralHealthParams) =>
    [
      ...rootKeys.userMarket({ chainId, marketId, userAddress }),
      'repayHealth',
      { stateCollateral },
      { userCollateral },
      { userBorrowed },
      { isFull },
    ] as const,
  queryFn: async ({
    marketId,
    stateCollateral,
    userCollateral,
    userBorrowed,
    isFull,
  }: RepayFromCollateralHealthQuery) => {
    const market = getLlamaMarket(marketId)
    return (
      market instanceof LendMarketTemplate
        ? await market.leverage.repayHealth(stateCollateral, userCollateral, userBorrowed, isFull)
        : market.leverageV2.hasLeverage()
          ? await market.leverageV2.repayHealth(stateCollateral, userCollateral, userBorrowed, isFull)
          : await market.deleverage.repayHealth(userCollateral, isFull)
    ) as Decimal
  },
  validationSuite: repayFromCollateralIsFullValidationSuite,
})
