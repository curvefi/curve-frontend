import type { StellarContract } from '@/stellar/features/connect-wallet/address'
import { readContract } from '@/stellar/features/connect-wallet/stellar-wallet-kit/contract'
import { STELLAR_POOL_LIMITS } from '@/stellar/features/create-pool/constants'
import type { FactoryImplementationParams, FactoryImplementationQuery } from '@/stellar/features/create-pool/types'
import type { NetworkQuery } from '@/stellar/queries/query-types'
import { factoryImplementationValidationSuite } from '@/stellar/queries/validation/create-pool.validation'
import { notFalsy, range } from '@primitives/objects.utils'
import { combineQueries } from '@ui/features/queries/combine'
import { queryFactory } from '@ui/features/queries/factory'
import { useQueries } from '@ui/features/queries/query-hooks'

const { getQueryOptions: getFactoryImplementationQueryOptions } = queryFactory({
  queryKey: ({ network, factory, implementationIndex, coinCount }: FactoryImplementationParams) =>
    ({ name: 'deployable-pool-implementation', network, factory, implementationIndex, coinCount }) as const,
  queryFn: async ({ network, factory, implementationIndex, coinCount }: FactoryImplementationQuery) => {
    const implementation = await readContract<{ wasm_hash: Uint8Array; deployable: boolean } | null>(
      network,
      factory,
      'implementation',
      [coinCount, implementationIndex],
    )
    return implementation?.deployable ? { factory, coinCount, wasmHash: Array.from(implementation.wasm_hash) } : null
  },
  validationSuite: factoryImplementationValidationSuite,
  category: 'dex.createPool',
})

export const useFactoryImplementations = ({
  network,
  factories,
}: NetworkQuery & { factories: readonly { address: StellarContract; implementationIndex: number }[] }) => {
  const { min, max } = STELLAR_POOL_LIMITS.tokens
  return useQueries({
    queries: factories.flatMap(({ address: factory, implementationIndex }) =>
      range(max - min + 1).map(index =>
        getFactoryImplementationQueryOptions({ network, factory, implementationIndex, coinCount: min + index }),
      ),
    ),
    combine: results => combineQueries(results, notFalsy),
  })
}
