import { enforce, group, test } from '@ui-kit/lib/validation/lib'
import { ChainNameParams } from './root-keys'

export const chainNameValidationGroup = ({ blockchainId }: ChainNameParams) =>
  group('chainNameValidation', () => {
    test('blockchainId', () => {
      enforce(blockchainId)
        .message('Chain name is required')
        .isNotEmpty()
        .message('Invalid chain name')
        .isValidChainName()
    })
  })
