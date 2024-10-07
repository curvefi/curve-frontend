import type { ChainQueryParams } from '@/entities/chain/types'
import { createValidationSuite } from '@/shared/lib/validation'
import { enforce, group, test } from 'vest'

export const chainValidationGroup = ({ chainId }: ChainQueryParams) =>
  group('chainValidation', () => {
    test('chainId', () => {
      enforce(chainId).message('Chain ID is required').isNotEmpty().message('Invalid chain ID').isValidChainId()
    })
  })

export const chainValidationSuite = createValidationSuite(chainValidationGroup)
