import type { SearchTermMapper, SearchTermKey } from '@/components/PageMarketList/types'

import { t } from '@lingui/macro'
import { OneWayMarketTemplate } from '@curvefi/lending-api/lib/markets'

export enum SEARCH_TERM {
  'owm.collateral_token.symbol' = 'owm.collateral_token.symbol',
  'owm.borrowed_token.symbol' = 'owm.borrowed_token.symbol',
  'owm.collateral_token.address' = 'owm.collateral_token.address',
  'owm.borrowed_token.address' = 'owm.borrowed_token.address',
  'owm.addresses.amm' = 'owm.addresses.amm',
  'owm.addresses.controller' = 'owm.addresses.controller',
  'owm.addresses.monetary_policy' = 'owm.addresses.monetary_policy',
  'owm.addresses.vault' = 'owm.addresses.vault',
  'owm.addresses.gauge' = 'owm.addresses.gauge',
}

export function parseSearchTermMapper(
  market: OneWayMarketTemplate | undefined,
  searchedByAddresses: { [key: string]: { value: string } },
  searchTermMapper: SearchTermMapper
) {
  if (!searchedByAddresses || !searchTermMapper || !market) return undefined

  let parsed = { ...searchTermMapper }
  const { collateral_token, borrowed_token } = market

  Object.keys(searchedByAddresses).forEach((key) => {
    const k = key as SearchTermKey
    if (!(k in searchTermMapper)) return

    const { value } = searchedByAddresses[k]
    const { isTokenAddress } = searchTermMapper[k]

    if (isTokenAddress) {
      // get token name from token addresses list
      let token = ''
      if (collateral_token.address === value.toLowerCase()) token = collateral_token.symbol
      if (borrowed_token.address === value.toLowerCase()) token = borrowed_token.symbol
      parsed[k].label = token
    }
  })

  return parsed
}

const useSearchTermMapper = (): SearchTermMapper => {
  return {
    'owm.collateral_token.symbol': {},
    'owm.borrowed_token.symbol': {},
    'owm.collateral_token.address': { isTokenAddress: true },
    'owm.borrowed_token.address': { isTokenAddress: true },
    'owm.addresses.amm': { label: t`AMM` },
    'owm.addresses.controller': { label: t`Controller` },
    'owm.addresses.monetary_policy': { label: t`Monetary Policy` },
    'owm.addresses.vault': { label: t`Vault` },
    'owm.addresses.gauge': { label: t`Gauge` },
  }
}

export default useSearchTermMapper
