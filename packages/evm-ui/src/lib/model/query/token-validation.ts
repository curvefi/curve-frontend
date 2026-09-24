import { group, test } from 'vest'
import { chainValidationGroup } from '@evm-ui/lib/model/query/chain-validation'
import type { TokenParams } from '@evm-ui/queries/root-keys'
import { enforce } from '@ui/lib/validation/enforce-extension'

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
