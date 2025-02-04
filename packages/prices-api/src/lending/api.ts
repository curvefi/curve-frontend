import { getHost, type Options, type Chain, type Address } from '..'
import { fetchJson as fetch } from '../fetch'
import type * as Responses from './responses'
import * as Parsers from './parsers'

export type Endpoint = 'crvusd' | 'lending'

export async function getLoanDistribution(endpoint: Endpoint, chain: Chain, controller: string, options?: Options) {
  const host = getHost(options)
  const resp = await fetch<Responses.GetLoanDistributionResponse>(
    `${host}/v1/${endpoint}/markets/${chain}/${controller}/loans/distribution`,
  )

  return Parsers.parseLoanDistribution(resp)
}

type GetOracleParams = {
  chain: Chain
  controller: Address
  interval: number
  units?: 'day' | 'hour' | 'minute'
  start?: number
  end?: number
}

export async function getOracle(
  { chain, controller, interval, units = 'hour', start, end }: GetOracleParams,
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

  const resp = await fetch<Responses.GetOracleResponse>(
    `${host}/v1/lending/oracle_ohlc/${chain}/${controller}?${params.toString()}`,
  )

  return Parsers.parseOracle(resp)
}
