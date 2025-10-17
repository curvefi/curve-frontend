import { chainValidationGroup } from '@ui-kit/lib/model/query/chain-validation'
import { createValidationSuite } from '@ui-kit/lib/validation'
import { enforce, group, test } from '@ui-kit/lib/validation/lib'
import type { TokenParams } from './root-keys'

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
