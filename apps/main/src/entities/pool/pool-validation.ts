import { enforce, group, test } from 'vest'
import { chainValidationGroup } from '@/entities/chain'
import { createValidationSuite } from '@/shared/lib/validation'
import { PoolParams } from '@/shared/model/query'

export const poolValidationGroup = ({ chainId, poolId }: PoolParams) =>
  group('poolValidation', () => {
    chainValidationGroup({ chainId })

    test('poolId', () => {
      enforce(poolId).message('Pool ID is required').isNotEmpty()
    })
  })

export const poolValidationSuite = createValidationSuite(poolValidationGroup)
