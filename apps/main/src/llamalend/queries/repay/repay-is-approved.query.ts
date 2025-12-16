import { getLlamaMarket } from '@/llamalend/llama.utils'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { type RepayIsFullParams, type RepayIsFullQuery } from '../validation/manage-loan.types'
import { repayFromCollateralIsFullValidationSuite } from '../validation/manage-loan.validation'

export type RepayIsApprovedParams<ChainId = IChainId> = RepayIsFullParams<ChainId> & {
  leverageEnabled?: boolean
}

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
  }: RepayIsFullQuery & { leverageEnabled?: boolean }): Promise<boolean> => {
    const market = getLlamaMarket(marketId)
    if (isFull) return await market.fullRepayIsApproved(userAddress)
    if (leverageEnabled) {
      if (market instanceof LendMarketTemplate) {
        return await market.leverage.repayIsApproved(userCollateral, userBorrowed)
      }
      if (market.leverageV2.hasLeverage()) {
        return await market.leverageV2.repayIsApproved(userCollateral, userBorrowed)
      }
    }
    console.assert(!+stateCollateral, `Expected 0 stateCollateral for non-leverage market, got ${stateCollateral}`)
    console.assert(!+userCollateral, `Expected 0 userCollateral for non-leverage market, got ${userCollateral}`)
    return await market.repayIsApproved(userCollateral)
  },
  staleTime: '1m',
  validationSuite: repayFromCollateralIsFullValidationSuite,
})
