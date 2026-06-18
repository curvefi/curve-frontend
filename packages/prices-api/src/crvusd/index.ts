import type { Address } from '@primitives/address.utils'
import { addQueryString, fetchJson as fetch } from '@primitives/fetch.utils'
import { getHost, type Chain, type Options } from '..'
import { getTimeRange } from '../timestamp'
import * as Schema from './schema'

export type * from './schema'

const REVALIDATE_BROWSER_CACHE = { cache: 'no-cache' } satisfies RequestInit

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
  const response = await fetch(
    `${host}/v1/crvusd/markets/${chain}${addQueryString(params)}`,
    undefined,
    options?.signal,
    REVALIDATE_BROWSER_CACHE,
  )

  return Schema.getMarketsResponse.parse(response)
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
  const response = await fetch(
    `${host}/v1/crvusd/markets${addQueryString(params)}`,
    undefined,
    options?.signal,
    REVALIDATE_BROWSER_CACHE,
  )

  return Schema.getAllMarketsResponse.parse(response)
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
  const response = await fetch(`${host}/v1/crvusd/markets/${chain}/${marketAddr}/snapshots${addQueryString(params)}`)

  return Schema.getSnapshotsResponse.parse(response)
}

export async function getCrvUsdSupply(chain: Chain, days?: number, options?: Options) {
  const host = getHost(options)
  const range = getTimeRange({ daysRange: days })
  const response = await fetch(`${host}/v1/crvusd/markets/${chain}/supply${addQueryString(range)}`)

  return Schema.getSupplyResponse.parse(response)
}

export async function getKeepers(chain: Chain, options?: Options) {
  const host = getHost(options)
  const response = await fetch(`${host}/v1/crvusd/pegkeepers/${chain}`)

  return Schema.getKeepersResponse.parse(response)
}

export async function getUserMarkets(userAddr: string, chain: Chain, options?: Options) {
  const host = getHost(options)
  const response = await fetch(`${host}/v1/crvusd/users/${chain}/${userAddr}?page=1&per_page=100&include_closed=false`)

  return Schema.getUserMarketsResponse.parse(response)
}

export async function getAllUserMarkets(
  userAddr: string,
  params: { include_closed?: boolean } = { include_closed: false },
  options?: Options,
) {
  const host = getHost(options)
  const response = await fetch(`${host}/v1/crvusd/users/all/${userAddr}${addQueryString(params)}`)

  return Schema.getAllUserMarketsResponse.parse(response)
}

export async function getUserMarketStats(userAddr: string, chain: Chain, marketController: string, options?: Options) {
  const host = getHost(options)
  const response = await fetch(`${host}/v1/crvusd/users/${chain}/${userAddr}/${marketController}/stats`)

  return Schema.getUserMarketStatsResponse.parse(response)
}

export async function getUserMarketSnapshots(
  userAddr: string,
  chain: Chain,
  marketController: string,
  options?: Options,
) {
  const host = getHost(options)
  const response = await fetch(
    `${host}/v1/crvusd/users/${chain}/${userAddr}/${marketController}/snapshots?page=1&per_page=100`,
  )

  return Schema.getUserMarketSnapshotsResponse.parse(response)
}

export async function getUserMarketCollateralEvents(
  userAddr: Address | '' = '',
  chain: Chain,
  marketController: string,
  txHash?: string,
  options?: Options,
) {
  const host = getHost(options)
  const response = await fetch(
    `${host}/v1/crvusd/collateral_events/${chain}/${marketController}/${userAddr}${txHash ? `?new_hash=${txHash}` : ''}`,
  )

  return Schema.getUserCollateralEventsResponse.parse(response)
}

export async function getCrvUsdTvl(chain: Chain, options?: Options) {
  const host = getHost(options)
  const response = await fetch(`${host}/v1/crvusd/markets/${chain}/tvl`)

  return Schema.getCrvUsdTvlResponse.parse(response)
}
