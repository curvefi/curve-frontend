import type { PoolTemplate } from '@curvefi/api/lib/pools'

const WRAPPED_ONLY_POOL_IDS = ['pax', 'busd', 'y']

export const isWrappedOnly = (pool: PoolTemplate) => WRAPPED_ONLY_POOL_IDS.includes(pool.id)
