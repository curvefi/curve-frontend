import type { SearchTermKey, SearchTermMapper } from '@/components/PagePoolList/types'

import { t } from '@lingui/macro'

export enum SEARCH_TERM {
  'pool.wrappedCoins' = 'pool.wrappedCoins',
  'pool.wrappedCoinAddresses' = 'pool.wrappedCoinAddresses',
  'pool.underlyingCoins' = 'pool.underlyingCoins',
  'pool.underlyingCoinAddresses' = 'pool.underlyingCoinAddresses',
  'pool.name' = 'pool.name',
  'pool.address' = 'pool.address',
  'pool.gauge.address' = 'pool.gauge.address',
  'pool.lpToken' = 'pool.lpToken',
}

export function parseSearchTermMapper(
  searchedByAddresses: { [key: string]: { value: string } },
  searchTermMapper: SearchTermMapper,
  poolDataCachedOrApi: PoolDataCacheOrApi | undefined
) {
  if (!searchedByAddresses || !searchTermMapper || !poolDataCachedOrApi) return undefined

  let parsed = { ...searchTermMapper }
  const { tokenAddressesAll, tokensAll } = poolDataCachedOrApi

  Object.keys(searchedByAddresses).forEach((key) => {
    const k = key as SearchTermKey
    if (!(k in searchTermMapper)) return

    const { value } = searchedByAddresses[k]
    const { isTokenAddress } = searchTermMapper[k]

    if (isTokenAddress) {
      // get token name from token addresses list
      const idx = tokenAddressesAll.indexOf(value.toLowerCase())
      parsed[k].label = tokensAll[idx]
    }
  })

  return parsed
}

const useSearchTermMapper = (): SearchTermMapper => {
  return {
    'pool.name': {},
    'pool.wrappedCoins': {},
    'pool.underlyingCoins': {},
    'pool.wrappedCoinAddresses': { isTokenAddress: true },
    'pool.underlyingCoinAddresses': { isTokenAddress: true },
    'pool.address': { label: t`Pool` },
    'pool.gauge.address': { label: t`Gauge` },
    'pool.lpToken': { label: t`LP Token` },
  }
}

export default useSearchTermMapper
