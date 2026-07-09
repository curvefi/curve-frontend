import { useResetIsApproved } from '@/llamalend/queries/reset/reset-is-approved.query'
import { resetIsAvailableQueryKey } from '@/llamalend/queries/reset/reset-is-available.query'
import { getResetImplementation } from '@/llamalend/queries/reset/reset-query.helpers'
import {
  type ResetParams,
  type ResetQuery,
  resetValidationSuite,
} from '@/llamalend/queries/validation/reset.validation'
import type { TGas } from '@curvefi/llamalend-api/lib/interfaces'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { createApprovedEstimateGasHook } from '@ui-kit/lib/model/entities/gas-info'

const { useQuery: useResetLoanEstimateGas } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress, userBorrowed = '0' }: ResetParams) =>
    [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'estimateGas.reset', { userBorrowed }] as const,
  queryFn: async ({ marketId, userAddress, ...params }: ResetQuery): Promise<TGas> =>
    await getResetImplementation(marketId).estimateGas.repay({
      debt: params.userBorrowed,
      address: userAddress,
      shrink: true,
    }),
  category: 'llamalend.repay',
  validationSuite: resetValidationSuite,
  dependencies: params => [resetIsAvailableQueryKey(params)],
})

const { useQuery: useResetApproveGasEstimate } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress, userBorrowed = '0' }: ResetParams) =>
    [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'estimateGas.resetApprove', { userBorrowed }] as const,
  queryFn: async ({ marketId, ...params }: ResetQuery): Promise<TGas> =>
    await getResetImplementation(marketId).estimateGas.repayApprove(params.userBorrowed),
  category: 'llamalend.repay',
  validationSuite: resetValidationSuite,
  dependencies: params => [resetIsAvailableQueryKey(params)],
})

export const useResetEstimateGas = createApprovedEstimateGasHook({
  useIsApproved: useResetIsApproved,
  useApproveEstimate: useResetApproveGasEstimate,
  useActionEstimate: useResetLoanEstimateGas,
})
