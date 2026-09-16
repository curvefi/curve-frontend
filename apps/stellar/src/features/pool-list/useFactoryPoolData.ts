import { type FactoryPool, useFactoryPools } from '@/stellar/queries/factories/pools.query'
import type { NetworkQuery } from '@/stellar/queries/root-keys'
import { getTokenNameQueryOptions } from '@/stellar/queries/token/token-name.query'
import { zip } from '@primitives/array.utils'
import { useQueries } from '@tanstack/react-query'
import { aggregateQueries, combineQueries } from '@ui/features/queries/combine'

export type FactoryPoolData = FactoryPool & { name: string | undefined }

export function useFactoryPoolData({ network }: NetworkQuery) {
  const pools = useFactoryPools({ network })
  const names = useQueries({
    queries: (pools.data ?? []).map(({ pool }) => getTokenNameQueryOptions({ network, token: pool })),
  })
  // eslint-disable-next-line @tanstack/query/no-rest-destructuring -- false positive, not destructuring query
  const queries = [pools, ...names]
  return {
    ...combineQueries([pools, aggregateQueries(names)], (pools, names): FactoryPoolData[] =>
      zip(pools, names).map(([pool, name]) => ({ ...pool, name })),
    ),
    isFetching: queries.some(q => q.isFetching),
    refetch: () => Promise.all(queries.map(q => q.refetch())),
  }
}
