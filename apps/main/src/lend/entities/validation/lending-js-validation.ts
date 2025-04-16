import { enforce, group, test } from 'vest'
import type { ChainId } from '@/lend/types/lend.types'
import type { ChainParams } from '@ui-kit/lib/model/query'
import { createValidationSuite } from '@ui-kit/lib/validation'
import { useApiStore } from '@ui-kit/shared/useApiStore'

export const chainValidationGroup = ({ chainId }: ChainParams<ChainId>) =>
  group('chainValidation', () => {
    test('chainId', () => {
      enforce(chainId).message('Chain ID is required').isNotEmpty().message('Invalid chain ID').isValidChainId()
    })
  })

export const lendingJsValidationGroup = ({ chainId }: ChainParams<ChainId>) =>
  group('apiValidation', () => {
    test('api', () => {
      const { llamalend } = useApiStore.getState()
      enforce(llamalend?.chainId).message('Chain ID should be loaded').equals(chainId)
    })
  })

export const lendingJsValidationSuite = createValidationSuite((params: ChainParams<ChainId>) => {
  chainValidationGroup(params)
  lendingJsValidationGroup(params)
})
