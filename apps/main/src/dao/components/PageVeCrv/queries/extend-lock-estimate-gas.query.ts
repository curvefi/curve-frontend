import { requireLib } from '@evm-ui/features/connect-wallet'
import { createEstimateGasHook } from '@evm-ui/queries/gas-info.query'
import { rootKeys } from '@evm-ui/queries/root-keys'
import { queryFactory } from '@ui/features/queries/factory'
import type { ExtendLockParams, ExtendLockQuery } from './extend-lock.types'
import { extendLockQueryValidationSuite } from './extend-lock.validation'

const { useQuery: useExtendLockGasEstimateQuery } = queryFactory({
  queryKey: ({ chainId, userAddress, days }: ExtendLockParams) => ({
    name: 'boosting.estimateGas.increaseUnlockTime',
    ...rootKeys.userChain({ chainId, userAddress }),
    days,
  }),
  queryFn: async ({ days }: ExtendLockQuery) =>
    await requireLib('curveApi').boosting.estimateGas.increaseUnlockTime(days),
  category: 'dao.user',
  validationSuite: extendLockQueryValidationSuite,
})

export const useExtendLockGasEstimate = createEstimateGasHook(useExtendLockGasEstimateQuery)
