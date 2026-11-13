import { readContract } from '@/stellar/features/connect-wallet/stellar-wallet-kit/contract'
import type { FactoryImplementationParams, FactoryImplementationQuery } from '@/stellar/features/create-pool/types'
import { factoryImplementationValidationSuite } from '@/stellar/queries/validation/create-pool.validation'
import { queryFactory } from '@ui/features/queries/factory'

export const { getQueryOptions: getFactoryImplementationQueryOptions } = queryFactory({
  queryKey: ({ network, factory, implementationIndex, coinCount }: FactoryImplementationParams) =>
    ({ name: 'deployable-pool-implementation', network, factory, implementationIndex, coinCount }) as const,
  queryFn: async ({ network, factory, implementationIndex, coinCount }: FactoryImplementationQuery) => {
    const implementation = await readContract<{ wasm_hash: Uint8Array; deployable: boolean } | null>(
      network,
      factory,
      'implementation',
      [coinCount, implementationIndex],
    )
    return implementation?.deployable
      ? { factory, implementationIndex, coinCount, wasmHash: Array.from(implementation.wasm_hash) }
      : null
  },
  validationSuite: factoryImplementationValidationSuite,
  category: 'dex.createPool',
})
