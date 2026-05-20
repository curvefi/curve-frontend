import type { Address } from '@primitives/address.utils'
import { addQueryString, fetchJson as fetch } from '@primitives/fetch.utils'
import { getHost, type Chain, type Options } from '..'
import { getTimeRange } from '../timestamp'
import * as Schema from './schema'

export type * from './schema'

/** Fetch USD price for a token. */
export async function getUsdPrice(blockchainId: Chain, contractAddress: Address, options?: Options) {
  const host = getHost(options)
  const url = `${host}/v1/usd_price/${blockchainId}/${contractAddress}`
  const response = await fetch(url)

  return Schema.getUsdPriceResponse.parse(response)
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
  const response = await fetch(url)

  return Schema.getUsdPriceHistoryResponse.parse(response)
}
