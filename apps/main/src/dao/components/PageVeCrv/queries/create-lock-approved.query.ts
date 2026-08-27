import { requireLib } from '@evm-ui/features/connect-wallet'
import { queryFactory, rootKeys } from '@evm-ui/lib/model'
import type { CreateLockParams, CreateLockQuery } from './create-lock.types'
import { createLockApprovalQueryValidationSuite } from './create-lock.validation'

export const { useQuery: useCreateLockIsApproved, fetchQuery: fetchCreateLockIsApproved } = queryFactory({
  queryKey: ({ chainId, userAddress, lockedAmt }: CreateLockParams) =>
    [...rootKeys.userChain({ chainId, userAddress }), 'lockCrv.isApproved', { lockedAmt }] as const,
  queryFn: async ({ lockedAmt }: CreateLockQuery) => await requireLib('curveApi').boosting.isApproved(lockedAmt),
  category: 'dao.user',
  validationSuite: createLockApprovalQueryValidationSuite,
})
