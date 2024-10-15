import { enforce, group, test } from 'vest'
import { chainValidationGroup } from '@/entities/chain'
import type { PoolQueryParams } from '@/entities/pool/types'
import { createValidationSuite } from '@/shared/lib/validation'

export const poolValidationGroup = ({ chainId, poolId }: PoolQueryParams) =>
  group('poolValidation', () => {
    chainValidationGroup({ chainId })

    test('poolId', () => {
      enforce(poolId).message('Pool ID is required').isNotEmpty()
    })
  })

export const poolValidationSuite = createValidationSuite(poolValidationGroup)
