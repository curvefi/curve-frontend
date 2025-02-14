import { getHost, type Options, type Chain } from '..'
import { fetchJson as fetch } from '../fetch'
import { getTimeRange } from '../timestamp'
import type * as Responses from './responses'
import * as Parsers from './parsers'

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

  const resp = await fetch<Responses.GetOHLCResponse>(url)

  return resp.data.map(Parsers.parseOHLC)
}
