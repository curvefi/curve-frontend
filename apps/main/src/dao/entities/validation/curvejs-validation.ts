import { enforce, group, test } from 'vest'
import type { ChainId } from '@/dao/types/dao.types'
import { getLib } from '@ui-kit/features/connect-wallet'
import type { ChainParams } from '@ui-kit/lib/model/query'
import { createValidationSuite } from '@ui-kit/lib/validation'
import type { CurveApi } from '@ui-kit/shared/useApiStore'

export const chainValidationGroup = ({ chainId }: ChainParams<ChainId>) =>
  group('chainValidation', () => {
    test('chainId', () => {
      enforce(chainId).message('Chain ID is required').isNotEmpty().message('Invalid chain ID').isValidChainId()
    })
  })

export const curvejsValidationGroup = ({ chainId }: ChainParams<ChainId>) =>
  group('apiValidation', () => {
    test('api', () => {
      const curve = getLib<CurveApi>()
      enforce(curve?.chainId).message('Chain ID should be loaded').equals(chainId).message('Incorrect chain ID')
    })
  })

export const curvejsValidationSuite = createValidationSuite((params: ChainParams<ChainId>) => {
  chainValidationGroup(params)
  curvejsValidationGroup(params)
})
