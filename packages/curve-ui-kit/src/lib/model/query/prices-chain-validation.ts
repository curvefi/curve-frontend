import { enforce, group, test } from 'vest'
import { createValidationSuite } from '@ui-kit/lib'
import { ChainNameParams } from './root-keys'

export const pricesApiChainNameValidationGroup = ({ blockchainId }: ChainNameParams) =>
  group('chainNameValidation', () => {
    test('blockchainId', () => {
      enforce(blockchainId)
        .message('Chain name is required')
        .isNotEmpty()
        .message('Invalid chain name')
        .isValidPricesApiChain()
    })
  })

export const pricesApiChainValidationSuite = createValidationSuite((params: ChainNameParams) => {
  pricesApiChainNameValidationGroup(params)
})
