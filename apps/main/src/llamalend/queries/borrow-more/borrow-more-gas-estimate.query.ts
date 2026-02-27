import { useBorrowMoreIsApproved } from '@/llamalend/queries/borrow-more/borrow-more-is-approved.query'
import {
  getBorrowMoreImplementation,
  getBorrowMoreImplementationArgs,
} from '@/llamalend/queries/borrow-more/borrow-more-query.helpers'
import type { BorrowMoreParams, BorrowMoreQuery } from '@/llamalend/queries/validation/borrow-more.validation'
import { borrowMoreValidationSuite } from '@/llamalend/queries/validation/borrow-more.validation'
import type { TGas } from '@curvefi/llamalend-api/lib/interfaces'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { createApprovedEstimateGasHook } from '@ui-kit/lib/model/entities/gas-info'

const { useQuery: useBorrowMoreApproveGasEstimate } = queryFactory({
  queryKey: ({
    chainId,
    marketId,
    userAddress,
    userCollateral = '0',
    userBorrowed = '0',
    maxDebt,
    leverageEnabled,
  }: BorrowMoreParams) =>
    [
      ...rootKeys.userMarket({ chainId, marketId, userAddress }),
      'estimateGas.borrowMoreApprove',
      { userCollateral },
      { userBorrowed },
      { maxDebt },
      { leverageEnabled },
    ] as const,
  queryFn: async ({
    marketId,
    userCollateral = '0',
    userBorrowed = '0',
    leverageEnabled,
  }: BorrowMoreQuery): Promise<TGas | null> => {
    if (!+userCollateral && !+userBorrowed) return null
    const [type, impl] = getBorrowMoreImplementation(marketId, leverageEnabled)
    switch (type) {
      case 'V1':
      case 'V2':
        return await impl.estimateGas.borrowMoreApprove(userCollateral, userBorrowed)
      case 'unleveraged':
        return await impl.estimateGas.borrowMoreApprove(userCollateral)
    }
  },
  category: 'llamalend.borrowMore',
  validationSuite: borrowMoreValidationSuite({ leverageRequired: false }),
})

const { useQuery: useBorrowMoreGasEstimate } = queryFactory({
  queryKey: ({
    chainId,
    marketId,
    userAddress,
    userCollateral = '0',
    userBorrowed = '0',
    debt = '0',
    maxDebt,
    slippage,
    leverageEnabled,
  }: BorrowMoreParams) =>
    [
      ...rootKeys.userMarket({ chainId, marketId, userAddress }),
      'estimateGas.borrowMore',
      { userCollateral },
      { userBorrowed },
      { debt },
      { maxDebt },
      { slippage },
      { leverageEnabled },
    ] as const,
  queryFn: async ({
    marketId,
    userCollateral = '0',
    userBorrowed = '0',
    debt = '0',
    slippage,
    leverageEnabled,
  }: BorrowMoreQuery): Promise<TGas | null> => {
    if (!+debt) return null
    const [type, impl, args] = getBorrowMoreImplementationArgs(marketId, {
      userCollateral,
      userBorrowed,
      debt,
      leverageEnabled,
    })
    switch (type) {
      case 'V1':
      case 'V2':
        await impl.borrowMoreExpectedCollateral(userCollateral, userBorrowed, debt, +slippage)
        return await impl.estimateGas.borrowMore(...args, +slippage)
      case 'unleveraged':
        return await impl.estimateGas.borrowMore(...args)
    }
  },
  category: 'llamalend.borrowMore',
  validationSuite: borrowMoreValidationSuite({ leverageRequired: false }),
})

export const useBorrowMoreEstimateGas = createApprovedEstimateGasHook({
  useIsApproved: useBorrowMoreIsApproved,
  useApproveEstimate: useBorrowMoreApproveGasEstimate,
  useActionEstimate: useBorrowMoreGasEstimate,
})
