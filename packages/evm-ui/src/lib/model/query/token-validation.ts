import { enforce, group, test } from 'vest'
import { chainValidationGroup } from '@evm-ui/lib/model/query/chain-validation'
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
