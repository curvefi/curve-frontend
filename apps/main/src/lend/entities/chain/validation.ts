import { enforce, group, test } from 'vest'
import { ChainId, type LlamalendApi } from '@/lend/types/lend.types'
import { getLib } from '@ui-kit/features/connect-wallet'
import { ChainParams } from '@ui-kit/lib/model/query'
import { createValidationSuite } from '@ui-kit/lib/validation'

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
      const api = getLib<LlamalendApi>()
      enforce(api?.chainId).message('Chain ID should be loaded').equals(data.chainId)
    })
  })
