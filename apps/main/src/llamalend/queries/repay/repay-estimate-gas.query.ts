import { useEstimateGas } from '@/llamalend/hooks/useEstimateGas'
import { getLlamaMarket } from '@/llamalend/llama.utils'
import type { NetworkDict } from '@/llamalend/llamalend.types'
import { type RepayIsApprovedParams, useRepayIsApproved } from '@/llamalend/queries/repay/repay-is-approved.query'
import type { IChainId, TGas } from '@curvefi/llamalend-api/lib/interfaces'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { type RepayIsFullQuery } from '../validation/manage-loan.types'
import { repayFromCollateralIsFullValidationSuite } from '../validation/manage-loan.validation'
import { getRepayImplementation } from './repay-query.helpers'

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
  }: RepayIsApprovedParams) =>
    [
      ...rootKeys.userMarket({ chainId, marketId, userAddress }),
      'estimateGas.repay',
      { stateCollateral },
      { userCollateral },
      { userBorrowed },
      { isFull },
      { slippage },
    ] as const,
  queryFn: async ({
    marketId,
    stateCollateral,
    userCollateral,
    userBorrowed,
    isFull,
    userAddress,
    slippage,
  }: RepayIsFullQuery): Promise<TGas> => {
    const market = getLlamaMarket(marketId)
    const useFullRepay = isFull && !+stateCollateral && !+userCollateral
    if (useFullRepay) {
      return await market.estimateGas.fullRepay(userAddress)
    }
    const [type, impl] = getRepayImplementation(marketId, { userCollateral, stateCollateral, userBorrowed })
    switch (type) {
      case 'V1':
      case 'V2':
        return await impl.estimateGas.repay(stateCollateral, userCollateral, userBorrowed, +slippage)
      case 'deleverage':
        throw new Error('estimateGas.repay is not supported for deleverage repay')
      case 'unleveraged':
        return await impl.estimateGas.repay(userBorrowed)
    }
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
  }: RepayIsApprovedParams) =>
    [
      ...rootKeys.userMarket({ chainId, marketId, userAddress }),
      'estimateGas.repayApprove',
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
    userAddress,
  }: RepayIsFullQuery): Promise<TGas> => {
    const useFullRepay = isFull && !+stateCollateral && !+userCollateral
    if (useFullRepay) {
      return await getLlamaMarket(marketId).estimateGas.fullRepayApprove(userAddress)
    }
    const [type, impl] = getRepayImplementation(marketId, { userCollateral, stateCollateral, userBorrowed })
    switch (type) {
      case 'V1':
      case 'V2':
        return await impl.estimateGas.repayApprove(userCollateral, userBorrowed)
      case 'deleverage':
        throw new Error('estimateGas.repayApprove is not supported for deleverage repay')
      case 'unleveraged':
        return await impl.estimateGas.repayApprove(userBorrowed)
    }
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
