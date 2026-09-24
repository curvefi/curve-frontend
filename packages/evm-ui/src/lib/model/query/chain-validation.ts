import { group, test } from 'vest'
import { ChainParams } from '@evm-ui/queries/root-keys'
import { enforce } from '@ui/lib/validation/enforce-extension'

export const chainValidationGroup = ({ chainId }: ChainParams) =>
  group('chainValidation', () => {
    test('chainId', () => {
      enforce(chainId).message('Chain ID is required').isNotEmpty().message('Invalid chain ID').isNumber()
    })
  })
