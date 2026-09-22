import { readContract } from '@/stellar/features/connect-wallet/stellar-wallet-kit'
import { PoolParams, PoolQuery, rootKeys } from '@/stellar/queries/root-keys'
import { poolValidationSuite } from '@/stellar/queries/validation/pool.validation'
import { zip } from '@primitives/array.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { maybe } from '@primitives/objects.utils'
import { useCombinedQueries } from '@ui/features/queries/combine'
import { queryFactory } from '@ui/features/queries/factory'
import type { Query, QueryProp } from '@ui/features/queries/util'
import { fromWei } from '@ui/lib/decimal'

export const { useQuery: usePoolReserves, invalidate: invalidatePoolReserves } = queryFactory({
  queryKey: ({ network, pool }: PoolParams) => [...rootKeys.pool({ network, pool }), 'get_balances'] as const,
  queryFn: async ({ network, pool }: PoolQuery) =>
    (await readContract<bigint[]>(network, pool, 'get_balances')).map(value => value.toString() as Decimal),
  category: 'dex.pool',
  validationSuite: poolValidationSuite,
})

const getReserveAmounts = (reserves: Decimal[], decimals: (number | undefined)[]) =>
  zip(reserves, decimals).map(([amount, decimals]) => maybe(decimals, d => fromWei(amount, d)))

export const useScaleReserves = (reserves: Query<Decimal[]>, decimals: Query<(number | undefined)[]>) =>
  useCombinedQueries([reserves, decimals], getReserveAmounts)

export const usePoolReserveAmounts = (params: PoolParams, decimals: QueryProp<(number | undefined)[]>) =>
  useScaleReserves(usePoolReserves(params), decimals)
