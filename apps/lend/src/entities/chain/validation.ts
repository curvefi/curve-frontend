import { createValidationSuite } from '@ui-kit/lib/validation'
import { enforce, group, test } from 'vest'
import { ChainParams } from '@ui-kit/lib/model/query'
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
