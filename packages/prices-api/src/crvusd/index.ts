import type { Address } from '@primitives/address.utils'
import { addQueryString, fetchJson as fetch } from '@primitives/fetch.utils'
import { getHost, type Chain, type Options } from '..'
import { getTimeRange } from '../timestamp'
import * as Schema from './schema'

export type * from './schema'

export const USER_MARKETS_FIRST_PAGE = 1
export const USER_MARKETS_DEFAULT_PER_PAGE = 100

type GetUserMarketsParams = { page?: number; per_page?: number; include_closed?: boolean }

/** Retrieve all markets for a specific chain, sorted by date of creation. */
export async function getMarkets(
  blockchainId: Chain,
  params: { page?: number; per_page?: number } = {},
  options?: Options,
) {
  const host = getHost(options)
  const response = await fetch(`${host}/v1/crvusd/markets/${blockchainId}${addQueryString(params)}`)

  return Schema.getMarketsResponse.parse(response)
}

/** Retrieve all markets across all chains, sorted by date of creation descending. */
export async function getAllMarkets(params: { page?: number; per_page?: number } = {}, options?: Options) {
  const host = getHost(options)
  const response = await fetch(`${host}/v1/crvusd/markets${addQueryString(params)}`)

  return Schema.getAllMarketsResponse.parse(response)
}

export async function getSnapshots(
  blockchainId: Chain,
  marketAddr: string,
  params: { agg?: string; fetch_on_chain?: boolean; limit?: number; start?: number; end?: number } = {
    fetch_on_chain: true,
    agg: 'day',
    limit: 100,
  },
  options?: Options,
) {
  const host = getHost(options)
  const response = await fetch(
    `${host}/v1/crvusd/markets/${blockchainId}/${marketAddr}/snapshots${addQueryString(params)}`,
  )

  return Schema.getSnapshotsResponse.parse(response)
}

export async function getCrvUsdSupply(blockchainId: Chain, days?: number, options?: Options) {
  const host = getHost(options)
  const range = getTimeRange({ daysRange: days })
  const response = await fetch(`${host}/v1/crvusd/markets/${blockchainId}/supply${addQueryString(range)}`)

  return Schema.getSupplyResponse.parse(response)
}

export async function getKeepers(blockchainId: Chain, options?: Options) {
  const host = getHost(options)
  const response = await fetch(`${host}/v1/crvusd/pegkeepers/${blockchainId}`)

  return Schema.getKeepersResponse.parse(response)
}

export async function getUserMarkets(
  userAddr: string,
  blockchainId: Chain,
  {
    page = USER_MARKETS_FIRST_PAGE,
    per_page = USER_MARKETS_DEFAULT_PER_PAGE,
    include_closed = false,
  }: GetUserMarketsParams = {},
  options?: Options,
) {
  const host = getHost(options)
  const response = await fetch(
    `${host}/v1/crvusd/users/${blockchainId}/${userAddr}${addQueryString({ page, per_page, include_closed })}`,
  )

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

export async function getUserMarketStats(
  userAddr: string,
  blockchainId: Chain,
  marketController: string,
  options?: Options,
) {
  const host = getHost(options)
  const response = await fetch(`${host}/v1/crvusd/users/${blockchainId}/${userAddr}/${marketController}/stats`)

  return Schema.getUserMarketStatsResponse.parse(response)
}

export async function getUserMarketSnapshots(
  userAddr: string,
  blockchainId: Chain,
  marketController: string,
  options?: Options,
) {
  const host = getHost(options)
  const response = await fetch(
    `${host}/v1/crvusd/users/${blockchainId}/${userAddr}/${marketController}/snapshots?page=1&per_page=100`,
  )

  return Schema.getUserMarketSnapshotsResponse.parse(response)
}

export async function getUserMarketCollateralEvents(
  userAddr: Address | '' = '',
  blockchainId: Chain,
  marketController: string,
  txHash?: string,
  options?: Options,
) {
  const host = getHost(options)
  const response = await fetch(
    `${host}/v1/crvusd/collateral_events/${blockchainId}/${marketController}/${userAddr}${txHash ? `?new_hash=${txHash}` : ''}`,
  )

  return Schema.getUserCollateralEventsResponse.parse(response)
}

export async function getCrvUsdTvl(blockchainId: Chain, options?: Options) {
  const host = getHost(options)
  const response = await fetch(`${host}/v1/crvusd/markets/${blockchainId}/tvl`)

  return Schema.getCrvUsdTvlResponse.parse(response)
}
