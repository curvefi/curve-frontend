import { useEstimateGas } from '@/llamalend/hooks/useEstimateGas'
import type { NetworkDict } from '@/llamalend/llamalend.types'
import { useBorrowMoreIsApproved } from '@/llamalend/queries/borrow-more/borrow-more-is-approved.query'
import {
  getBorrowMoreImplementation,
  getBorrowMoreImplementationArgs,
} from '@/llamalend/queries/borrow-more/borrow-more-query.helpers'
import type { BorrowMoreParams, BorrowMoreQuery } from '@/llamalend/queries/validation/borrow-more.validation'
import { borrowMoreValidationSuite } from '@/llamalend/queries/validation/borrow-more.validation'
import type { IChainId, TGas } from '@curvefi/llamalend-api/lib/interfaces'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'

const { useQuery: useBorrowMoreApproveGasEstimate } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress, userCollateral = '0', userBorrowed = '0', maxDebt }: BorrowMoreParams) =>
    [
      ...rootKeys.userMarket({ chainId, marketId, userAddress }),
      'estimateGas.borrowMoreApprove',
      { userCollateral },
      { userBorrowed },
      { maxDebt },
    ] as const,
  queryFn: async ({ marketId, userCollateral = '0', userBorrowed = '0' }: BorrowMoreQuery): Promise<TGas | null> => {
    if (!+userCollateral && !+userBorrowed) return null
    const [type, impl] = getBorrowMoreImplementation(marketId)
    switch (type) {
      case 'V1':
      case 'V2':
        return await impl.estimateGas.borrowMoreApprove(userCollateral, userBorrowed)
      case 'unleveraged':
        return await impl.estimateGas.borrowMoreApprove(userCollateral)
    }
  },
  staleTime: '1m',
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
  }: BorrowMoreParams) =>
    [
      ...rootKeys.userMarket({ chainId, marketId, userAddress }),
      'estimateGas.borrowMore',
      { userCollateral },
      { userBorrowed },
      { debt },
      { maxDebt },
      { slippage },
    ] as const,
  queryFn: async ({
    marketId,
    userCollateral = '0',
    userBorrowed = '0',
    debt = '0',
    slippage,
  }: BorrowMoreQuery): Promise<TGas | null> => {
    if (!+debt) return null
    const [type, impl, args] = getBorrowMoreImplementationArgs(marketId, { userCollateral, userBorrowed, debt })
    switch (type) {
      case 'V1':
      case 'V2':
        await impl.borrowMoreExpectedCollateral(userCollateral, userBorrowed, debt, +slippage)
        return await impl.estimateGas.borrowMore(...args, +slippage)
      case 'unleveraged':
        return await impl.estimateGas.borrowMore(...args)
    }
  },
  staleTime: '1m',
  validationSuite: borrowMoreValidationSuite({ leverageRequired: false }),
})

export const useBorrowMoreEstimateGas = <ChainId extends IChainId>(
  networks: NetworkDict<ChainId>,
  query: BorrowMoreParams<ChainId>,
  enabled?: boolean,
) => {
  const {
    data: isApproved,
    isLoading: isApprovedLoading,
    error: isApprovedError,
  } = useBorrowMoreIsApproved(query, enabled)
  const {
    data: approveEstimate,
    isLoading: approveLoading,
    error: approveError,
  } = useBorrowMoreApproveGasEstimate(query, enabled && isApproved === false)
  const {
    data: borrowEstimate,
    isLoading: borrowLoading,
    error: borrowError,
  } = useBorrowMoreGasEstimate(query, enabled && isApproved === true)
  const {
    data,
    isLoading: conversionLoading,
    error: estimateError,
  } = useEstimateGas<ChainId>(networks, query.chainId, isApproved ? borrowEstimate : approveEstimate, enabled)
  return {
    data,
    isLoading: [isApprovedLoading, approveLoading, borrowLoading, conversionLoading].some(Boolean),
    error: [isApprovedError, approveError, borrowError, estimateError].find(Boolean),
  }
}
