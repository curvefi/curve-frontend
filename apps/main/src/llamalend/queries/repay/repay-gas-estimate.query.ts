import { getLoanImplementation } from '@/llamalend/queries/market/market.query-helpers'
import { repayExpectedBorrowedQueryKey } from '@/llamalend/queries/repay/repay-expected-borrowed.query'
import { useRepayIsApproved } from '@/llamalend/queries/repay/repay-is-approved.query'
import type { RepayParams, RepayQuery } from '@/llamalend/queries/validation/repay.types'
import { repayValidationSuite } from '@/llamalend/queries/validation/repay.validation'
import type { TGas } from '@curvefi/llamalend-api/lib/interfaces'
import { notFalsy } from '@primitives/objects.utils'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { createApprovedEstimateGasHook } from '@ui-kit/lib/model/entities/gas-info'
import { getRepayImplementation, isFullRepayFromDebtToken, isRepayLeveraged } from './repay-query.helpers'

const { useQuery: useRepayLoanEstimateGas, invalidate: invalidateRepayLoanEstimateGasQuery } = queryFactory({
  queryKey: ({
    chainId,
    marketId,
    stateCollateral = '0',
    userCollateral = '0',
    userBorrowed = '0',
    userAddress,
    isFull,
    slippage,
    routeId,
  }: RepayParams) =>
    [
      ...rootKeys.userMarket({ chainId, marketId, userAddress }),
      'estimateGas.repay',
      { stateCollateral },
      { userCollateral },
      { userBorrowed },
      { isFull },
      { slippage },
      { routeId },
    ] as const,
  queryFn: async ({
    marketId,
    stateCollateral,
    userCollateral,
    userBorrowed,
    isFull,
    userAddress,
    slippage,
    routeId,
  }: RepayQuery): Promise<TGas> => {
    const useFullRepay = isFullRepayFromDebtToken(isFull, stateCollateral, userCollateral)
    if (useFullRepay) {
      return await getLoanImplementation(marketId).estimateGas.fullRepay(userAddress)
    }
    const [type, impl, args] = getRepayImplementation(marketId, {
      userCollateral,
      stateCollateral,
      userBorrowed,
      routeId,
      slippage,
    })
    switch (type) {
      case 'zapV2':
        return await impl.estimateGas.repay(...args)
      case 'V1':
      case 'V2':
        return await impl.estimateGas.repay(...args, +slippage)
      case 'deleverage':
        return await impl.estimateGas.repay(...args, +slippage)
      case 'unleveragedLend':
        return await impl.estimateGas.repay(...args)
      case 'unleveragedMint':
        return await impl.estimateGas.repay(...args)
    }
  },
  category: 'llamalend.repay',
  validationSuite: repayValidationSuite({ leverageRequired: false, validateMax: true }),
  dependencies: params => notFalsy(isRepayLeveraged(params) && repayExpectedBorrowedQueryKey(params)),
})

const { useQuery: useRepayApproveGasEstimate, invalidate: invalidateRepayApproveGasEstimateQuery } = queryFactory({
  queryKey: ({
    chainId,
    marketId,
    stateCollateral = '0',
    userCollateral = '0',
    userBorrowed = '0',
    userAddress,
    isFull,
    slippage,
    routeId,
  }: RepayParams) =>
    [
      ...rootKeys.userMarket({ chainId, marketId, userAddress }),
      'estimateGas.repayApprove',
      { stateCollateral },
      { userCollateral },
      { userBorrowed },
      { isFull },
      { slippage },
      { routeId },
    ] as const,
  queryFn: async ({
    marketId,
    stateCollateral,
    userCollateral,
    userBorrowed,
    isFull,
    userAddress,
    slippage,
    routeId,
  }: RepayQuery): Promise<TGas> => {
    const useFullRepay = isFullRepayFromDebtToken(isFull, stateCollateral, userCollateral)
    if (useFullRepay) {
      return await getLoanImplementation(marketId).estimateGas.fullRepayApprove(userAddress)
    }
    const [type, impl] = getRepayImplementation(marketId, {
      userCollateral,
      stateCollateral,
      userBorrowed,
      routeId,
      slippage,
    })
    switch (type) {
      case 'zapV2':
        return await impl.estimateGas.repayApprove({ userCollateral, userBorrowed })
      case 'V1':
      case 'V2':
        return await impl.estimateGas.repayApprove(userCollateral, userBorrowed)
      case 'deleverage':
        throw new Error('estimateGas.repayApprove is not supported for deleverage repay')
      case 'unleveragedMint':
        return await impl.estimateGas.repayApprove(userBorrowed)
      case 'unleveragedLend':
        return await impl.estimateGas.repayApprove(userBorrowed)
    }
  },
  category: 'llamalend.repay',
  validationSuite: repayValidationSuite({ leverageRequired: false, validateMax: true }),
  dependencies: params => notFalsy(isRepayLeveraged(params) && repayExpectedBorrowedQueryKey(params)),
})

export const useRepayEstimateGas = createApprovedEstimateGasHook({
  useIsApproved: useRepayIsApproved,
  useApproveEstimate: useRepayApproveGasEstimate,
  useActionEstimate: useRepayLoanEstimateGas,
})

export const invalidateRepayEstimateGasQueries = async (params: RepayParams) =>
  await Promise.all([invalidateRepayApproveGasEstimateQuery(params), invalidateRepayLoanEstimateGasQuery(params)])
