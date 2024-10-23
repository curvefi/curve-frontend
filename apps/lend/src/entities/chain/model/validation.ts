import { createValidationSuite } from '@/shared/lib/validation'
import { enforce, group, test } from 'vest'
import useStore from '@/store/useStore'
import { ChainParams } from '@/shared/model/query'

export const chainValidationGroup = ({ chainId }: ChainParams) =>
  group('chainValidation', () => {
    test('chainId', () => {
      enforce(chainId).message('Chain ID is required').isNotEmpty().message('Invalid chain ID').isValidChainId()
      const { api, isLoadingApi } = useStore.getState()
      enforce(isLoadingApi).message('API should be loaded').equals(false)
      enforce(api?.chainId).message('Chain ID should be loaded').equals(chainId)
    })
  })

export const chainValidationSuite = createValidationSuite(chainValidationGroup)
