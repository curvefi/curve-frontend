import { enforce, group, test } from '@ui-kit/lib/validation/lib'
import { ChainParams } from './root-keys'

export const chainValidationGroup = ({ chainId }: ChainParams) =>
  group('chainValidation', () => {
    test('chainId', () => {
      enforce(chainId).message('Chain ID is required').isNotEmpty().message('Invalid chain ID').isValidChainId()
    })
  })
