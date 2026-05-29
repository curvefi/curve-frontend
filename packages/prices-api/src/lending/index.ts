import type { Address, Hex } from '@primitives/address.utils'
import { fetchJson as fetch } from '@primitives/fetch.utils'
import { getHost, type Chain, type Options } from '..'
import { getTimeRange } from '../timestamp'
import * as Schema from './schema'

export type * from './schema'

export async function getLoanDistribution(
  endpointParam: Schema.Endpoint,
  chain: Chain,
  controller: string,
  options?: Options,
) {
  const host = getHost(options)
  Schema.endpoint.parse(endpointParam)
  const response = await fetch(`${host}/v1/${endpointParam}/markets/${chain}/${controller}/loans/distribution`)

  return Schema.getLoanDistributionResponse.parse(response)
}

interface GetOracleParams {
  endpoint: Schema.Endpoint
  chain: Chain
  controller: Address
  interval: number
  units?: 'day' | 'hour' | 'minute'
  start?: number
  end?: number
}

export async function getOracle(
  { endpoint: endpointParam, chain, controller, interval, units = 'hour', start, end }: GetOracleParams,
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

  const response = await fetch(`${host}/v1/${endpointParam}/oracle_ohlc/${chain}/${controller}?${params}`)

  return Schema.getOracleResponse.parse(response)
}

export async function getUserMarketCollateralEvents(
  userAddr: Address,
  chain: Chain,
  marketController: Address,
  txHash?: Hex, // used to let the backend know that a new transaction was created, so it can batch an update
  options?: Options,
) {
  const host = getHost(options)
  const response = await fetch(
    `${host}/v1/lending/collateral_events/${chain}/${marketController}/${userAddr}${txHash ? `?new_hash=${txHash}` : ''}`,
  )

  return Schema.getUserCollateralEventsResponse.parse(response)
}

export async function getRateCurve(chain: Chain, controller: string, options?: Options) {
  const host = getHost(options)
  const response = await fetch(`${host}/v1/lending/markets/${chain}/${controller}/rate_curve`)

  return Schema.getRateCurveResponse.parse(response)
}
