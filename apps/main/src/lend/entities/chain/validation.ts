import { enforce, group, test } from 'vest'
import { ChainId } from '@/lend/types/lend.types'
import { ChainParams } from '@ui-kit/lib/model/query'
import { createValidationSuite } from '@ui-kit/lib/validation'
import { useApiStore } from '@ui-kit/shared/useApiStore'

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
      const api = useApiStore.getState().lending
      enforce(api?.chainId).message('Chain ID should be loaded').equals(data.chainId)
    })
  })
