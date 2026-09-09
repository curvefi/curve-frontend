import { group, test } from 'vest'
import { enforce } from '@evm-ui/lib/validation/enforce-extension'
import { createValidationSuite } from '@evm-ui/lib/validation/lib'
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
