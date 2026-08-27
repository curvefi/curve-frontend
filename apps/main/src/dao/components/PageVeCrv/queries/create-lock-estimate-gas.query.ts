import { requireLib } from '@evm-ui/features/connect-wallet'
import { queryFactory, rootKeys } from '@evm-ui/lib/model'
import { createApprovedEstimateGasHook } from '@evm-ui/lib/model/entities/gas-info'
import { useCreateLockIsApproved } from './create-lock-approved.query'
import type { CreateLockParams, CreateLockQuery } from './create-lock.types'
import { createLockApprovalQueryValidationSuite, createLockQueryValidationSuite } from './create-lock.validation'

export const { useQuery: useCreateLockApproveEstimateGas } = queryFactory({
  queryKey: ({ chainId, userAddress, lockedAmt }: CreateLockParams) =>
    [...rootKeys.userChain({ chainId, userAddress }), 'lockCrv.estimateGas.approve', { lockedAmt }] as const,
  queryFn: async ({ lockedAmt }: CreateLockQuery) =>
    await requireLib('curveApi').boosting.estimateGas.approve(lockedAmt),
  category: 'dao.user',
  validationSuite: createLockApprovalQueryValidationSuite,
})

export const { useQuery: useCreateLockEstimateGas } = queryFactory({
  queryKey: ({ chainId, userAddress, lockedAmt, days }: CreateLockParams) =>
    [...rootKeys.userChain({ chainId, userAddress }), 'lockCrv.estimateGas.create', { lockedAmt }, { days }] as const,
  queryFn: async ({ lockedAmt, days }: CreateLockQuery) =>
    await requireLib('curveApi').boosting.estimateGas.createLock(lockedAmt, days),
  category: 'dao.user',
  validationSuite: createLockQueryValidationSuite,
})

export const useCreateLockGasEstimate = createApprovedEstimateGasHook({
  useIsApproved: useCreateLockIsApproved,
  useApproveEstimate: useCreateLockApproveEstimateGas,
  useActionEstimate: useCreateLockEstimateGas,
})
