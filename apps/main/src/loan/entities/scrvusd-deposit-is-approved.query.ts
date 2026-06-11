import { requireLib } from '@ui-kit/features/connect-wallet'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import type { ScrvUsdDepositParams, ScrvUsdDepositQuery } from './scrvusd.validation'
import { scrvUsdDepositValidationSuite } from './scrvusd.validation'

export const {
  useQuery: useScrvUsdDepositIsApproved,
  fetchQuery: fetchScrvUsdDepositIsApproved,
  invalidate: invalidateScrvUsdDepositIsApproved,
} = queryFactory({
  queryKey: ({ chainId, userAddress, depositAmount }: ScrvUsdDepositParams) =>
    [...rootKeys.userChain({ chainId, userAddress }), 'st_crvUSD.depositIsApproved', { depositAmount }] as const,
  queryFn: async ({ depositAmount }: ScrvUsdDepositQuery) =>
    await requireLib('llamaApi').st_crvUSD.depositIsApproved(depositAmount),
  category: 'savings.user',
  validationSuite: scrvUsdDepositValidationSuite,
})
