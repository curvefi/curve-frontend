import { queryFactory } from '@ui-kit/lib/model/query'
import { marketIdValidationSuite } from '@ui-kit/lib/model/query/market-id-validation'
import type { MarketParams, MarketQuery } from '@ui-kit/lib/model/query/root-keys'
import { rootKeys } from '@ui-kit/lib/model/query/root-keys'
import { getLendVault } from './market.query-helpers'

export const { useQuery: useMarketVaultPricePerShare, invalidate: invalidateMarketVaultPricePerShare } = queryFactory({
  queryKey: (params: MarketParams) => [...rootKeys.market(params), 'previewRedeem', 'v1'] as const,
  queryFn: async (
    { marketId }: MarketQuery, // Use convertToAssets instead of redeem preview: previewRedeem can revert when the vault
  ) =>
    // has no immediately available liquidity, while convertToAssets still returns 1 share's value.
    await getLendVault(marketId).convertToAssets(1),
  category: 'llamalend.market',
  validationSuite: marketIdValidationSuite,
})
