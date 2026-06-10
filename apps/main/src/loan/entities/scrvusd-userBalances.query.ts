import type { Decimal } from '@primitives/decimal.utils'
import { requireLib } from '@ui-kit/features/connect-wallet'
import { queryFactory, rootKeys, type UserChainParams, type UserChainQuery } from '@ui-kit/lib/model/query'
import { scrvUsdUserValidationSuite } from './scrvusd.validation'

export type ScrvUsdUserBalances = { crvUSD: Decimal; scrvUSD: Decimal }

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
