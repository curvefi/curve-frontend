import { getLlamaMarket } from '@/llamalend/llama.utils'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import {
  type RepayFromCollateralIsFullParams,
  type RepayFromCollateralIsFullQuery,
} from '../validation/manage-loan.types'
import { repayFromCollateralIsFullValidationSuite } from '../validation/manage-loan.validation'

type RepayIsApprovedParams = RepayFromCollateralIsFullParams & { leverageEnabled?: boolean }

export const { useQuery: useRepayIsApproved, fetchQuery: fetchRepayIsApproved } = queryFactory({
  queryKey: ({
    chainId,
    marketId,
    stateCollateral = '0',
    userCollateral = '0',
    userBorrowed = '0',
    userAddress,
    isFull,
    leverageEnabled,
  }: RepayIsApprovedParams) =>
    [
      ...rootKeys.userMarket({ chainId, marketId, userAddress }),
      'repayIsApproved',
      { stateCollateral },
      { userCollateral },
      { userBorrowed },
      { isFull },
      { leverageEnabled },
    ] as const,
  queryFn: async ({
    marketId,
    stateCollateral,
    userCollateral,
    userBorrowed,
    isFull,
    userAddress,
    leverageEnabled,
  }: RepayFromCollateralIsFullQuery & { leverageEnabled?: boolean }): Promise<boolean> => {
    const market = getLlamaMarket(marketId)
    if (isFull) return await market.fullRepayIsApproved(userAddress)
    if (market instanceof LendMarketTemplate) return await market.leverage.repayIsApproved(userCollateral, userBorrowed)
    if (leverageEnabled && market.leverageV2.hasLeverage()) {
      return await market.leverageV2.repayIsApproved(userCollateral, userBorrowed)
    }
    console.assert(!+stateCollateral, `Expected 0 stateCollateral for non-leverage market, got ${stateCollateral}`)
    console.assert(!+userCollateral, `Expected 0 userCollateral for non-leverage market, got ${userCollateral}`)
    return await market.repayIsApproved(userCollateral)
  },
  staleTime: '1m',
  validationSuite: repayFromCollateralIsFullValidationSuite,
})
