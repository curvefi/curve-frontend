import { requireLib } from '@ui-kit/features/connect-wallet'
import { queryFactory } from '@ui-kit/lib/model/query'
import { marketIdValidationSuite } from '@ui-kit/lib/model/query/market-id-validation'
import { rootKeys } from '@ui-kit/lib/model/query/root-keys'
import type { MarketQuery, MarketParams } from '@ui-kit/lib/model/query/root-keys'

type UserMarketBalances = {
  collateral: string
  borrowed: string
  vaultShares: string
  vaultSharesConverted: string
  gauge: string
}

const _fetchUserMarketBalances = async ({ marketId }: MarketQuery): Promise<UserMarketBalances> => {
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
  queryKey: (params: MarketParams) => [...rootKeys.market(params), 'userMarketBalances', 'v1'] as const,
  queryFn: _fetchUserMarketBalances,
  refetchInterval: '1m',
  validationSuite: marketIdValidationSuite,
})
