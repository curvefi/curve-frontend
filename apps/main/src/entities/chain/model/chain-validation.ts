import { enforce, group, test } from 'vest'
import { createValidationSuite } from '@/shared/lib/validation'
import { ChainParams } from '@/shared/model/query'

export const chainValidationGroup = ({ chainId }: ChainParams) =>
  group('chainValidation', () => {
    test('chainId', () => {
      enforce(chainId).message('Chain ID is required').isNotEmpty().message('Invalid chain ID').isValidChainId()
    })
  })

export const chainValidationSuite = createValidationSuite(chainValidationGroup)
