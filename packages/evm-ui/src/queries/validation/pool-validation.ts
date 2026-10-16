import { group, test } from 'vest'
import type { PoolParams } from '@evm-ui/queries/query-types'
import { enforce } from '@ui/lib/validation/enforce-extension'
import { createValidationSuite } from '@ui/lib/validation/lib'
import { chainValidationGroup } from './chain-validation'
import { curveApiValidationGroup } from './curve-api-validation'

export const poolValidationGroup = ({ chainId, poolAddress }: PoolParams) =>
  group('poolValidation', () => {
    chainValidationGroup({ chainId })

    test('poolAddress', () => {
      enforce(poolAddress).message('Pool address is required').isNotEmpty()
    })
  })

export const poolValidationSuite = createValidationSuite(poolValidationGroup)

export const curvePoolValidationGroup = (params: PoolParams) => {
  chainValidationGroup(params)
  curveApiValidationGroup(params)
  poolValidationGroup(params)
}

export const curvePoolValidationSuite = createValidationSuite(curvePoolValidationGroup)
