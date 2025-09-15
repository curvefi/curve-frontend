import type { IChainId } from '@curvefi/api/lib/interfaces'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { createValidationSuite, type FieldsOf } from '@ui-kit/lib'
import { type PoolQuery, queryFactory, rootKeys, type UserQuery } from '@ui-kit/lib/model'
import { chainValidationGroup } from '@ui-kit/lib/model/query/chain-validation'
import { llamaApiValidationGroup } from '@ui-kit/lib/model/query/curve-api-validation'
import { getLlamaMarket } from '../llama.util'

type UserBalancesQuery = UserQuery & PoolQuery<IChainId>
type UserBalancesParams = FieldsOf<UserBalancesQuery>

export const { useQuery: useUserBalances, queryKey: userBalancesQueryKey } = queryFactory({
  queryKey: ({ chainId, poolId, userAddress }: UserBalancesParams) =>
    [...rootKeys.pool({ chainId, poolId }), 'user-balances', { userAddress }] as const,
  queryFn: async ({ poolId }: UserBalancesQuery) => {
    const market = getLlamaMarket(poolId)
    if (market instanceof LendMarketTemplate) {
      const { collateral, borrowed, vaultShares, gauge } = await market.wallet.balances()
      return { collateral: +collateral, borrowed: +borrowed, vaultShares: +vaultShares, gauge: +gauge }
    } else {
      const { stablecoin, collateral } = await market.wallet.balances()
      return { collateral: +collateral, borrowed: +stablecoin }
    }
  },
  staleTime: '1m',
  validationSuite: createValidationSuite(({ chainId }: UserBalancesParams) => {
    chainValidationGroup({ chainId })
    llamaApiValidationGroup({ chainId })
  }),
})
