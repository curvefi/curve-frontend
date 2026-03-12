import type { Address } from '@primitives/address.utils'
import { addQueryString, fetchJson as fetch } from '@primitives/fetch.utils'
import { getHost, type Options, type Chain } from '..'
import { getTimeRange } from '../timestamp'
import * as Parsers from './parsers'
import type * as Responses from './responses'

/** Fetch USD price for a token. */
export async function getUsdPrice(blockchainId: Chain, contractAddress: Address, options?: Options) {
  const host = getHost(options)
  const url = `${host}/v1/usd_price/${blockchainId}/${contractAddress}`

  const resp = await fetch<Responses.GetUsdPriceResponse>(url)
  return Parsers.parseUsdPrice(resp)
}

export async function getUsdPriceHistory(
  blockchainId: Chain,
  contractAddress: Address,
  days: number,
  options?: Options,
) {
  const host = getHost(options)
  const params = { interval: 'day', ...getTimeRange({ daysRange: days }) }
  const url = `${host}/v1/usd_price/${blockchainId}/${contractAddress}/history${addQueryString(params)}`

  const resp = await fetch<Responses.GetUsdPriceHistoryResponse>(url)
  return Parsers.parseUsdPriceHistory(resp)
}
