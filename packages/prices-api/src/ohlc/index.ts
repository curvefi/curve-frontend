import { fetchJson as fetch } from '@primitives/fetch.utils'
import { getHost, type Chain, type Options } from '..'
import { getTimeRange } from '../timestamp'
import * as Schema from './schema'

export type * from './schema'

export async function getOHLC(chain: Chain, poolAddr: string, tokenMain: string, tokenRef: string, options?: Options) {
  const host = getHost(options)

  const { start, end } = getTimeRange({ daysRange: 90 })

  const url =
    `${host}/v1/ohlc` +
    `/${chain}` +
    `/${poolAddr}?` +
    `main_token=${tokenMain}&` +
    `reference_token=${tokenRef}&` +
    `agg_number=1&` +
    `agg_units=day&` +
    `start=${start}&` +
    `end=${end}`

  const response = await fetch(url)

  return Schema.getOHLCResponse.parse(response)
}
