import { useEstimateGas } from '@/llamalend/hooks/useEstimateGas'
import { getLlamaMarket } from '@/llamalend/llama.utils'
import type { NetworkDict } from '@/llamalend/llamalend.types'
import { type RepayIsApprovedParams, useRepayIsApproved } from '@/llamalend/queries/repay/repay-is-approved.query'
import type { IChainId, TGas } from '@curvefi/llamalend-api/lib/interfaces'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { type RepayIsFullQuery } from '../validation/manage-loan.types'
import { repayFromCollateralIsFullValidationSuite } from '../validation/manage-loan.validation'

const { useQuery: useRepayLoanEstimateGas } = queryFactory({
  queryKey: ({
    chainId,
    marketId,
    stateCollateral = '0',
    userCollateral = '0',
    userBorrowed = '0',
    userAddress,
    isFull,
    slippage,
    leverageEnabled,
  }: RepayIsApprovedParams) =>
    [
      ...rootKeys.userMarket({ chainId, marketId, userAddress }),
      'estimateGas.repay',
      { stateCollateral },
      { userCollateral },
      { userBorrowed },
      { isFull },
      { slippage },
      { leverageEnabled },
    ] as const,
  queryFn: async ({
    marketId,
    stateCollateral,
    userCollateral,
    userBorrowed,
    isFull,
    userAddress,
    slippage,
    leverageEnabled,
  }: RepayIsFullQuery & { leverageEnabled?: boolean }): Promise<TGas> => {
    const market = getLlamaMarket(marketId)
    if (isFull) {
      return await market.estimateGas.fullRepay(userAddress)
    }
    if (leverageEnabled) {
      if (market instanceof LendMarketTemplate) {
        return await market.leverage.estimateGas.repay(stateCollateral, userCollateral, userBorrowed, +slippage)
      }
      if (market.leverageV2.hasLeverage()) {
        return await market.leverageV2.estimateGas.repay(stateCollateral, userCollateral, userBorrowed, +slippage)
      }
    }
    console.assert(!+stateCollateral, `Expected 0 stateCollateral for non-leverage market, got ${stateCollateral}`)
    console.assert(!+userCollateral, `Expected 0 userCollateral for non-leverage market, got ${userCollateral}`)
    return await market.estimateGas.repay(userCollateral)
  },
  staleTime: '1m',
  validationSuite: repayFromCollateralIsFullValidationSuite,
})

const { useQuery: useRepayLoanApproveEstimateGas } = queryFactory({
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
      'estimateGas.repayApprove',
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
  }: RepayIsFullQuery & { leverageEnabled?: boolean }): Promise<TGas> => {
    const market = getLlamaMarket(marketId)
    if (isFull) {
      return await market.estimateGas.fullRepayApprove(userAddress)
    }
    if (leverageEnabled) {
      if (market instanceof LendMarketTemplate) {
        return await market.leverage.estimateGas.repayApprove(userCollateral, userBorrowed)
      }
      if (market.leverageV2.hasLeverage()) {
        return await market.leverageV2.estimateGas.repayApprove(userCollateral, userBorrowed)
      }
    }
    console.assert(!+stateCollateral, `Expected 0 stateCollateral for non-leverage market, got ${stateCollateral}`)
    console.assert(!+userCollateral, `Expected 0 userCollateral for non-leverage market, got ${userCollateral}`)
    return await market.estimateGas.repayApprove(userCollateral)
  },
  staleTime: '1m',
  validationSuite: repayFromCollateralIsFullValidationSuite,
})

export const useRepayEstimateGas = <ChainId extends IChainId>(
  networks: NetworkDict<ChainId>,
  query: RepayIsApprovedParams<ChainId>,
  enabled?: boolean,
) => {
  const { chainId } = query
  const { data: isApproved, isLoading: isApprovedLoading, error: isApprovedError } = useRepayIsApproved(query, enabled)
  const {
    data: approveEstimate,
    isLoading: approveLoading,
    error: approveError,
  } = useRepayLoanApproveEstimateGas(query, enabled && !isApproved)
  const {
    data: repayEstimate,
    isLoading: repayLoading,
    error: repayError,
  } = useRepayLoanEstimateGas(query, enabled && isApproved)
  const {
    data,
    isLoading: conversionLoading,
    error: estimateError,
  } = useEstimateGas<ChainId>(networks, chainId, isApproved ? approveEstimate : repayEstimate, enabled)
  return {
    data,
    isLoading: [isApprovedLoading, approveLoading, repayLoading, conversionLoading].some(Boolean),
    error: [isApprovedError, approveError, repayError, estimateError].find(Boolean),
  }
}
