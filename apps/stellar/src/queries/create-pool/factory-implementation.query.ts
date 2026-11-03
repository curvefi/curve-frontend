import { readContract } from '@/stellar/features/connect-wallet/stellar-wallet-kit/contract'
import type { FactoryImplementationParams, FactoryImplementationQuery } from '@/stellar/features/create-pool/types'
import { factoryImplementationValidationSuite } from '@/stellar/queries/validation/create-pool.validation'
import { assert } from '@primitives/objects.utils'
import { queryFactory } from '@ui/features/queries/factory'

export const { fetchQuery: fetchFactoryImplementation } = queryFactory({
  queryKey: ({ network, factory, implementationIndex, coinCount }: FactoryImplementationParams) =>
    ({ name: 'implementation', network, factory, implementationIndex, coinCount }) as const,
  queryFn: async ({ network, factory, implementationIndex, coinCount }: FactoryImplementationQuery) => {
    const implementation = await readContract<{ wasm_hash: Uint8Array; deployable: boolean } | undefined>(
      network,
      factory,
      'implementation',
      [coinCount, implementationIndex],
    )
    const { wasm_hash, deployable } = assert(implementation, 'No implementation is registered for this token count')
    assert(deployable, 'This pool implementation is not available for deployment')
    return Array.from(wasm_hash)
  },
  validationSuite: factoryImplementationValidationSuite,
  category: 'dex.poolParams',
})
