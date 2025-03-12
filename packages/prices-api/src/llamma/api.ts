import { getHost, type Address, type Options, type Chain } from '..'
import { fetchJson as fetch } from '../fetch'
import { getTimeRange } from '../timestamp'
import * as Parsers from './parsers'
import type * as Responses from './responses'

export type Endpoint = 'crvusd' | 'lending'

type GetEventsParams = {
  endpoint: Endpoint
  chain: Chain
  llamma: Address
  page?: number
  perPage?: number
}

export async function getEvents(
  { endpoint, chain, llamma, page = 1, perPage = 10 }: GetEventsParams,
  options?: Options,
) {
  const host = getHost(options)
  const params = new URLSearchParams({
    page: page.toString(),
    per_page: perPage.toString(),
  })

  const resp = await fetch<Responses.GetLlammaEventsResponse>(
    `${host}/v1/${endpoint}/llamma_events/${chain}/${llamma}??${params.toString()}`,
  )

  return {
    events: resp.data.map(Parsers.parseEvents),
    count: resp.count,
  }
}

type GetTradesParams = {
  endpoint: Endpoint
  chain: Chain
  llamma: Address
  page?: number
  perPage?: number
}

export async function getTrades(
  { endpoint, chain, llamma, page = 1, perPage = 10 }: GetTradesParams,
  options?: Options,
) {
  const host = getHost(options)
  const params = new URLSearchParams({
    page: page.toString(),
    per_page: perPage.toString(),
  })

  const resp = await fetch<Responses.GetLlammaTradesResponse>(
    `${host}/v1/${endpoint}/llamma_trades/${chain}/${llamma}?${params.toString()}`,
  )

  return {
    trades: resp.data.map(Parsers.parseTrades),
    count: resp.count,
  }
}

type GetOHLCParams = {
  endpoint: Endpoint
  chain: Chain
  llamma: Address
  interval?: number
  units?: 'day' | 'hour' | 'minute'
  start?: number
  end?: number
}

export async function getOHLC(
  { endpoint, chain, llamma, interval = 1, units = 'hour', start, end }: GetOHLCParams,
  options?: Options,
) {
  const host = getHost(options)

  const range = getTimeRange({ start, end })

  const params = new URLSearchParams({
    agg_number: interval.toString(),
    agg_units: units,
    start: range.start.toString(),
    end: range.end.toString(),
  })

  const resp = await fetch<Responses.GetLlammaOHLCResponse>(
    `${host}/v1/${endpoint}/llamma_ohlc/${chain}/${llamma}?${params.toString()}`,
  )

  return resp.data.map(Parsers.parseOHLC)
}
