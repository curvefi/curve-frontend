import { enforce, group, test } from 'vest'
import { chainValidationGroup } from '@/entities/chain'
import type { TokenParams } from '@/entities/token/types'
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
