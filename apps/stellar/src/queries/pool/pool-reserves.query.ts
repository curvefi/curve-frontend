import { useMemo } from 'react'
import { readContract } from '@/stellar/features/connect-wallet/stellar-wallet-kit'
import type { PoolParams, PoolQuery } from '@/stellar/queries/query-types'
import { poolValidationSuite } from '@/stellar/queries/validation/pool.validation'
import type { Decimal } from '@primitives/decimal.utils'
import { combineQueries } from '@ui/features/queries/combine'
import { queryFactory } from '@ui/features/queries/factory'
import { mapQuery, type Query, type QueryProp } from '@ui/features/queries/util'
import { fromWei } from '@ui/lib/decimal'

export const { useQuery: usePoolReserves, invalidate: invalidatePoolReserves } = queryFactory({
  queryKey: ({ network, pool }: PoolParams) => ({ name: 'get_balances', network, pool }) as const,
  queryFn: async ({ network, pool }: PoolQuery) =>
    (await readContract<bigint[]>(network, pool, 'get_balances')).map(value => value.toString() as Decimal),
  category: 'dex.pool',
  validationSuite: poolValidationSuite,
})

export const useScaleReserves = ({ data, error, isLoading }: Query<Decimal[]>, decimals: Query<number>[] | undefined) =>
  useMemo(
    () =>
      decimals?.map((decimals, index) =>
        combineQueries([mapQuery({ data, error, isLoading }, amounts => amounts[index]), decimals], fromWei),
      ),
    [data, error, isLoading, decimals],
  )

export const usePoolReserveAmounts = (params: PoolParams, decimals: QueryProp<number>[] | undefined) =>
  useScaleReserves(usePoolReserves(params), decimals)
