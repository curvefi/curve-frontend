import { fetchJson as fetch, addQueryString } from '@curvefi/primitives/fetch.utils'
import { getHost, type Options, type Chain } from '..'
import * as Parsers from './parsers'
import type * as Responses from './responses'

export async function getChains(options?: Options): Promise<Chain[]> {
  const host = getHost(options)

  return fetch<Responses.GetChainsResponse>(`${host}/v1/lending/chains`).then((resp) => resp.data)
}

export async function getAllMarkets(
  params: {
    page?: number
    per_page?: number
  } = {},
  options?: Options,
) {
  const host = getHost(options)
  const resp = await fetch<Responses.GetAllMarketsResponse>(`${host}/v1/lending/markets${addQueryString(params)}`)
  return Parsers.parseAllMarkets(resp)
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
  const resp = await fetch<Responses.GetMarketsResponse>(`${host}/v1/lending/markets/${chain}${addQueryString(params)}`)
  return resp.data.map(Parsers.parseMarket)
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
  const resp = await fetch<Responses.GetSnapshotsResponse>(
    `${host}/v1/lending/markets/${chain}/${marketController}/snapshots${addQueryString(params)}`,
  )
  return resp.data.map(Parsers.parseSnapshot)
}

export async function getAllUserMarkets(
  userAddr: string,
  params: { include_closed?: boolean } = { include_closed: false },
  options?: Options,
) {
  const host = getHost(options)
  const resp = await fetch<Responses.GetAllUserMarketsResponse>(
    `${host}/v1/lending/users/all/${userAddr}${addQueryString(params)}`,
  )
  return Parsers.parseAllUserMarkets(resp)
}

export async function getUserMarkets(userAddr: string, chain: Chain, options?: Options) {
  const host = getHost(options)
  const resp = await fetch<Responses.GetUserMarketsResponse>(
    `${host}/v1/lending/users/${chain}/${userAddr}?page=1&per_page=100&include_closed=false`,
  )
  return Parsers.parseUserMarkets(resp)
}

export async function getAllUserLendingPositions(
  userAddr: string,
  params: { include_closed?: boolean } = { include_closed: false },
  options?: Options,
) {
  const host = getHost(options)
  const resp = await fetch<Responses.GetAllUserLendingPositionsResponse>(
    `${host}/v1/lending/users/lending_positions/all/${userAddr}${addQueryString(params)}`,
  )
  return Parsers.parseAllUserLendingPositions(resp)
}

export async function getUserLendingPositions(
  userAddr: string,
  chain: Chain,
  params: { include_closed?: boolean } = { include_closed: false },
  options?: Options,
) {
  const host = getHost(options)
  const resp = await fetch<Responses.GetUserLendingPositionsResponse>(
    `${host}/v1/lending/users/lending_positions/${chain}/${userAddr}${addQueryString(params)}`,
  )
  return Parsers.parseUserLendingPositions(resp)
}

export async function getUserMarketStats(userAddr: string, chain: Chain, marketController: string, options?: Options) {
  const host = getHost(options)
  const resp = await fetch<Responses.GetUserMarketStatsResponse>(
    `${host}/v1/lending/users/${chain}/${userAddr}/${marketController}/stats`,
  )
  return Parsers.parseUserMarketStats(resp)
}

export async function getUserMarketEarnings(
  userAddr: string,
  chain: Chain,
  marketController: string,
  options?: Options,
) {
  const host = getHost(options)
  const resp = await fetch<Responses.GetUserMarketEarningsResponse>(
    `${host}/v1/lending/vaults/${chain}/${marketController}/earnings/${userAddr}`,
  )
  return Parsers.parseUserMarketEarnings(resp)
}

export async function getUserMarketSnapshots(
  userAddr: string,
  chain: Chain,
  marketController: string,
  options?: Options,
) {
  const host = getHost(options)
  const resp = await fetch<Responses.GetUserMarketSnapshotsResponse>(
    `${host}/v1/lending/users/${chain}/${userAddr}/${marketController}/snapshots?page=1&per_page=100`,
  )

  return Parsers.parseUserMarketSnapshots(resp)
}

export async function getUserMarketCollateralEvents(
  userAddr: string,
  chain: Chain,
  marketController: string,
  options?: Options,
) {
  const host = getHost(options)
  const resp = await fetch<Responses.GetUserCollateralEventsResponse>(
    `${host}/v1/lending/collateral_events/${chain}/${marketController}/${userAddr}`,
  )

  return Parsers.parseUserCollateralEvents(resp)
}
