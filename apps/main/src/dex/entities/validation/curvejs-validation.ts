import type { ChainParams } from '@ui-kit/lib/model/query'
import type { ChainId } from '@/dex/types/main.types'
import { createValidationSuite } from '@ui-kit/lib/validation'
import { enforce, group, test } from 'vest'
import useStore from '@/dex/store/useStore'

export const chainValidationGroup = ({ chainId }: ChainParams<ChainId>) =>
  group('chainValidation', () => {
    test('chainId', () => {
      enforce(chainId).message('Chain ID is required').isNotEmpty().message('Invalid chain ID').isValidChainId()
    })
  })

export const curvejsValidationGroup = ({ chainId }: ChainParams<ChainId>) =>
  group('apiValidation', () => {
    test('api', () => {
      const curve = useStore.getState().curve
      enforce(curve?.chainId).message('Chain ID should be loaded').equals(chainId)
    })
  })

export const curvejsValidationSuite = createValidationSuite((params: ChainParams<ChainId>) => {
  chainValidationGroup(params)
  curvejsValidationGroup(params)
})
