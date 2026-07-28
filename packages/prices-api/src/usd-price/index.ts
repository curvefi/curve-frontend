import type { Address } from '@primitives/address.utils'
import { addQueryString, fetchJson as fetch } from '@primitives/fetch.utils'
import { getHost, type Chain, type Options } from '..'
import { fetchChunkedTimeSeries, getTimeRange } from '../timestamp'
import * as Schema from './schema'

export type * from './schema'

// The endpoint returns at most 300 rows. A 299-day inclusive range contains at most 300 daily buckets.
const MAX_HISTORY_RANGE_DAYS = 299

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
  const range = getTimeRange({ daysRange: days })

  return fetchChunkedTimeSeries({
    range,
    maxDays: MAX_HISTORY_RANGE_DAYS,
    order: 'asc',
    fetchChunk: async range => {
      const params = { interval: 'day', ...range }
      const url = `${host}/v1/usd_price/${blockchainId}/${contractAddress}/history${addQueryString(params)}`
      const response = await fetch(url)
      return Schema.getUsdPriceHistoryResponse.parse(response)
    },
  })
}
