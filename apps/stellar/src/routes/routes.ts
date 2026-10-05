import type { NetworkQuery, PoolQuery } from '@/stellar/queries/query-types'

export const StellarUrls = {
  poolList: ({ network }: NetworkQuery) => `/dex/${network}/pools`,
  pool: ({ pool, network }: PoolQuery) => `${StellarUrls.poolList({ network })}/${pool}`,
}
