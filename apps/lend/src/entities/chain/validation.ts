import { createValidationSuite } from '@/shared/lib/validation'
import { enforce, group, test } from 'vest'
import { ChainParams } from '@/shared/model/query'
import useStore from '@/store/useStore'

export const chainValidationGroup = ({ chainId }: ChainParams) =>
  group('chainValidation', () => {
    test('chainId', () => {
      enforce(chainId).message('Chain ID is required').isNotEmpty().message('Invalid chain ID').isValidChainId()
    })
  })

export const chainValidationSuite = createValidationSuite(chainValidationGroup)

export const apiValidationGroup = (data: ChainParams<ChainId>) =>
  group('apiValidation', () => {
    test('api', () => {
      const { api } = useStore.getState()
      enforce(api?.chainId).message('Chain ID should be loaded').equals(data.chainId)
    })
  })
