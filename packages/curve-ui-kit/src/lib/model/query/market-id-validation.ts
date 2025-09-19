import { enforce, group, test } from 'vest'
import { createValidationSuite } from '@ui-kit/lib/validation'
import { chainValidationGroup } from './chain-validation'
import { llamaApiValidationGroup } from './curve-api-validation'
import { ChainParams, MarketParams } from './root-keys'

export const marketIdValidationGroup = ({ marketId }: MarketParams) =>
  group('marketIdValidation', () => {
    test('marketId', () => {
      enforce(marketId).message('Market ID is required').isNotEmpty()
    })
  })

export const marketIdValidationSuite = createValidationSuite(
  <TChainId extends number>(params: ChainParams<TChainId>) => {
    chainValidationGroup(params)
    llamaApiValidationGroup(params)
    marketIdValidationGroup(params)
  },
)
