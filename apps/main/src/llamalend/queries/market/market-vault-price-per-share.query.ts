import { queryFactory } from '@ui-kit/lib/model/query'
import { marketIdValidationSuite } from '@ui-kit/lib/model/query/market-id-validation'
import { rootKeys } from '@ui-kit/lib/model/query/root-keys'
import type { MarketQuery, MarketParams } from '@ui-kit/lib/model/query/root-keys'
import { getLendMarket } from './market.query-helpers'

export const { useQuery: useMarketVaultPricePerShare, invalidate: invalidateMarketVaultPricePerShare } = queryFactory({
  queryKey: (params: MarketParams) => [...rootKeys.market(params), 'marketVaultPricePerShare', 'v1'] as const,
  queryFn: async ({ marketId }: MarketQuery) => {
    const market = getLendMarket(marketId)
    return await market.vault.previewRedeem(1)
  },
  category: 'detail',
  validationSuite: marketIdValidationSuite,
})
