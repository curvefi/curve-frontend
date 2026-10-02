import { test } from 'vest'
import { getMarket, supportsCollateralRewards } from '@/llamalend/llama.utils'
import type { MarketTemplate } from '@/llamalend/llamalend.types'
import type { UserMarketParams } from '@evm-ui/queries/root-keys'
import { userMarketValidationSuite } from '@evm-ui/queries/validation/user-market-validation'
import { assert } from '@primitives/objects.utils'
import { createValidationSuite } from '@ui/lib/validation/lib'

export const requireCollateralRewards = (marketId: string | MarketTemplate) => {
  const market = getMarket(marketId)
  return assert(
    supportsCollateralRewards(market) && market.collateralRewards && market,
    'Market does not have collateral rewards',
  )
}

export const borrowClaimValidationSuite = createValidationSuite((params: UserMarketParams) => {
  userMarketValidationSuite.run(params)
  test('marketId', 'Market does not have collateral rewards', () => {
    requireCollateralRewards(assert(params.marketId, 'Market ID is required'))
  })
})
