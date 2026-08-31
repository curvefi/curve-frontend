import { requireLib } from '@evm-ui/features/connect-wallet'
import { queryFactory, rootKeys } from '@evm-ui/lib/model'
import { useEstimateGas } from '@evm-ui/lib/model/entities/gas-info'
import type { BaseConfig } from '@legacy-ui/utils'
import type { ExtendLockParams, ExtendLockQuery } from './extend-lock.types'
import { extendLockQueryValidationSuite } from './extend-lock.validation'

const { useQuery: useExtendLockGasEstimateQuery } = queryFactory({
  queryKey: ({ chainId, userAddress, days }: ExtendLockParams) =>
    [...rootKeys.userChain({ chainId, userAddress }), 'boosting.estimateGas.increaseUnlockTime', { days }] as const,
  queryFn: async ({ days }: ExtendLockQuery) =>
    await requireLib('curveApi').boosting.estimateGas.increaseUnlockTime(days),
  category: 'dao.user',
  validationSuite: extendLockQueryValidationSuite,
})

export const useExtendLockGasEstimate = (
  networks: Record<number, BaseConfig>,
  query: ExtendLockParams,
  enabled?: boolean,
) => {
  const { chainId } = query
  const {
    data: estimate,
    isLoading: estimateLoading,
    error: estimateError,
  } = useExtendLockGasEstimateQuery(query, enabled)
  const {
    data,
    isLoading: conversionLoading,
    error: conversionError,
  } = useEstimateGas(networks, chainId, estimate, enabled && estimate != null)
  return { data, isLoading: estimateLoading || conversionLoading, error: estimateError ?? conversionError }
}
