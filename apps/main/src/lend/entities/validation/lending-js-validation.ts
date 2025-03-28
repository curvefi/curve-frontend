import { enforce, group, test } from 'vest'
import useStore from '@/lend/store/useStore'
import type { ChainId } from '@/lend/types/lend.types'
import type { ChainParams } from '@ui-kit/lib/model/query'
import { createValidationSuite } from '@ui-kit/lib/validation'

export const chainValidationGroup = ({ chainId }: ChainParams<ChainId>) =>
  group('chainValidation', () => {
    test('chainId', () => {
      enforce(chainId).message('Chain ID is required').isNotEmpty().message('Invalid chain ID').isValidChainId()
    })
  })

export const lendingJsValidationGroup = ({ chainId }: ChainParams<ChainId>) =>
  group('apiValidation', () => {
    test('api', () => {
      const api = useStore.getState().api
      enforce(api?.chainId).message('Chain ID should be loaded').equals(chainId)
    })
  })

export const lendingJsValidationSuite = createValidationSuite((params: ChainParams<ChainId>) => {
  chainValidationGroup(params)
  lendingJsValidationGroup(params)
})
