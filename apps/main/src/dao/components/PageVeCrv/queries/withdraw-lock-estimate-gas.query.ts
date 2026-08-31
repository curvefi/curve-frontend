import { requireLib } from '@evm-ui/features/connect-wallet'
import { queryFactory, rootKeys } from '@evm-ui/lib/model'
import { useEstimateGas } from '@evm-ui/lib/model/entities/gas-info'
import type { BaseConfig } from '@legacy-ui/utils'
import type { WithdrawLockParams, WithdrawLockQuery } from './withdraw-lock.types'
import { withdrawLockValidationSuite } from './withdraw-lock.validation'

const { useQuery: useWithdrawLockEstimateGasQuery } = queryFactory({
  queryKey: ({ chainId, userAddress }: WithdrawLockParams) =>
    [...rootKeys.userChain({ chainId, userAddress }), 'boosting.estimateGas.withdrawLockedCrv'] as const,
  queryFn: async (_query: WithdrawLockQuery) => await requireLib('curveApi').boosting.estimateGas.withdrawLockedCrv(),
  category: 'dao.user',
  validationSuite: withdrawLockValidationSuite,
})

export const useWithdrawLockGasEstimate = (networks: Record<number, BaseConfig>, query: WithdrawLockParams) => {
  const { data: estimate, isLoading: estimateLoading, error: estimateError } = useWithdrawLockEstimateGasQuery(query)
  const {
    data,
    isLoading: conversionLoading,
    error: conversionError,
  } = useEstimateGas(networks, query.chainId, estimate, estimate != null)

  return {
    data,
    isLoading: estimateLoading || conversionLoading,
    error: estimateError ?? conversionError,
  }
}
