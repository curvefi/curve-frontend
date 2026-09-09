import { requireLib } from '@evm-ui/features/connect-wallet'
import { rootKeys } from '@evm-ui/lib/model'
import { queryFactory } from '@ui/features/queries/factory'
import type { CreateLockParams, CreateLockQuery } from './create-lock.types'
import { createLockApprovalQueryValidationSuite } from './create-lock.validation'

export const { useQuery: useCreateLockIsApproved, fetchQuery: fetchCreateLockIsApproved } = queryFactory({
  queryKey: ({ chainId, userAddress, lockedAmount }: CreateLockParams) =>
    [...rootKeys.userChain({ chainId, userAddress }), 'boosting.isApproved', { lockedAmount }] as const,
  queryFn: async ({ lockedAmount }: CreateLockQuery) => await requireLib('curveApi').boosting.isApproved(lockedAmount),
  category: 'dao.user',
  validationSuite: createLockApprovalQueryValidationSuite,
})
