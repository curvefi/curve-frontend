import { getHost, type Address, type Options, type Chain } from '..'
import { fetchJson as fetch } from '../fetch'
import type * as Responses from './responses'
import * as Parsers from './parsers'

export async function getChains(options?: Options): Promise<Chain[]> {
  const host = await getHost(options)

  return fetch<Responses.GetChainsResponse>(`${host}/v1/lending/chains`).then((resp) => resp.data)
}

export async function getMarkets(chain: Chain, options?: Options) {
  const host = await getHost(options)
  const resp = await fetch<Responses.GetMarketsResponse>(
    `${host}/v1/lending/markets/${chain}?fetch_on_chain=true&page=1&per_page=100`,
  )

  return resp.data.map(Parsers.parseMarket)
}

type GetSnapshotParams = {
  chain: Chain
  marketController: Address
  fetchOnChain?: boolean
  agg?: 'none' | 'day' | 'week'
  start?: number
  limit?: number
  sortBy?: 'asc' | 'desc'
}

export async function getSnapshots(
  { chain, marketController, fetchOnChain, agg, start, limit, sortBy }: GetSnapshotParams,
  options?: Options,
) {
  const host = await getHost(options)

  const params = new URLSearchParams({
    ...(fetchOnChain !== undefined && { fetch_on_chain: fetchOnChain.toString() }),
    ...(agg && { agg }),
    ...(start !== undefined && { start: start.toString() }),
    ...(limit !== undefined && { limit: limit.toString() }),
    ...(sortBy && { sort_by: sortBy === 'asc' ? 'DATE_ASC' : 'DATE_DESC' }),
  })

  const resp = await fetch<Responses.GetSnapshotsResponse>(
    `${host}/v1/lending/markets/${chain}/${marketController}/snapshots?${params.toString()}`,
  )

  return resp.data.map(Parsers.parseSnapshot)
}

export async function getUserMarkets(userAddr: string, chain: Chain, options?: Options) {
  const host = await getHost(options)
  const resp = await fetch<Responses.GetUserMarketsResponse>(
    `${host}/v1/lending/users/${chain}/${userAddr}?page=1&per_page=100`,
  )

  return Parsers.parseUserMarkets(resp)
}

export async function getUserMarketStats(userAddr: string, chain: Chain, marketController: string, options?: Options) {
  const host = await getHost(options)
  const resp = await fetch<Responses.GetUserMarketStatsResponse>(
    `${host}/v1/lending/users/${chain}/${userAddr}/${marketController}/stats?page=1&per_page=100`,
  )

  return Parsers.parseUserMarketStats(resp)
}

export async function getUserMarketSnapshots(
  userAddr: string,
  chain: Chain,
  marketController: string,
  options?: Options,
) {
  const host = await getHost(options)
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
  const host = await getHost(options)
  const resp = await fetch<Responses.GetUserCollateralEventsResponse>(
    `${host}/v1/lending/collateral_events/${chain}/${marketController}/${userAddr}`,
  )

  return Parsers.parseUserCollateralEvents(resp)
}
