import { test } from 'vest'
import { getMarket, isLendMarket } from '@/llamalend/llama.utils'
import type { MarketTemplate } from '@/llamalend/llamalend.types'
import type { MarketParams, UserMarketParams } from '@evm-ui/queries/query-types'
import { evmAddressValidationGroup } from '@evm-ui/queries/validation/evm-address-validation'
import { marketIdValidationSuite } from '@evm-ui/queries/validation/market-id-validation'
import { assert } from '@primitives/objects.utils'
import { createValidationSuite } from '@ui/lib/validation/lib'

/** Requires a market exposing the llamalend.js collateral rewards API. */
export const requireCollateralRewards = (marketId: string | MarketTemplate) => {
  const market = getMarket(marketId)
  return assert(isLendMarket(market) && market.collateralRewards && market, 'Market does not have collateral rewards')
}

export const marketCollateralRewardsValidationSuite = createValidationSuite((params: MarketParams) => {
  marketIdValidationSuite.run(params)
  test('marketId', 'Market does not have collateral rewards', () => {
    requireCollateralRewards(assert(params.marketId, 'Market ID is required'))
  })
})

export const borrowClaimValidationSuite = createValidationSuite((params: UserMarketParams) => {
  marketCollateralRewardsValidationSuite.run(params)
  evmAddressValidationGroup({ evmAddress: params.userAddress })
})
