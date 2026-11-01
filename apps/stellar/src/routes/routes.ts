import type { NetworkQuery, PoolQuery } from '@/stellar/queries/query-types'

export const StellarPages = {
  root: ({ network }: NetworkQuery) => ['', 'dex', network].join('/'),
  poolList: (params: NetworkQuery) => [StellarPages.root(params), 'pools'].join('/'),
  pool: ({ pool, network }: PoolQuery) => `${StellarPages.poolList({ network })}/${pool}`,
  legal: (params: NetworkQuery) => [StellarPages.root(params), 'legal'].join('/'),
  integrations: (params: NetworkQuery) => [StellarPages.root(params), 'integrations'].join('/'),
}
