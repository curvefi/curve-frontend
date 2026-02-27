import { requireLib } from '@ui-kit/features/connect-wallet'
import { createValidationSuite } from '@ui-kit/lib'
import { queryFactory, type UserParams, type UserQuery } from '@ui-kit/lib/model/query'
import { llamaApiValidationGroup } from '@ui-kit/lib/model/query/curve-api-validation'
import { userAddressValidationGroup } from '@ui-kit/lib/model/query/user-address-validation'
import { Chain } from '@ui-kit/utils'

export type ScrvUsdUserBalances = { crvUSD: string; scrvUSD: string }

async function _fetchSavingsUserBalances({ userAddress }: UserQuery): Promise<ScrvUsdUserBalances | null> {
  const { crvUSD, st_crvUSD } = await requireLib('llamaApi').st_crvUSD.userBalances(userAddress)
  return {
    crvUSD: crvUSD === '0.0' ? '0' : crvUSD,
    scrvUSD: st_crvUSD === '0.0' ? '0' : st_crvUSD,
  }
}

export const { useQuery: useScrvUsdUserBalances, invalidate: invalidateScrvUsdUserBalances } = queryFactory({
  queryKey: ({ userAddress }: UserParams) => ['useScrvUsdUserBalances', { userAddress }] as const,
  queryFn: _fetchSavingsUserBalances,
  validationSuite: createValidationSuite(({ userAddress }: UserParams) => {
    userAddressValidationGroup({ userAddress })
    llamaApiValidationGroup({ chainId: Chain.Ethereum })
  }),
  category: 'user',
})
