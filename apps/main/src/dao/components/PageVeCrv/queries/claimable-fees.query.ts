import { requireLib } from '@evm-ui/features/connect-wallet'
import { rootKeys } from '@evm-ui/queries/root-keys'
import type { Decimal } from '@primitives/decimal.utils'
import { queryFactory } from '@ui/features/queries/factory'
import type { ClaimFeesParams, ClaimFeesQuery, ClaimFeesToken } from './claim-fees.types'
import { claimFeesValidationSuite } from './claim-fees.validation'

export const { useQuery: useClaimableFees, invalidate: invalidateClaimableFees } = queryFactory({
  queryKey: ({ chainId, userAddress, token }: ClaimFeesParams) =>
    [...rootKeys.userChain({ chainId, userAddress }), 'boosting.claimableFees', { token }] as const,
  queryFn: async ({ userAddress, token }: ClaimFeesQuery) => {
    const { boosting } = requireLib('curveApi')
    const claimableMethods = { '3CRV': boosting.claimableFees, crvUSD: boosting.claimableFeesCrvUSD } satisfies Record<
      ClaimFeesToken,
      unknown
    >
    return (await claimableMethods[token](userAddress)) as Decimal
  },
  category: 'dao.user',
  validationSuite: claimFeesValidationSuite,
})
