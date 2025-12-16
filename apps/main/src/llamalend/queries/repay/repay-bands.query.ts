import { getLlamaMarket, hasLeverage } from '@/llamalend/llama.utils'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { type RepayParams, type RepayQuery } from '../validation/manage-loan.types'
import { repayValidationSuite } from '../validation/manage-loan.validation'

export const { useQuery: useRepayBands } = queryFactory({
  queryKey: ({
    chainId,
    marketId,
    stateCollateral = '0',
    userCollateral = '0',
    userBorrowed = '0',
    userAddress,
  }: RepayParams) =>
    [
      ...rootKeys.userMarket({ chainId, marketId, userAddress }),
      'repayBands',
      { stateCollateral },
      { userCollateral },
      { userBorrowed },
    ] as const,
  queryFn: async ({
    marketId,
    stateCollateral,
    userCollateral,
    userBorrowed,
  }: RepayQuery): Promise<[number, number]> => {
    const market = getLlamaMarket(marketId)
    if (!hasLeverage(market)) {
      console.assert(!+userCollateral, 'userCollateral should be 0 when leverage is disabled')
      console.assert(!+stateCollateral, 'stateCollateral should be 0 when leverage is disabled')
      return market.repayBands(userBorrowed)
    }
    return market instanceof LendMarketTemplate
      ? await market.leverage.repayBands(stateCollateral, userCollateral, userBorrowed)
      : market.leverageV2.hasLeverage()
        ? await market.leverageV2.repayBands(stateCollateral, userCollateral, userBorrowed)
        : await market.deleverage.repayBands(userCollateral)
  },
  validationSuite: repayValidationSuite({ leverageRequired: false }),
})
