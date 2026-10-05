import { requireLib } from '@evm-ui/features/connect-wallet'
import { createApprovedEstimateGasHook } from '@evm-ui/queries/gas-info.query'
import { queryFactory } from '@ui/features/queries/factory'
import { useCreateLockIsApproved } from './create-lock-approved.query'
import type { CreateLockParams, CreateLockQuery } from './create-lock.types'
import { createLockApprovalQueryValidationSuite, createLockQueryValidationSuite } from './create-lock.validation'

const { useQuery: useCreateLockApproveEstimateGas } = queryFactory({
  queryKey: ({ chainId, userAddress, lockedAmount }: CreateLockParams) =>
    ({ name: 'boosting.estimateGas.approve', chainId, userAddress, lockedAmount }) as const,
  queryFn: async ({ lockedAmount }: CreateLockQuery) =>
    await requireLib('curveApi').boosting.estimateGas.approve(lockedAmount),
  category: 'dao.user',
  validationSuite: createLockApprovalQueryValidationSuite,
})

const { useQuery: useCreateLockEstimateGas } = queryFactory({
  queryKey: ({ chainId, userAddress, lockedAmount, days }: CreateLockParams) =>
    ({ name: 'boosting.estimateGas.createLock', chainId, userAddress, lockedAmount, days }) as const,
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
