import type { Address } from '@primitives/address.utils'
import { fetchJson as fetch } from '@primitives/fetch.utils'
import { getHost, type Chain, type Options } from '..'
import { getTimeRange } from '../timestamp'
import * as Schema from './schema'

export type * from './schema'

export type GetEventsParams = {
  endpoint: Schema.Endpoint
  chain: Chain
  llamma: Address
  page?: number
  perPage?: number
}

export async function getEvents(
  { endpoint: endpointParam, chain, llamma, page = 1, perPage = 10 }: GetEventsParams,
  options?: Options,
) {
  const host = getHost(options)
  Schema.endpoint.parse(endpointParam)
  const params = new URLSearchParams({
    page: page.toString(),
    per_page: perPage.toString(),
  })

  const response = await fetch(`${host}/v1/${endpointParam}/llamma_events/${chain}/${llamma}?${params}`)

  return Schema.getLlammaEventsResponse.parse(response)
}

export type GetTradesParams = {
  endpoint: Schema.Endpoint
  chain: Chain
  llamma: Address
  page?: number
  perPage?: number
}

export async function getTrades(
  { endpoint: endpointParam, chain, llamma, page = 1, perPage = 10 }: GetTradesParams,
  options?: Options,
) {
  const host = getHost(options)
  Schema.endpoint.parse(endpointParam)
  const params = new URLSearchParams({
    page: page.toString(),
    per_page: perPage.toString(),
  })

  const response = await fetch(`${host}/v1/${endpointParam}/llamma_trades/${chain}/${llamma}?${params}`)

  return Schema.getLlammaTradesResponse.parse(response)
}

type GetOHLCParams = {
  endpoint: Schema.Endpoint
  chain: Chain
  llamma: Address
  interval?: number
  units?: 'day' | 'hour' | 'minute'
  start?: number
  end?: number
}

export async function getOHLC(
  { endpoint: endpointParam, chain, llamma, interval = 1, units = 'hour', start, end }: GetOHLCParams,
  options?: Options,
) {
  const host = getHost(options)
  Schema.endpoint.parse(endpointParam)

  const range = getTimeRange({ start, end })

  const params = new URLSearchParams({
    agg_number: interval.toString(),
    agg_units: units,
    start: range.start.toString(),
    end: range.end.toString(),
  })

  const response = await fetch(`${host}/v1/${endpointParam}/llamma_ohlc/${chain}/${llamma}?${params}`)

  return Schema.getLlammaOHLCResponse.parse(response)
}
