import { fetchJson as fetch } from '@primitives/fetch.utils'
import { getHost, type Options, type Chain, type Address, type Hex } from '..'
import { getTimeRange } from '../timestamp'
import * as Parsers from './parsers'
import type * as Responses from './responses'

export type Endpoint = 'crvusd' | 'lending'

export async function getLoanDistribution(endpoint: Endpoint, chain: Chain, controller: string, options?: Options) {
  const host = getHost(options)
  const resp = await fetch<Responses.GetLoanDistributionResponse>(
    `${host}/v1/${endpoint}/markets/${chain}/${controller}/loans/distribution`,
  )

  return Parsers.parseLoanDistribution(resp)
}

type GetOracleParams = {
  endpoint: Endpoint
  chain: Chain
  controller: Address
  interval: number
  units?: 'day' | 'hour' | 'minute'
  start?: number
  end?: number
}

export async function getOracle(
  { endpoint, chain, controller, interval, units = 'hour', start, end }: GetOracleParams,
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

  const resp = await fetch<Responses.GetOracleResponse>(
    `${host}/v1/${endpoint}/oracle_ohlc/${chain}/${controller}?${params.toString()}`,
  )

  return Parsers.parseOracle(resp)
}

export async function getUserMarketCollateralEvents(
  userAddr: Address,
  chain: Chain,
  marketController: Address,
  txHash?: Hex, // used to let the backend know that a new transaction was created, so it can batch an update
  options?: Options,
) {
  const host = getHost(options)
  const resp = await fetch<Responses.GetUserCollateralEventsResponse>(
    `${host}/v1/lending/collateral_events/${chain}/${marketController}/${userAddr}${txHash ? `?new_hash=${txHash}` : ''}`,
  )

  return Parsers.parseUserCollateralEvents(resp)
}
