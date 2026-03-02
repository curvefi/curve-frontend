import { getLlamaMarket } from '@/llamalend/llama.utils'
import { type RepayIsApprovedParams, useRepayIsApproved } from '@/llamalend/queries/repay/repay-is-approved.query'
import type { TGas } from '@curvefi/llamalend-api/lib/interfaces'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { createApprovedEstimateGasHook } from '@ui-kit/lib/model/entities/gas-info'
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
    const [type, impl, args] = getRepayImplementation(marketId, { userCollateral, stateCollateral, userBorrowed })
    switch (type) {
      case 'V1':
      case 'V2':
        return await impl.estimateGas.repay(...args, +slippage)
      case 'deleverage':
        throw new Error('estimateGas.repay is not supported for deleverage repay')
      case 'unleveraged':
        return await impl.estimateGas.repay(...args)
    }
  },
  category: 'llamalend.repay',
  validationSuite: repayFromCollateralIsFullValidationSuite,
})

const { useQuery: useRepayApproveGasEstimate } = queryFactory({
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
  category: 'llamalend.repay',
  validationSuite: repayFromCollateralIsFullValidationSuite,
})

export const useRepayEstimateGas = createApprovedEstimateGasHook({
  useIsApproved: useRepayIsApproved,
  useApproveEstimate: useRepayApproveGasEstimate,
  useActionEstimate: useRepayLoanEstimateGas,
})
