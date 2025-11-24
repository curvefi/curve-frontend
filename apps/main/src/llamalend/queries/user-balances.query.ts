import { getLlamaMarket } from '@/llamalend/llama.utils'
import type { IChainId } from '@curvefi/api/lib/interfaces'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { createValidationSuite, type FieldsOf } from '@ui-kit/lib'
import { type PoolQuery, queryFactory, rootKeys, type UserQuery } from '@ui-kit/lib/model'
import { chainValidationGroup } from '@ui-kit/lib/model/query/chain-validation'
import { llamaApiValidationGroup } from '@ui-kit/lib/model/query/curve-api-validation'
import type { Decimal } from '@ui-kit/utils'

type UserBalancesQuery = UserQuery & PoolQuery<IChainId>
type UserBalancesParams = FieldsOf<UserBalancesQuery>

export const { useQuery: useUserBalances, invalidate: invalidateUserBalances } = queryFactory({
  queryKey: ({ chainId, poolId, userAddress }: UserBalancesParams) =>
    [...rootKeys.pool({ chainId, poolId }), 'wallet-balances', { userAddress }] as const,
  queryFn: async ({ poolId }: UserBalancesQuery) => {
    const market = getLlamaMarket(poolId)
    if (market instanceof LendMarketTemplate) {
      const { collateral, borrowed, vaultShares, gauge } = await market.wallet.balances()

      return {
        collateral: collateral as Decimal,
        borrowed: borrowed as Decimal,
        vaultShares: vaultShares as Decimal,
        gauge: gauge as Decimal,
      }
    } else {
      const { stablecoin, collateral } = await market.wallet.balances()

      return {
        collateral: collateral as Decimal,
        borrowed: stablecoin as Decimal,
      }
    }
  },
  staleTime: '1m',
  validationSuite: createValidationSuite(({ chainId }: UserBalancesParams) => {
    chainValidationGroup({ chainId })
    llamaApiValidationGroup({ chainId })
  }),
})
