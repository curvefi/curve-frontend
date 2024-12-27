import { enforce, group, test } from 'vest'
import { chainValidationGroup } from './chain-validation'
import { createValidationSuite } from '@ui-kit/lib/validation'
import { PoolParams } from './root-keys'

export const poolValidationGroup = ({ chainId, poolId }: PoolParams) =>
  group('poolValidation', () => {
    chainValidationGroup({ chainId })

    test('poolId', () => {
      enforce(poolId).message('Pool ID is required').isNotEmpty()
    })
  })

export const poolValidationSuite = createValidationSuite(poolValidationGroup)
