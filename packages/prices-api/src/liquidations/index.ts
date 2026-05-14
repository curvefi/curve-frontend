import { addQueryString, fetchJson as fetch } from '@primitives/fetch.utils'
import { getHost, type Chain, type Options } from '..'
import * as Schema from './schema'

export type * from './schema'

export async function getSoftLiqRatios(
  endpointParam: Schema.Endpoint,
  chain: Chain,
  marketAddr: string,
  options?: Options,
) {
  const host = getHost(options)
  Schema.endpoint.parse(endpointParam)
  const resp = await fetch(`${host}/v1/${endpointParam}/liquidations/${chain}/${marketAddr}/soft_liquidation_ratio`)

  return Schema.getSoftLiqRatiosResponse.parse(resp)
}

export async function getLiqsDetailed(
  endpointParam: Schema.Endpoint,
  chain: Chain,
  marketAddr: string,
  options?: Options,
) {
  const host = getHost(options)
  Schema.endpoint.parse(endpointParam)
  const resp = await fetch(`${host}/v1/${endpointParam}/liquidations/${chain}/${marketAddr}/history/detailed`)

  return Schema.getLiqsDetailedResponse.parse(resp)
}

export async function getLiqsAggregate(
  endpointParam: Schema.Endpoint,
  chain: Chain,
  marketAddr: string,
  options?: Options,
) {
  const host = getHost(options)
  Schema.endpoint.parse(endpointParam)
  const resp = await fetch(`${host}/v1/${endpointParam}/liquidations/${chain}/${marketAddr}/history/aggregated`)

  return Schema.getLiqsAggregateResponse.parse(resp)
}

export async function getLiqOverview(
  endpointParam: Schema.Endpoint,
  chain: Chain,
  marketAddr: string,
  options?: Options,
) {
  const host = getHost(options)
  Schema.endpoint.parse(endpointParam)
  const resp = await fetch(
    `${host}/v1/${endpointParam}/liquidations/${chain}/${marketAddr}/overview?fetch_on_chain=true`,
  )

  return Schema.getLiqOverviewResponse.parse(resp)
}

export async function getLiqLosses(
  endpointParam: Schema.Endpoint,
  chain: Chain,
  marketAddr: string,
  options?: Options,
) {
  const host = getHost(options)
  Schema.endpoint.parse(endpointParam)
  const resp = await fetch(`${host}/v1/${endpointParam}/liquidations/${chain}/${marketAddr}/losses/history`)

  return Schema.getLiqLossesResponse.parse(resp)
}

export async function getLiqHealthDeciles(
  endpointParam: Schema.Endpoint,
  chain: Chain,
  marketAddr: string,
  options?: Options,
) {
  const host = getHost(options)
  Schema.endpoint.parse(endpointParam)
  const resp = await fetch(`${host}/v1/${endpointParam}/liquidations/${chain}/${marketAddr}/health/distribution`)

  return Schema.getLiqHealthDecilesResponse.parse(resp)
}

export async function getTotalOverview(
  {
    endpoint: endpointParam,
    ...params
  }: {
    endpoint: Schema.Endpoint
    fetch_on_chain?: boolean
  },
  options?: Options,
) {
  params.fetch_on_chain ??= true
  Schema.endpoint.parse(endpointParam)

  const host = getHost(options)
  const resp = await fetch(`${host}/v1/${endpointParam}/liquidations/total_overview${addQueryString(params)}`)

  return Schema.getTotalOverviewResponse.parse(resp)
}

export async function getBadDebt(
  {
    endpoint: endpointParam,
    ...params
  }: {
    endpoint: Schema.Endpoint
    fetch_on_chain?: boolean
  },
  options?: Options,
) {
  params.fetch_on_chain ??= true
  Schema.endpoint.parse(endpointParam)

  const host = getHost(options)
  const resp = await fetch(`${host}/v1/${endpointParam}/liquidations/bad_debt${addQueryString(params)}`)

  return Schema.getBadDebtResponse.parse(resp)
}
