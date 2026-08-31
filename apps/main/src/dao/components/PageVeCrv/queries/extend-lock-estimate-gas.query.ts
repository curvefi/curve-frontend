import { requireLib } from '@evm-ui/features/connect-wallet'
import { queryFactory, rootKeys } from '@evm-ui/lib/model'
import { createEstimateGasHook } from '@evm-ui/lib/model/entities/gas-info'
import type { ExtendLockParams, ExtendLockQuery } from './extend-lock.types'
import { extendLockQueryValidationSuite } from './extend-lock.validation'

export const { useQuery: useExtendLockGasEstimateQuery } = queryFactory({
  queryKey: ({ chainId, userAddress, days }: ExtendLockParams) =>
    [...rootKeys.userChain({ chainId, userAddress }), 'boosting.estimateGas.increaseUnlockTime', { days }] as const,
  queryFn: async ({ days }: ExtendLockQuery) =>
    await requireLib('curveApi').boosting.estimateGas.increaseUnlockTime(days),
  category: 'dao.user',
  validationSuite: extendLockQueryValidationSuite,
})

export const useExtendLockGasEstimate = createEstimateGasHook(useExtendLockGasEstimateQuery)
