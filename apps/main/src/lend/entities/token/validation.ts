import { enforce, group, test } from 'vest'
import type { TokenParams } from '@/lend/entities/token/types'
import { chainValidationGroup } from '@ui-kit/lib/model/query/chain-validation'
import { createValidationSuite } from '@ui-kit/lib/validation'

export const tokenValidationGroup = ({ chainId, tokenAddress }: TokenParams) =>
  group('tokenValidation', () => {
    chainValidationGroup({ chainId })
    test('tokenAddress', () => {
      enforce(tokenAddress)
        .message('Token address is required')
        .isNotEmpty()
        .message('Invalid token address')
        .isAddress()
    })
  })

export const tokenValidationSuite = createValidationSuite(tokenValidationGroup)
