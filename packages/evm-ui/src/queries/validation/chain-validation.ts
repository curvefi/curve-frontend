import { group, test } from 'vest'
import type { ChainParams } from '@evm-ui/queries/query-types'
import { enforce } from '@ui/lib/validation/enforce-extension'

export const chainValidationGroup = ({ chainId }: ChainParams) =>
  group('chainValidation', () => {
    test('chainId', () => {
      enforce(chainId).message('Chain ID is required').isNotEmpty().message('Invalid chain ID').isNumber()
    })
  })
