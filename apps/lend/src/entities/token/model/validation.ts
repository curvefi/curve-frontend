import type { TokenQueryParams } from '@/entities/token/types'
import { createValidationSuite } from '@/shared/lib/validation'
import { enforce, group, test } from 'vest'
import { chainValidationGroup } from '@/entities/chain'

export const tokenValidationGroup = ({ chainId, tokenAddress }: TokenQueryParams) =>
  group('tokenValidation', () => {
    chainValidationGroup({ chainId })
    test('tokenAddress', () => {
      enforce(tokenAddress).message('Token address is required').isNotEmpty().message('Invalid token address').isAddress();
    })
  })

export const tokenValidationSuite = createValidationSuite(tokenValidationGroup)
