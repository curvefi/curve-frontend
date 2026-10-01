import { requireLib } from '@evm-ui/features/connect-wallet'
import { rootKeys } from '@evm-ui/queries/root-keys'
import { queryFactory } from '@ui/features/queries/factory'
import type { IncreaseLockParams, IncreaseLockQuery } from './increase-lock.types'
import { increaseLockQueryValidationSuite } from './increase-lock.validation'

export const { useQuery: useIncreaseLockIsApproved, fetchQuery: fetchIncreaseLockIsApproved } = queryFactory({
  queryKey: ({ chainId, userAddress, lockedAmount }: IncreaseLockParams) => ({
    name: 'boosting.isApproved',
    ...rootKeys.userChain({ chainId, userAddress }),
    lockedAmount,
  }),
  queryFn: async ({ lockedAmount }: IncreaseLockQuery) =>
    await requireLib('curveApi').boosting.isApproved(lockedAmount),
  category: 'dao.user',
  validationSuite: increaseLockQueryValidationSuite,
})
