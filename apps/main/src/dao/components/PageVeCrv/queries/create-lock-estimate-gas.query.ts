import { requireLib } from '@evm-ui/features/connect-wallet'
import { queryFactory, rootKeys } from '@evm-ui/lib/model'
import { createApprovedEstimateGasHook } from '@evm-ui/lib/model/entities/gas-info'
import { useCreateLockIsApproved } from './create-lock-approved.query'
import type { CreateLockParams, CreateLockQuery } from './create-lock.types'
import { createLockApprovalQueryValidationSuite, createLockQueryValidationSuite } from './create-lock.validation'

export const { useQuery: useCreateLockApproveEstimateGas } = queryFactory({
  queryKey: ({ chainId, userAddress, lockedAmount }: CreateLockParams) =>
    [...rootKeys.userChain({ chainId, userAddress }), 'boosting.estimateGas.approve', { lockedAmount }] as const,
  queryFn: async ({ lockedAmount }: CreateLockQuery) =>
    await requireLib('curveApi').boosting.estimateGas.approve(lockedAmount),
  category: 'dao.user',
  validationSuite: createLockApprovalQueryValidationSuite,
})

export const { useQuery: useCreateLockEstimateGas } = queryFactory({
  queryKey: ({ chainId, userAddress, lockedAmount, days }: CreateLockParams) =>
    [
      ...rootKeys.userChain({ chainId, userAddress }),
      'boosting.estimateGas.createLock',
      { lockedAmount },
      { days },
    ] as const,
  queryFn: async ({ lockedAmount, days }: CreateLockQuery) =>
    await requireLib('curveApi').boosting.estimateGas.createLock(lockedAmount, days),
  category: 'dao.user',
  validationSuite: createLockQueryValidationSuite,
})

export const useCreateLockGasEstimate = createApprovedEstimateGasHook({
  useIsApproved: useCreateLockIsApproved,
  useApproveEstimate: useCreateLockApproveEstimateGas,
  useActionEstimate: useCreateLockEstimateGas,
})
