import type { ChainQueryParams } from '@/entities/chain/types'
import { createValidationSuite } from '@/shared/validation'
import { enforce, group, test } from 'vest'

export const chainValidationGroup = ({ chainId }: ChainQueryParams) =>
  group('chainValidation', () => {
    test('chainId', 'Invalid chain ID', () => {
      enforce(chainId).isNotEmpty().isValidChainId()
    })
  })

export const chainValidationSuite = createValidationSuite(chainValidationGroup)
