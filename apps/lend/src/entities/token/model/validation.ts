import type { TokenQueryParams } from '@/entities/token/types'
import { createValidationSuite } from '@/shared/lib/validation'
import { enforce, group, test } from 'vest'
import useStore from '@/store/useStore'
import { chainValidationGroup } from 'main/src/entities/chain'

export const tokenValidationGroup = ({ chainId, address }: TokenQueryParams) =>
  group('tokenValidation', () => {
    chainValidationGroup({ chainId })
    test('address', () => {
      enforce(address).message('Token address is required').isNotEmpty().message('Invalid token address').isAddress();
    })
  })

export const tokenValidationSuite = createValidationSuite(tokenValidationGroup)
