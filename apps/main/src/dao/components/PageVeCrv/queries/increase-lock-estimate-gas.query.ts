import { requireLib } from '@evm-ui/features/connect-wallet'
import { queryFactory, rootKeys } from '@evm-ui/lib/model'
import { createApprovedEstimateGasHook } from '@evm-ui/lib/model/entities/gas-info'
import { useIncreaseLockIsApproved } from './increase-lock-approved.query'
import type { IncreaseLockParams, IncreaseLockQuery } from './increase-lock.types'
import { increaseLockQueryValidationSuite } from './increase-lock.validation'

export const { useQuery: useIncreaseLockApproveEstimateGas } = queryFactory({
  queryKey: ({ chainId, userAddress, lockedAmount }: IncreaseLockParams) =>
    [
      ...rootKeys.userChain({ chainId, userAddress }),
      'lockCrv.increase.estimateGas.approve',
      { lockedAmount },
    ] as const,
  queryFn: async ({ lockedAmount }: IncreaseLockQuery) =>
    await requireLib('curveApi').boosting.estimateGas.approve(lockedAmount),
  category: 'dao.user',
  validationSuite: increaseLockQueryValidationSuite,
})

export const { useQuery: useIncreaseLockEstimateGas } = queryFactory({
  queryKey: ({ chainId, userAddress, lockedAmount }: IncreaseLockParams) =>
    [...rootKeys.userChain({ chainId, userAddress }), 'lockCrv.increase.estimateGas.action', { lockedAmount }] as const,
  queryFn: async ({ lockedAmount }: IncreaseLockQuery) =>
    await requireLib('curveApi').boosting.estimateGas.increaseAmount(lockedAmount),
  category: 'dao.user',
  validationSuite: increaseLockQueryValidationSuite,
})

export const useIncreaseLockGasEstimate = createApprovedEstimateGasHook({
  useIsApproved: useIncreaseLockIsApproved,
  useApproveEstimate: useIncreaseLockApproveEstimateGas,
  useActionEstimate: useIncreaseLockEstimateGas,
})
