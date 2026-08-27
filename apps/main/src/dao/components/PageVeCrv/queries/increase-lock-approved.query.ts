import { requireLib } from '@evm-ui/features/connect-wallet'
import { queryFactory, rootKeys } from '@evm-ui/lib/model'
import type { IncreaseLockParams, IncreaseLockQuery } from './increase-lock.types'
import { increaseLockQueryValidationSuite } from './increase-lock.validation'

export const { useQuery: useIncreaseLockIsApproved, fetchQuery: fetchIncreaseLockIsApproved } = queryFactory({
  queryKey: ({ chainId, userAddress, lockedAmt }: IncreaseLockParams) =>
    [...rootKeys.userChain({ chainId, userAddress }), 'lockCrv.increase.isApproved', { lockedAmt }] as const,
  queryFn: async ({ lockedAmt }: IncreaseLockQuery) => await requireLib('curveApi').boosting.isApproved(lockedAmt),
  category: 'dao.user',
  validationSuite: increaseLockQueryValidationSuite,
})
