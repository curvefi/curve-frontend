import type { ChainQueryParams } from '@/entities/chain/types'
import { createValidationSuite } from '@/shared/lib/validation'
import { enforce, group, test } from 'vest'
import useStore from '@/store/useStore'

export const chainValidationGroup = ({ chainId }: ChainQueryParams) =>
  group('chainValidation', () => {
    test('chainId', () => {
      enforce(chainId).message('Chain ID is required').isNotEmpty().message('Invalid chain ID').isValidChainId();
      enforce(useStore.getState().api?.chainId).message('Chain ID should be loaded').equals(chainId)
    })
  })

export const chainValidationSuite = createValidationSuite(chainValidationGroup)
