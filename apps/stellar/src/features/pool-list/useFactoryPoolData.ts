import { type FactoryPool, useFactoryPools } from '@/stellar/queries/factories/pools.query'
import type { NetworkQuery } from '@/stellar/queries/root-keys'
import { getTokenNameQueryOptions } from '@/stellar/queries/token/token-name.query'
import { useQueries } from '@tanstack/react-query'
import { aggregateQueries, combineQueries } from '@ui/features/queries/combine'

export type FactoryPoolData = FactoryPool & { name: string | undefined }

export function useFactoryPoolData({ network }: NetworkQuery) {
  const pools = useFactoryPools({ network })
  const names = useQueries({
    queries: (pools.data ?? []).map(({ pool }) => getTokenNameQueryOptions({ network, token: pool })),
  })
  return {
    ...combineQueries([pools, aggregateQueries(names)], (pools, names): FactoryPoolData[] =>
      pools.map((pool, index) => ({ ...pool, name: names[index] })),
    ),
    isFetching: pools.isFetching || names.some(query => query.isFetching),
    refetch: () => Promise.all([pools.refetch(), ...names.map(query => query.refetch())]),
  }
}
