import { zeroAddress } from 'viem'
import { requireLib } from '@ui-kit/features/connect-wallet'
import { queryFactory } from '@ui-kit/lib/model/query/factory'
import { marketIdValidationSuite } from '@ui-kit/lib/model/query/market-id-validation'
import { rootKeys } from '@ui-kit/lib/model/query/root-keys'
import type { MarketQuery, MarketParams } from '@ui-kit/lib/model/query/root-keys'
import { USE_API } from './market.constants'

/**
 * Fetches on chain rewards (direct token incentives or crv emissions) for supply vaults
 * */
export const { useQuery: useMarketVaultOnChainRewards, invalidate: invalidateMarketVaultOnChainRewards } = queryFactory(
  {
    queryKey: (params: MarketParams) => [...rootKeys.market(params), 'marketOnchainRewards', 'v2'] as const,
    queryFn: async ({ marketId }: MarketQuery) => {
      const { vault, addresses } = requireLib('llamaApi').getLendMarket(marketId)
      const [rewardsApr, crvRates] = await Promise.all([
        vault.rewardsApr(USE_API),
        addresses.gauge == zeroAddress ? [0, 0] : vault.crvApr(USE_API),
      ])
      return { rewardsApr, crvRates }
    },
    category: 'llamalend.market',
    validationSuite: marketIdValidationSuite,
  },
)
