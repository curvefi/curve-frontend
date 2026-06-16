import type { Decimal } from '@primitives/decimal.utils'
import { requireLib } from '@ui-kit/features/connect-wallet'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import type { ScrvUsdUserParams, ScrvUsdUserQuery } from './scrvusd.validation'
import { scrvUsdUserValidationSuite } from './scrvusd.validation'

export const {
  useQuery: useScrvUsdDepositAllowance,
  fetchQuery: fetchScrvUsdDepositAllowance,
  invalidate: invalidateScrvUsdDepositAllowance,
} = queryFactory({
  queryKey: ({ chainId, userAddress }: ScrvUsdUserParams) =>
    [...rootKeys.userChain({ chainId, userAddress }), 'st_crvUSD.depositAllowance'] as const,
  queryFn: async (_: ScrvUsdUserQuery) => {
    const [allowance] = await requireLib('llamaApi').st_crvUSD.depositAllowance()
    return allowance as Decimal
  },
  category: 'savings.user',
  validationSuite: scrvUsdUserValidationSuite,
})
