import type { NetworkQuery, PoolQuery } from '@/stellar/queries/query-types'

export const StellarPages = {
  root: ({ network }: NetworkQuery) => ['', 'dex', network].join('/'),
  pools: (params: NetworkQuery) => [StellarPages.root(params), 'pools'].join('/'),
  pool: ({ pool, network }: PoolQuery) => [StellarPages.pools({ network }), pool].join('/'),
  createPool: (params: NetworkQuery) => [StellarPages.root(params), 'create-pool'].join('/'),
  legal: (params: NetworkQuery) => [StellarPages.root(params), 'legal'].join('/'),
  integrations: (params: NetworkQuery) => [StellarPages.root(params), 'integrations'].join('/'),
}
