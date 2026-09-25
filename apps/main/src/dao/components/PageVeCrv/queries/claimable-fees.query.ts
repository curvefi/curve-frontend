import { requireLib } from '@evm-ui/features/connect-wallet'
import { rootKeys } from '@evm-ui/queries/root-keys'
import type { Decimal } from '@primitives/decimal.utils'
import { queryFactory } from '@ui/features/queries/factory'
import type { ClaimFeesParams, ClaimFeesQuery } from './claim-fees.types'
import { claimFeesValidationSuite } from './claim-fees.validation'

export const { useQuery: useClaimableFees, invalidate: invalidateClaimableFees } = queryFactory({
  queryKey: ({ chainId, userAddress, token }: ClaimFeesParams) =>
    [...rootKeys.userChain({ chainId, userAddress }), 'boosting.claimableFees', { token }] as const,
  queryFn: async ({ userAddress, token }: ClaimFeesQuery): Promise<Decimal> => {
    const { boosting } = requireLib('curveApi')
    return (await (token === '3CRV'
      ? boosting.claimableFees(userAddress)
      : boosting.claimableFeesCrvUSD(userAddress))) as Decimal
  },
  category: 'dao.user',
  validationSuite: claimFeesValidationSuite,
})
