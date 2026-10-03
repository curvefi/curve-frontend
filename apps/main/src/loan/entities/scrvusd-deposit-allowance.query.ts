import { requireLib } from '@evm-ui/features/connect-wallet'
import type { Decimal } from '@primitives/decimal.utils'
import { queryFactory } from '@ui/features/queries/factory'
import type { ScrvUsdUserParams, ScrvUsdUserQuery } from './scrvusd.validation'
import { scrvUsdUserValidationSuite } from './scrvusd.validation'

export const { invalidate: invalidateScrvUsdDepositAllowance } = queryFactory({
  queryKey: ({ chainId, userAddress }: ScrvUsdUserParams) => ({
    name: 'st_crvUSD.depositAllowance',
    chainId,
    userAddress,
  }),
  queryFn: async (_: ScrvUsdUserQuery) => {
    const [allowance] = await requireLib('llamaApi').st_crvUSD.depositAllowance()
    return allowance as Decimal
  },
  category: 'savings.user',
  validationSuite: scrvUsdUserValidationSuite,
})
