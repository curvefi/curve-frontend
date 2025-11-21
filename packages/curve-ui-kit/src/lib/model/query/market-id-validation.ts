import { enforce, group, test } from 'vest'
import { createValidationSuite } from '@ui-kit/lib/validation'
import { chainValidationGroup } from './chain-validation'
import { llamaApiValidationGroup } from './curve-api-validation'
import { MarketParams } from './root-keys'

export const marketIdValidationGroup = ({ marketId }: Pick<MarketParams, 'marketId'>) =>
  group('marketIdValidation', () => {
    test('marketId', () => {
      enforce(marketId).message('Market ID is required').isNotEmpty()
    })
  })

export const marketIdValidationSuite = createValidationSuite((params: MarketParams) => {
  chainValidationGroup(params)
  llamaApiValidationGroup(params)
  marketIdValidationGroup(params)
})
