import { test } from 'vest'
import { getControllerAddress, getMarket, isLeverageAllowed } from '@/llamalend/llama.utils'
import type { MarketParams } from '@evm-ui/queries/query-types'
import { marketIdValidationSuite } from '@evm-ui/queries/validation/market-id-validation'
import { assert } from '@primitives/objects.utils'
import { createValidationSuite } from '@ui/lib/validation/lib'

/** Requires a market where leverage can be opened */
export const marketLeverageValidationSuite = createValidationSuite(({ chainId, marketId }: MarketParams) => {
  marketIdValidationSuite.run({ chainId, marketId })
  test('marketId', 'Market does not allow leverage', () => {
    const market = getMarket(assert(marketId, 'Market ID is required'))
    assert(isLeverageAllowed(chainId, getControllerAddress(market)), 'Market does not allow leverage')
  })
})
