import {
  marketCollateralRewardsValidationSuite,
  requireCollateralRewards,
} from '@/llamalend/queries/validation/borrow-claim.validation'
import { marketVaultValidationSuite, requireVault } from '@/llamalend/queries/validation/supply.validation'
import type { MarketParams, MarketQuery } from '@evm-ui/queries/query-types'
import { queryFactory } from '@ui/features/queries/factory'
import { fetchGaugeStatus } from '@ui/lib/gauge-status'

/** Whether the supply gauge receives CRV. On sidechains this is the status of the Ethereum root gauge. */
export const { useQuery: useMarketSupplyGaugeStatus } = queryFactory({
  queryKey: ({ chainId, marketId }: MarketParams) => ({ name: 'supplyGaugeStatus', chainId, marketId }) as const,
  queryFn: async ({ marketId }: MarketQuery) => {
    const { vault } = requireVault(marketId)
    return await fetchGaugeStatus({
      isRegistered: () => vault.isGaugeRegistered(),
      isKilled: () => vault.isGaugeKilled(),
    })
  },
  category: 'llamalend.market',
  validationSuite: marketVaultValidationSuite,
})

/** Whether the borrow gauge (AMM liquidity mining callback) receives CRV, `inactive` when it was killed or detached. */
export const { useQuery: useMarketBorrowGaugeStatus } = queryFactory({
  queryKey: ({ chainId, marketId }: MarketParams) => ({ name: 'borrowGaugeStatus', chainId, marketId }) as const,
  queryFn: async ({ marketId }: MarketQuery) => {
    const { collateralRewards } = requireCollateralRewards(marketId)
    return await fetchGaugeStatus({
      isRegistered: () => collateralRewards.isCallbackRegistered(),
      isKilled: () => collateralRewards.isCallbackKilled(),
    })
  },
  category: 'llamalend.market',
  validationSuite: marketCollateralRewardsValidationSuite,
})
