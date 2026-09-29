import { requireLib } from '@evm-ui/features/connect-wallet'
import { rootKeys } from '@evm-ui/queries/root-keys'
import type { Decimal } from '@primitives/decimal.utils'
import { queryFactory } from '@ui/features/queries/factory'
import { CLAIM_FEES_TOKENS, type ClaimFeesParams, type ClaimFeesQuery } from './claim-fees.types'
import { claimFeesValidationSuite } from './claim-fees.validation'

export const { useQuery: useClaimableFees, invalidate: invalidateClaimableFees } = queryFactory({
  queryKey: ({ chainId, userAddress, token }: ClaimFeesParams) => ({
    name: 'boosting.claimableFees',
    ...rootKeys.userChain({ chainId, userAddress }),
    token,
  }),
  queryFn: async ({ userAddress, token }: ClaimFeesQuery): Promise<Decimal> => {
    const { boosting } = requireLib('curveApi')
    const claimableMethods = {
      [CLAIM_FEES_TOKENS.ThreeCRV]: boosting.claimableFees,
      [CLAIM_FEES_TOKENS.crvUSD]: boosting.claimableFeesCrvUSD,
    }
    return (await claimableMethods[token](userAddress)) as Decimal
  },
  category: 'dao.user',
  validationSuite: claimFeesValidationSuite,
})
