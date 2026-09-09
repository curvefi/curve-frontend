import { group, test } from 'vest'
import { enforce } from '@ui/lib/validation/enforce-extension'
import { createValidationSuite } from '@ui/lib/validation/lib'
import { chainValidationGroup } from './chain-validation'
import { llamaApiValidationGroup } from './curve-api-validation'
import { MarketParams } from './root-keys'

export const marketIdValidationGroup = ({ marketId }: Pick<MarketParams, 'marketId'>) =>
  group('marketIdValidation', () => {
    test('marketId', () => {
      enforce(marketId).message('Market ID is required').isNotEmpty()
    })
  })

export const marketIdValidationSuite = createValidationSuite(({ marketId, chainId }: MarketParams) => {
  chainValidationGroup({ chainId })
  llamaApiValidationGroup({ chainId })
  marketIdValidationGroup({ marketId })
})
