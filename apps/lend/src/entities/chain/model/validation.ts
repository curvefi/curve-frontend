import type { ChainQueryParams } from '../types'
import { createValidationSuite } from '@/shared/lib/validation'
import { enforce, group, test } from 'vest'
import useStore from '@/store/useStore'

export const chainValidationGroup = ({ chainId }: ChainQueryParams) =>
  group('chainValidation', () => {
    test('chainId', () => {
      enforce(chainId).message('Chain ID is required').isNotEmpty().message('Invalid chain ID').isValidChainId()
      const { api, isLoadingApi } = useStore.getState()
      enforce(isLoadingApi).message('API should be loaded').equals(chainId)
      enforce(api?.chainId).message('Chain ID should be loaded').equals(chainId)
    })
  })

export const chainValidationSuite = createValidationSuite(chainValidationGroup)
