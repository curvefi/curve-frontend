import { zeroAddress } from 'viem'
import {
  marketCollateralRewardsValidationSuite,
  requireCollateralRewards,
} from '@/llamalend/queries/validation/borrow-claim.validation'
import type { MarketParams, MarketQuery } from '@evm-ui/queries/query-types'
import type { Address } from '@primitives/address.utils'
import { queryFactory } from '@ui/features/queries/factory'

/** Borrow gauge of a lend market, i.e. the AMM liquidity mining callback rewarding collateral. */
export const { useQuery: useMarketBorrowGaugeAddress } = queryFactory({
  queryKey: ({ chainId, marketId }: MarketParams) => ({ name: 'borrowGaugeAddress', chainId, marketId }) as const,
  queryFn: async ({ marketId }: MarketQuery): Promise<Address | null> => {
    const address = (await requireCollateralRewards(marketId).collateralRewards.callbackAddress()) as Address
    return address === zeroAddress ? null : address
  },
  category: 'llamalend.marketParams',
  validationSuite: marketCollateralRewardsValidationSuite,
})
