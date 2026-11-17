import {
  marketCollateralRewardsValidationSuite,
  requireCollateralRewards,
} from '@/llamalend/queries/validation/borrow-claim.validation'
import { requireVault } from '@/llamalend/queries/validation/supply.validation'
import type { MarketParams, MarketQuery } from '@evm-ui/queries/query-types'
import { marketIdValidationSuite } from '@evm-ui/queries/validation/market-id-validation'
import { queryFactory } from '@ui/features/queries/factory'

/** Whether the supply gauge stopped receiving CRV. On sidechains this is the status of the Ethereum root gauge.*/
export const { useQuery: useMarketSupplyGaugeKilled } = queryFactory({
  queryKey: ({ chainId, marketId }: MarketParams) => ({ name: 'supplyGaugeKilled', chainId, marketId }) as const,
  queryFn: async ({ marketId }: MarketQuery) => await requireVault(marketId).vault.isGaugeKilled(),
  category: 'llamalend.market',
  validationSuite: marketIdValidationSuite,
})

/** Whether the borrow gauge (AMM liquidity mining callback) stopped receiving CRV, including when it was detached. */
export const { useQuery: useMarketBorrowGaugeKilled } = queryFactory({
  queryKey: ({ chainId, marketId }: MarketParams) => ({ name: 'borrowGaugeKilled', chainId, marketId }) as const,
  queryFn: async ({ marketId }: MarketQuery) =>
    await requireCollateralRewards(marketId).collateralRewards.isCallbackKilled(),
  category: 'llamalend.market',
  validationSuite: marketCollateralRewardsValidationSuite,
})
