import { ChainId } from '@/lend/types/lend.types'
import { requireLib } from '@ui-kit/features/connect-wallet'
import { FieldsOf } from '@ui-kit/lib'
import type { ChainQuery } from '@ui-kit/lib/model/query'
import { queryFactory } from '@ui-kit/lib/model/query'
import { llamaApiValidationSuite } from '@ui-kit/lib/model/query/curve-api-validation'

type UserMarketBalancesQuery = ChainQuery<ChainId> & { marketId: string }
type UserMarketBalancesParams = FieldsOf<UserMarketBalancesQuery>
type UserMarketBalances = {
  collateral: string
  borrowed: string
  vaultShares: string
  vaultSharesConverted: string
  gauge: string
}

const _fetchUserMarketBalances = async ({ marketId }: UserMarketBalancesQuery): Promise<UserMarketBalances> => {
  const api = requireLib('llamaApi')
  const market = api.getLendMarket(marketId)
  const balances = await market.wallet.balances()
  const vaultSharesConverted =
    +balances.vaultShares > 0 ? await market.vault.convertToAssets(balances.vaultShares) : '0'

  return {
    ...balances,
    vaultSharesConverted,
  }
}

export const { useQuery: useUserMarketBalances, invalidate: invalidateUserMarketBalances } = queryFactory({
  queryKey: (params: UserMarketBalancesParams) =>
    ['userMarketBalances', { chainId: params.chainId }, { marketId: params.marketId }] as const,
  queryFn: _fetchUserMarketBalances,
  refetchInterval: '1m',
  validationSuite: llamaApiValidationSuite,
})
