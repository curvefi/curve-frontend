import { zeroAddress } from 'viem'
import { requireLib } from '@evm-ui/features/connect-wallet'
import { queryFactory } from '@evm-ui/lib/model/query/factory'
import { marketIdValidationSuite } from '@evm-ui/lib/model/query/market-id-validation'
import { rootKeys } from '@evm-ui/lib/model/query/root-keys'
import type { MarketQuery, MarketParams } from '@evm-ui/lib/model/query/root-keys'
import { type Range } from '@evm-ui/types/util'
import { USE_API } from './market.constants'

/**
 * Fetches on chain rewards (direct token incentives or crv emissions) for supply vaults
 * */
export const { useQuery: useMarketVaultOnChainRewards } = queryFactory({
  queryKey: (params: MarketParams) => [...rootKeys.market(params), 'marketOnchainRewards', 'v3'] as const,
  queryFn: async ({ marketId }: MarketQuery) => {
    const { vault, addresses } = requireLib('llamaApi').getLendMarket(marketId)
    const [rewards, crvRates] = await Promise.all([
      vault.rewardsApr(USE_API),
      addresses.gauge == zeroAddress ? [0, 0] : vault.crvApr(USE_API),
    ])
    const rewardsApr = rewards.map(({ apy, ...reward }) => ({ ...reward, apr: apy }))
    return { rewardsApr, crvRates: crvRates as Range<number> }
  },
  category: 'llamalend.market',
  validationSuite: marketIdValidationSuite,
})
