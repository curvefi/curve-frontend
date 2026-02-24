import { fetchJson as fetch, addQueryString } from '@curvefi/primitives/fetch.utils'
import { getHost, type Options, type Chain, type Address } from '..'
import { getTimeRange } from '../timestamp'
import * as Parsers from './parsers'
import type * as Responses from './responses'

/** Retrieve all markets for a specific chain, sorted by date of creation. */
export async function getMarkets(
  chain: Chain,
  params: {
    page?: number
    per_page?: number
  } = {},
  options?: Options,
) {
  const host = getHost(options)
  const resp = await fetch<Responses.GetMarketsResponse>(`${host}/v1/crvusd/markets/${chain}${addQueryString(params)}`)
  return resp.data.map(Parsers.parseMarket)
}

/** Retrieve all markets across all chains, sorted by date of creation descending. */
export async function getAllMarkets(
  params: {
    page?: number
    per_page?: number
  } = {},
  options?: Options,
) {
  const host = getHost(options)
  const resp = await fetch<Responses.GetAllMarketsResponse>(`${host}/v1/crvusd/markets${addQueryString(params)}`)
  return Parsers.parseAllMarkets(resp)
}

export async function getSnapshots(
  chain: Chain,
  marketAddr: string,
  params: {
    agg?: string
    fetch_on_chain?: boolean
    limit?: number
  } = { fetch_on_chain: true, agg: 'day', limit: 100 },
  options?: Options,
) {
  const host = getHost(options)
  const resp = await fetch<Responses.GetSnapshotsResponse>(
    `${host}/v1/crvusd/markets/${chain}/${marketAddr}/snapshots${addQueryString(params)}`,
  )
  return resp.data.map(Parsers.parseSnapshot)
}

export async function getCrvUsdSupply(chain: Chain, days?: number, options?: Options) {
  const host = getHost(options)
  const range = getTimeRange({ daysRange: days })
  const resp = await fetch<Responses.GetSupplyResponse>(
    `${host}/v1/crvusd/markets/${chain}/supply${addQueryString(range)}`,
  )

  return resp.data.map(Parsers.parseSupply)
}

export async function getKeepers(chain: Chain, options?: Options) {
  const host = getHost(options)
  const resp = await fetch<Responses.GetKeepersResponse>(`${host}/v1/crvusd/pegkeepers/${chain}`)

  return resp.keepers.map(Parsers.parseKeeper)
}

export async function getUserMarkets(userAddr: string, chain: Chain, options?: Options) {
  const host = getHost(options)
  const resp = await fetch<Responses.GetUserMarketsResponse>(
    `${host}/v1/crvusd/users/${chain}/${userAddr}?page=1&per_page=100&include_closed=false`,
  )
  return Parsers.parseUserMarkets(resp)
}

export async function getAllUserMarkets(
  userAddr: string,
  params: { include_closed?: boolean } = { include_closed: false },
  options?: Options,
) {
  const host = getHost(options)
  const resp = await fetch<Responses.GetAllUserMarketsResponse>(
    `${host}/v1/crvusd/users/all/${userAddr}${addQueryString(params)}`,
  )
  return Parsers.parseAllUserMarkets(resp)
}

export async function getUserMarketStats(userAddr: string, chain: Chain, marketController: string, options?: Options) {
  const host = getHost(options)
  const resp = await fetch<Responses.GetUserMarketStatsResponse>(
    `${host}/v1/crvusd/users/${chain}/${userAddr}/${marketController}/stats`,
  )
  return Parsers.parseUserMarketStats(resp)
}

export async function getUserMarketSnapshots(
  userAddr: string,
  chain: Chain,
  marketController: string,
  options?: Options,
) {
  const host = getHost(options)
  const resp = await fetch<Responses.GetUserMarketSnapshotsResponse>(
    `${host}/v1/crvusd/users/${chain}/${userAddr}/${marketController}/snapshots?page=1&per_page=100`,
  )

  return Parsers.parseUserMarketSnapshots(resp)
}

export async function getUserMarketCollateralEvents(
  userAddr: Address | '' = '',
  chain: Chain,
  marketController: string,
  txHash?: string,
  options?: Options,
) {
  const host = getHost(options)
  const resp = await fetch<Responses.GetUserCollateralEventsResponse>(
    `${host}/v1/crvusd/collateral_events/${chain}/${marketController}/${userAddr}${txHash ? `?new_hash=${txHash}` : ''}`,
  )

  return Parsers.parseUserCollateralEvents(resp)
}

export async function getCrvUsdTvl(chain: Chain, options?: Options) {
  const host = getHost(options)
  const resp = await fetch<Responses.GetCrvUsdTvlResponse>(`${host}/v1/crvusd/markets/${chain}/tvl`)
  return Parsers.parseCrvUsdTvl(resp)
}
