import { requireLib } from '@evm-ui/features/connect-wallet'
import { queryFactory, rootKeys } from '@evm-ui/lib/model'
import { createEstimateGasHook } from '@evm-ui/lib/model/entities/gas-info'
import type { WithdrawLockParams, WithdrawLockQuery } from './withdraw-lock.types'
import { withdrawLockValidationSuite } from './withdraw-lock.validation'

export const { useQuery: useWithdrawLockEstimateGasQuery } = queryFactory({
  queryKey: ({ chainId, userAddress }: WithdrawLockParams) =>
    [...rootKeys.userChain({ chainId, userAddress }), 'boosting.estimateGas.withdrawLockedCrv'] as const,
  queryFn: async (_query: WithdrawLockQuery) => await requireLib('curveApi').boosting.estimateGas.withdrawLockedCrv(),
  category: 'dao.user',
  validationSuite: withdrawLockValidationSuite,
})

export const useWithdrawLockGasEstimate = createEstimateGasHook(useWithdrawLockEstimateGasQuery)
