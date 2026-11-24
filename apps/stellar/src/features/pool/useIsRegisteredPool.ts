import type { usePoolConfig } from '@/stellar/queries/pool/pool-config.query'
import { usePoolRegistration } from '@/stellar/queries/pool/pool-registration.query'
import type { PoolQuery } from '@/stellar/queries/query-types'
import type { LitePool } from '@curvefi/prices-api/pools'
import { combineQueryState } from '@ui/features/queries/combine'
import { mapQuery, q, type Query, type QueryData } from '@ui/features/queries/util'

export const useIsRegisteredPool = (
  { pool, network }: PoolQuery,
  config: Query<QueryData<typeof usePoolConfig>>,
  litePool: Query<LitePool | null>,
) => {
  const registration = usePoolRegistration({ pool, network, factory: mapQuery(config, config => config.factory) })
  const data = !!litePool.data || mapQuery(registration, r => r?.pool === pool).data
  return q({ data, ...combineQueryState(config, registration, litePool) })
}
