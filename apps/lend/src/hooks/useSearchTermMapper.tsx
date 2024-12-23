import type { SearchTermMapper, SearchTermKey } from '@/components/PageMarketList/types'

import { t } from '@lingui/macro'
import { OneWayMarketTemplate } from '@curvefi/lending-api/lib/markets'

export enum SEARCH_TERM {
  'collateral_token.symbol' = 'collateral_token.symbol',
  'borrowed_token.symbol' = 'borrowed_token.symbol',
  'collateral_token.address' = 'collateral_token.address',
  'borrowed_token.address' = 'borrowed_token.address',
  'addresses.amm' = 'addresses.amm',
  'addresses.controller' = 'addresses.controller',
  'addresses.monetary_policy' = 'addresses.monetary_policy',
  'addresses.vault' = 'addresses.vault',
  'addresses.gauge' = 'addresses.gauge',
}

export function parseSearchTermMapper(
  market: OneWayMarketTemplate | undefined,
  searchedByAddresses: { [key: string]: { value: string } },
  searchTermMapper: SearchTermMapper,
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

const useSearchTermMapper = (): SearchTermMapper => ({
  'collateral_token.symbol': {},
  'borrowed_token.symbol': {},
  'collateral_token.address': { isTokenAddress: true },
  'borrowed_token.address': { isTokenAddress: true },
  'addresses.amm': { label: t`AMM` },
  'addresses.controller': { label: t`Controller` },
  'addresses.monetary_policy': { label: t`Monetary Policy` },
  'addresses.vault': { label: t`Vault` },
  'addresses.gauge': { label: t`Gauge` },
})

export default useSearchTermMapper
