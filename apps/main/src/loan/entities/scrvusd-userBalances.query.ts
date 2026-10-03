import { requireLib } from '@evm-ui/features/connect-wallet'
import type { UserChainParams, UserChainQuery } from '@evm-ui/queries/query-types'
import type { Decimal } from '@primitives/decimal.utils'
import { queryFactory } from '@ui/features/queries/factory'
import { scrvUsdUserValidationSuite } from './scrvusd.validation'

export const { useQuery: useScrvUsdUserBalances, invalidate: invalidateScrvUsdUserBalances } = queryFactory({
  queryKey: ({ chainId, userAddress }: UserChainParams) => ({ name: 'st_crvUSD.userBalances', chainId, userAddress }),
  queryFn: async ({ userAddress }: UserChainQuery) => {
    const { crvUSD, st_crvUSD } = await requireLib('llamaApi').st_crvUSD.userBalances(userAddress)
    return { crvUSD: crvUSD as Decimal, scrvUSD: st_crvUSD as Decimal }
  },
  validationSuite: scrvUsdUserValidationSuite,
  category: 'savings.user',
})
