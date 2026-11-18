import type { usePoolConfig } from '@/stellar/queries/pool/pool-config.query'
import { usePoolRegistration } from '@/stellar/queries/pool/pool-registration.query'
import type { PoolQuery } from '@/stellar/queries/query-types'
import type { LitePool } from '@curvefi/prices-api/pools'
import { combineQueryState } from '@ui/features/queries/combine'
import { q, type Query, type QueryData } from '@ui/features/queries/util'

export const useIsRegisteredPool = (
  params: PoolQuery,
  config: Query<QueryData<typeof usePoolConfig>>,
  litePool: Query<LitePool | null>,
): Query<boolean> => {
  const registration = usePoolRegistration({ ...params, factory: config.data?.factory })
  return q({
    data: !!litePool.data || registration.data?.pool === params.pool,
    ...combineQueryState(config, registration, litePool),
  })
}
