import { STELLAR_NETWORKS, type StellarFactories } from '@/stellar/lib/networks'
import { getFactoryImplementationQueryOptions } from '@/stellar/queries/create-pool/factory-implementation.query'
import type { NetworkQuery } from '@/stellar/queries/query-types'
import { notFalsy, range, recordEntries } from '@primitives/objects.utils'
import type { CreatePoolFormValues } from '@ui/features/create-pool/types'
import { combineQueries } from '@ui/features/queries/combine'
import { useQueries } from '@ui/features/queries/query-hooks'
import { mapQuery } from '@ui/features/queries/util'
import { STELLAR_POOL_LIMITS } from './constants'

export const useCreatePoolFactory = ({
  network,
  poolType,
  tokenCount,
}: NetworkQuery & Pick<CreatePoolFormValues, 'poolType' | 'tokenCount'>) => {
  const factories: StellarFactories = STELLAR_NETWORKS[network].factories
  const { min, max } = STELLAR_POOL_LIMITS.tokens
  const implementations = useQueries({
    queries: recordEntries(factories)
      .filter(([type]) => !poolType || type === poolType)
      .flatMap(([, factories]) => factories)
      .flatMap(({ address: factory, implementationIndex }) =>
        range(max - min + 1).map(index =>
          getFactoryImplementationQueryOptions({ network, factory, implementationIndex, coinCount: min + index }),
        ),
      ),
    combine: results => combineQueries(results, notFalsy),
  })

  return mapQuery(implementations, items => {
    const implementation = poolType ? items.find(item => item.coinCount === tokenCount) : undefined
    return {
      ...implementation,
      isAvailable: !!implementation,
      tokenCounts: [...new Set(items.map(item => item.coinCount))],
    }
  })
}
