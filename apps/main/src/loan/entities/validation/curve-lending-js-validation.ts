import { enforce, group, test } from 'vest'
import { getLend } from '@/loan/temp-lib'
import type { ChainId } from '@/loan/types/loan.types'
import type { ChainParams } from '@ui-kit/lib/model/query'
import { createValidationSuite } from '@ui-kit/lib/validation'

export const chainValidationGroup = ({ chainId }: ChainParams<ChainId>) =>
  group('chainValidation', () => {
    test('chainId', () => {
      enforce(chainId).message('Chain ID is required').isNotEmpty().message('Invalid chain ID').isValidChainId()
    })
  })

export const curvejsValidationGroup = ({ chainId }: ChainParams<ChainId>) =>
  group('apiValidation', () => {
    test('api', () => {
      enforce(getLend()?.chainId).message('Chain ID should be loaded').equals(chainId)
    })
  })

export const curvejsValidationSuite = createValidationSuite((params: ChainParams<ChainId>) => {
  chainValidationGroup(params)
  curvejsValidationGroup(params)
})
