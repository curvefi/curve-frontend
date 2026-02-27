import { queryFactory } from '@ui-kit/lib/model/query/factory'
import { marketIdValidationSuite } from '@ui-kit/lib/model/query/market-id-validation'
import { rootKeys } from '@ui-kit/lib/model/query/root-keys'
import type { MarketQuery, MarketParams } from '@ui-kit/lib/model/query/root-keys'
import { USE_API } from './market.constants'
import { getLendMarket } from './market.query-helpers'

/**
 * Fetches on chain rewards (direct token incentives or crv emissions) for supply vaults
 * */
export const { useQuery: useMarketVaultOnChainRewards, invalidate: invalidateMarketVaultOnChainRewards } = queryFactory(
  {
    queryKey: (params: MarketParams) => [...rootKeys.market(params), 'marketOnchainRewards', 'v2'] as const,
    queryFn: async ({ marketId }: MarketQuery) => ({
      rewardsApr: await getLendMarket(marketId).vault.rewardsApr(USE_API),
      crvRates: await getLendMarket(marketId).vault.crvApr(USE_API),
    }),
    category: 'detail',
    validationSuite: marketIdValidationSuite,
  },
)
