import type { SearchTermKey, SearchTermMapper } from '@/loan/components/PageMarketList/types'

import { t } from '@lingui/macro'
import { CollateralDataCacheOrApi } from '@/loan/types/loan.types'

export enum SEARCH_TERM {
  'llamma.coins' = 'llamma.coins',
  'llamma.coinAddresses' = 'llamma.coinAddresses',
  'llamma.address' = 'llamma.address',
  'llamma.controller' = 'llamma.controller',
}

export function parseSearchTermMapper(
  collateralDataCachedOrApi: CollateralDataCacheOrApi | undefined,
  searchedByAddresses: { [key: string]: { value: string } },
  searchTermMapper: SearchTermMapper,
) {
  if (!searchedByAddresses || !searchTermMapper || !collateralDataCachedOrApi) return undefined

  let parsed = { ...searchTermMapper }
  const { coins, coinAddresses } = collateralDataCachedOrApi?.llamma

  Object.keys(searchedByAddresses).forEach((key) => {
    const k = key as SearchTermKey
    if (!(k in searchTermMapper)) return

    const { value } = searchedByAddresses[k]
    const { isTokenAddress } = searchTermMapper[k]

    if (isTokenAddress) {
      // get token name from token addresses list
      const idx = coinAddresses.indexOf(value.toLowerCase())
      parsed[k].label = coins[idx]
    }
  })

  return parsed
}

const useSearchTermMapper = (): SearchTermMapper => ({
  'llamma.coins': {},
  'llamma.coinAddresses': { isTokenAddress: true },
  'llamma.address': { label: t`LLAMMA` },
  'llamma.controller': { label: t`Controller` },
})

export default useSearchTermMapper
