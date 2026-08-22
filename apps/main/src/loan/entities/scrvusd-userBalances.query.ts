import { requireLib } from '@evm-ui/features/connect-wallet'
import { queryFactory, rootKeys, type UserChainParams, type UserChainQuery } from '@evm-ui/lib/model/query'
import type { Decimal } from '@primitives/decimal.utils'
import { scrvUsdUserValidationSuite } from './scrvusd.validation'

export const { useQuery: useScrvUsdUserBalances, invalidate: invalidateScrvUsdUserBalances } = queryFactory({
  queryKey: ({ chainId, userAddress }: UserChainParams) =>
    [...rootKeys.userChain({ chainId, userAddress }), 'st_crvUSD.userBalances'] as const,
  queryFn: async ({ userAddress }: UserChainQuery) => {
    const { crvUSD, st_crvUSD } = await requireLib('llamaApi').st_crvUSD.userBalances(userAddress)
    return { crvUSD: crvUSD as Decimal, scrvUSD: st_crvUSD as Decimal }
  },
  validationSuite: scrvUsdUserValidationSuite,
  category: 'savings.user',
})
