import { useCallback, useMemo } from 'react'
import { getPricesApiBlockchainId } from '@curvefi/prices-api'
import { maybe } from '@curvefi/primitives/objects.utils'
import { t } from '@evm-ui/lib/i18n'
import { useMappedQuery } from '@evm-ui/types/util'
import { type LlamaMarketParams, useLlamaMarkets } from '../queries/market-list/llama-markets'

export const useLlamaMarket = (
  { rMarket, network, ...params }: LlamaMarketParams & { rMarket: string; network: string },
  enabled?: boolean,
) => {
  const markets = useLlamaMarkets(params, enabled)

  const market = useMappedQuery(
    markets,
    useCallback(
      ({ markets }) =>
        maybe(getPricesApiBlockchainId(network), chain =>
          markets.find(m => m.chain === chain && m.url.toLowerCase().endsWith(`/${rMarket.toLowerCase()}`)),
        ),
      [network, rMarket],
    ),
  )
  const error = useMemo(
    () => markets.data && !market.data && new Error(`${t`Market`} ${rMarket} ${t`Not Found`}`),
    [markets.data, market.data, rMarket],
  )

  return { ...market, ...(error && { error }) }
}
