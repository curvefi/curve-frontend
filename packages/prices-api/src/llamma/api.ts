import { getHost, type Address, type Options, type Chain } from '..'
import { fetchJson as fetch } from '../fetch'
import type * as Responses from './responses'
import * as Parsers from './parsers'

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

  end ??= Math.floor(Date.now() / 1000)
  start ??= end - 10 * 24 * 60 * 60 // Subtract 1 month worth of seconds.

  const params = new URLSearchParams({
    agg_number: interval.toString(),
    agg_units: units,
    ...(start && { start: start.toString() }),
    ...(end && { end: end.toString() }),
  })

  const resp = await fetch<Responses.GetLlammaOHLCResponse>(
    `${host}/v1/${endpoint}/llamma_ohlc/${chain}/${llamma}?${params.toString()}`,
  )

  return resp.data.map(Parsers.parseOHLC)
}
