import { requireLib } from '@ui-kit/features/connect-wallet'
import { queryFactory } from '@ui-kit/lib/model/query'
import { marketIdValidationSuite } from '@ui-kit/lib/model/query/market-id-validation'
import { rootKeys } from '@ui-kit/lib/model/query/root-keys'
import type { MarketQuery, MarketParams } from '@ui-kit/lib/model/query/root-keys'

const getLendMarket = (marketId: string) => requireLib('llamaApi').getLendMarket(marketId)

export const { useQuery: useMarketVaultPricePerShare, invalidate: invalidateMarketVaultPricePerShare } = queryFactory({
  queryKey: (params: MarketParams) => [...rootKeys.market(params), 'marketVaultPricePerShare', 'v1'] as const,
  queryFn: async ({ marketId }: MarketQuery) => {
    const market = getLendMarket(marketId)
    return await market.vault.previewRedeem(1)
  },
  refetchInterval: '1m',
  validationSuite: marketIdValidationSuite,
})
