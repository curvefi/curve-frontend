import type { usePoolConfig } from '@/stellar/queries/pool/pool-config.query'
import { usePoolRegistration } from '@/stellar/queries/pool/pool-registration.query'
import type { PoolQuery } from '@/stellar/queries/query-types'
import type { LitePool } from '@curvefi/prices-api/pools'
import { maybe } from '@primitives/objects.utils'
import { combineQueryState } from '@ui/features/queries/combine'
import { loadingQ, mapQuery, q, type Query, type QueryData } from '@ui/features/queries/util'

export const useIsRegisteredPool = (
  { pool, network }: PoolQuery,
  config: Query<QueryData<typeof usePoolConfig>>,
  litePool: Query<LitePool | null>,
): Query<boolean> => {
  const registration = usePoolRegistration({ pool, network, factory: mapQuery(config, config => config.factory) })
  const data = !!litePool.data || maybe(registration.data, r => r.pool === pool)
  return q({ data, ...combineQueryState(config, registration, litePool, loadingQ(data)) })
}
