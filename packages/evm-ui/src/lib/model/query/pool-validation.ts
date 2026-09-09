import { group, test } from 'vest'
import { createValidationSuite } from '@evm-ui/lib/validation'
import { enforce } from '@evm-ui/lib/validation/enforce-extension'
import { chainValidationGroup } from './chain-validation'
import { PoolParams } from './root-keys'

export const poolValidationGroup = ({ chainId, poolId }: PoolParams) =>
  group('poolValidation', () => {
    chainValidationGroup({ chainId })

    test('poolId', () => {
      enforce(poolId).message('Pool ID is required').isNotEmpty()
    })
  })

export const poolValidationSuite = createValidationSuite(poolValidationGroup)
