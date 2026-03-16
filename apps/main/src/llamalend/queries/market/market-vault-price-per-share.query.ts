import { queryFactory } from '@ui-kit/lib/model/query'
import { marketIdValidationSuite } from '@ui-kit/lib/model/query/market-id-validation'
import { rootKeys } from '@ui-kit/lib/model/query/root-keys'
import type { MarketQuery, MarketParams } from '@ui-kit/lib/model/query/root-keys'
import { getLendMarket } from './market.query-helpers'

export const { useQuery: useMarketVaultPricePerShare, invalidate: invalidateMarketVaultPricePerShare } = queryFactory({
  queryKey: (params: MarketParams) => [...rootKeys.market(params), 'previewRedeem', 'v1'] as const,
  queryFn: async ({ marketId }: MarketQuery) => {
    const market = getLendMarket(marketId)
    // Use convertToAssets instead of redeem preview: previewRedeem can revert when the vault
    // has no immediately available liquidity, while convertToAssets still returns 1 share's value.
    return await market.vault.convertToAssets(1)
  },
  category: 'llamalend.market',
  validationSuite: marketIdValidationSuite,
})
