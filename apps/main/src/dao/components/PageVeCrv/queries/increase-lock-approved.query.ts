import { requireLib } from '@evm-ui/features/connect-wallet'
import { queryFactory, rootKeys } from '@evm-ui/lib/model'
import type { IncreaseLockParams, IncreaseLockQuery } from './increase-lock.types'
import { increaseLockQueryValidationSuite } from './increase-lock.validation'

export const { useQuery: useIncreaseLockIsApproved, fetchQuery: fetchIncreaseLockIsApproved } = queryFactory({
  queryKey: ({ chainId, userAddress, lockedAmount }: IncreaseLockParams) =>
    [...rootKeys.userChain({ chainId, userAddress }), 'lockCrv.increase.isApproved', { lockedAmount }] as const,
  queryFn: async ({ lockedAmount }: IncreaseLockQuery) =>
    await requireLib('curveApi').boosting.isApproved(lockedAmount),
  category: 'dao.user',
  validationSuite: increaseLockQueryValidationSuite,
})
