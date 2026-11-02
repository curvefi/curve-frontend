import type { NetworkQuery, PoolQuery } from '@/stellar/queries/query-types'

export const StellarUrls = {
  createPool: ({ network }: NetworkQuery) => `/dex/${network}/create-pool`,
  poolList: ({ network }: NetworkQuery) => `/dex/${network}/pools`,
  pool: ({ pool, network }: PoolQuery) => `${StellarUrls.poolList({ network })}/${pool}`,
}
