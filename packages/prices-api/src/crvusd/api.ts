import { getHost, type Options, type Chain } from '..'
import { fetchJson as fetch } from '../fetch'
import type * as Responses from './responses'
import * as Parsers from './parsers'

export async function getMarkets(chain: Chain, page: number, options?: Options) {
  const host = getHost(options)
  const resp = await fetch<Responses.GetMarketsResponse>(
    `${host}/v1/crvusd/markets/${chain}?fetch_on_chain=true&page=${page}&per_page=10`,
  )

  return resp.data.map(Parsers.parseMarket)
}

export async function getSnapshots(chain: Chain, marketAddr: string, options?: Options) {
  const host = getHost(options)
  const resp = await fetch<Responses.GetSnapshotsResponse>(
    `${host}/v1/crvusd/markets/${chain}/${marketAddr}/snapshots?fetch_on_chain=true&agg=day`,
  )

  return resp.data.map(Parsers.parseSnapshot)
}

export async function getCrvUsdSupply(chain: Chain, options?: Options) {
  const host = getHost(options)
  const resp = await fetch<Responses.GetSupplyResponse>(`${host}/v1/crvusd/markets/${chain}/supply`)

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
    `${host}/v1/crvusd/users/${chain}/${userAddr}?page=1&per_page=100`,
  )

  return Parsers.parseUserMarkets(resp)
}

export async function getUserMarketStats(userAddr: string, chain: Chain, marketController: string, options?: Options) {
  const host = getHost(options)
  const resp = await fetch<Responses.GetUserMarketStatsResponse>(
    `${host}/v1/crvusd/users/${chain}/${userAddr}/${marketController}/stats?page=1&per_page=100`,
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
  userAddr: string,
  chain: Chain,
  marketController: string,
  options?: Options,
) {
  const host = getHost(options)
  const resp = await fetch<Responses.GetUserCollateralEventsResponse>(
    `${host}/v1/crvusd/collateral_events/${chain}/${marketController}/${userAddr}`,
  )

  return Parsers.parseUserCollateralEvents(resp)
}
