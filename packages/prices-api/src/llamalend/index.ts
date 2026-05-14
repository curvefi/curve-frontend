import { addQueryString, fetchJson as fetch } from '@primitives/fetch.utils'
import { getHost, type Chain, type Options } from '..'
import { type Endpoint } from '../llamma'
import * as Schema from './schema'
export { tvl } from './util'

export type * from './schema'

export async function getChains(options?: Options): Promise<Chain[]> {
  const host = getHost(options)

  return fetch(`${host}/v1/lending/chains`).then(resp => Schema.getChainsResponse.parse(resp))
}

export async function getAllMarkets(
  params: {
    page?: number
    per_page?: number
  } = {},
  options?: Options,
) {
  const host = getHost(options)
  const resp = await fetch(`${host}/v1/lending/markets${addQueryString(params)}`)
  return Schema.getAllMarketsResponse.parse(resp)
}

export async function getMarkets(
  chain: Chain,
  params: {
    page?: number
    per_page?: number
  } = {},
  options?: Options,
) {
  const host = getHost(options)
  const resp = await fetch(`${host}/v1/lending/markets/${chain}${addQueryString(params)}`)
  return Schema.getMarketsResponse.parse(resp)
}

export async function getSnapshots(
  chain: Chain,
  marketController: string,
  params: {
    agg?: string
    fetch_on_chain?: boolean
    limit?: number
  } = { fetch_on_chain: true, agg: 'day', limit: 100 },
  options?: Options,
) {
  const host = getHost(options)
  const resp = await fetch(`${host}/v1/lending/markets/${chain}/${marketController}/snapshots${addQueryString(params)}`)
  return Schema.getSnapshotsResponse.parse(resp)
}

export async function getAllUserMarkets(
  userAddr: string,
  params: { include_closed?: boolean } = { include_closed: false },
  options?: Options,
) {
  const host = getHost(options)
  const resp = await fetch(`${host}/v1/lending/users/all/${userAddr}${addQueryString(params)}`)
  return Schema.getAllUserMarketsResponse.parse(resp)
}

export async function getUserMarkets(userAddr: string, chain: Chain, options?: Options) {
  const host = getHost(options)
  const resp = await fetch(`${host}/v1/lending/users/${chain}/${userAddr}?page=1&per_page=100&include_closed=false`)
  return Schema.getUserMarketsResponse.parse(resp)
}

export async function getAllUserLendingPositions(
  userAddr: string,
  params: { include_closed?: boolean } = { include_closed: false },
  options?: Options,
) {
  const host = getHost(options)
  const resp = await fetch(`${host}/v1/lending/users/lending_positions/all/${userAddr}${addQueryString(params)}`)
  return Schema.getAllUserLendingPositionsResponse.parse(resp)
}

export async function getUserLendingPositions(
  userAddr: string,
  chain: Chain,
  params: { include_closed?: boolean } = { include_closed: false },
  options?: Options,
) {
  const host = getHost(options)
  const resp = await fetch(`${host}/v1/lending/users/lending_positions/${chain}/${userAddr}${addQueryString(params)}`)
  return Schema.getUserLendingPositionsResponse.parse(resp)
}

export async function getUserMarketStats(userAddr: string, chain: Chain, marketController: string, options?: Options) {
  const host = getHost(options)
  const resp = await fetch(`${host}/v1/lending/users/${chain}/${userAddr}/${marketController}/stats`)
  return Schema.getUserMarketStatsResponse.parse(resp)
}

export async function getMarketUsers(endpoint: Endpoint, chain: Chain, controller: string, options?: Options) {
  const host = getHost(options)
  const resp = await fetch(`${host}/v1/${endpoint}/users/${chain}/${controller}/users`)

  return Schema.getMarketUsersResponse.parse(resp)
}

export async function getUserMarketEarnings(userAddr: string, chain: Chain, vaultAddress: string, options?: Options) {
  const host = getHost(options)
  const resp = await fetch(`${host}/v1/lending/vaults/${chain}/${vaultAddress}/earnings/${userAddr}`)
  return Schema.getUserMarketEarningsResponse.parse(resp)
}

export async function getUserMarketSnapshots(
  userAddr: string,
  chain: Chain,
  marketController: string,
  options?: Options,
) {
  const host = getHost(options)
  const resp = await fetch(
    `${host}/v1/lending/users/${chain}/${userAddr}/${marketController}/snapshots?page=1&per_page=100`,
  )

  return Schema.getUserMarketSnapshotsResponse.parse(resp)
}

export async function getUserMarketCollateralEvents(
  userAddr: string,
  chain: Chain,
  marketController: string,
  options?: Options,
) {
  const host = getHost(options)
  const resp = await fetch(`${host}/v1/lending/collateral_events/${chain}/${marketController}/${userAddr}`)

  return Schema.getUserCollateralEventsResponse.parse(resp)
}
