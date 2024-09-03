import { chainValidationGroup } from '@/entities/chain'
import type { PoolQueryParams } from '@/entities/pool/types'
import { createValidationSuite } from '@/shared/validation'
import { enforce, group, test } from 'vest'

export const poolValidationGroup = ({ chainId, poolId }: PoolQueryParams) =>
  group('poolValidation', () => {
    chainValidationGroup({ chainId })

    test('poolId', 'Invalid pool ID', () => {
      enforce(poolId).isNotEmpty('Pool ID is required')
    })
  })

export const poolValidationSuite = createValidationSuite(poolValidationGroup)
