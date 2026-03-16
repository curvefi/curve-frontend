import { invalidateMarketBandsBalances } from '@/llamalend/features/bands-chart/queries/market-bands-balances.query'
import { invalidateMarketUserBandsBalances } from '@/llamalend/features/bands-chart/queries/market-user-bands-balances.query'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { UserMarketParams } from '@ui-kit/lib/model'

export const invalidateAllBandsChartQueries = ({ chainId, marketId, userAddress }: UserMarketParams<IChainId>) =>
  Promise.all([
    invalidateMarketBandsBalances({ chainId, marketId }),
    invalidateMarketUserBandsBalances({ chainId, marketId, userAddress }),
  ])
