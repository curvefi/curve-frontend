import { group, test } from 'vest'
import { enforce } from '@ui/lib/validation/enforce-extension'
import { ChainParams } from './root-keys'

export const chainValidationGroup = ({ chainId }: ChainParams) =>
  group('chainValidation', () => {
    test('chainId', () => {
      enforce(chainId).message('Chain ID is required').isNotEmpty().message('Invalid chain ID').isNumber()
    })
  })
