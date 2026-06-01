import type { Address } from '@primitives/address.utils'
import { addQueryString, fetchJson as fetch } from '@primitives/fetch.utils'
import { getHost, type Chain, type Options } from '..'
import * as Schema from './schema'

export type * from './schema'

interface PoolParams {
  chain: Chain
  poolAddress: Address
}
interface WindowParams {
  start?: number
  end?: number
}
interface PageParams {
  page?: number
  pageSize?: number
}

export async function getRefuelTimeseries(
  { chain, poolAddress, start, end, page, pageSize }: PoolParams & WindowParams & PageParams,
  options?: Options,
) {
  const host = getHost(options)
  const query = addQueryString({ start, end, page, page_size: pageSize })
  const response = await fetch(`${host}/v1/refuel/${chain}/${poolAddress}/timeseries${query}`)

  return Schema.refuelTimeseriesResponse.parse(response)
}

export async function getRefuelIlTimeseries(
  {
    chain,
    poolAddress,
    start,
    end,
    initialLp,
    initialUsd,
  }: PoolParams &
    WindowParams & {
      initialLp?: number
      initialUsd?: number
    },
  options?: Options,
) {
  const host = getHost(options)
  const query = addQueryString({ start, end, initial_lp: initialLp, initial_usd: initialUsd })
  const response = await fetch(`${host}/v1/refuel/${chain}/${poolAddress}/il_timeseries${query}`)

  return Schema.refuelIlTimeseriesResponse.parse(response)
}

export async function getRefuelDonationEvents(
  { chain, poolAddress, start, end, page, pageSize }: PoolParams & WindowParams & PageParams,
  options?: Options,
) {
  const host = getHost(options)
  const query = addQueryString({ start, end, page, page_size: pageSize })
  const response = await fetch(`${host}/v1/refuel/${chain}/${poolAddress}/donations/events${query}`)

  return Schema.refuelDonationEventsResponse.parse(response)
}

export async function getRefuelDonationLeaderboard(
  { chain, poolAddress, start, end }: PoolParams & WindowParams,
  options?: Options,
) {
  const host = getHost(options)
  const query = addQueryString({ start, end })
  const response = await fetch(`${host}/v1/refuel/${chain}/${poolAddress}/donations/leaderboard${query}`)

  return Schema.refuelDonationLeaderboardResponse.parse(response)
}

export async function getRefuelChains(options?: Options) {
  const host = getHost(options)
  const response = await fetch(`${host}/v1/refuel/chains`)

  return Schema.refuelChainsResponse.parse(response)
}

export async function getRefuelPools(chain: Chain, options?: Options) {
  const host = getHost(options)
  const response = await fetch(`${host}/v1/refuel/${chain}/pools`)

  return Schema.refuelPoolsResponse.parse(response)
}

export async function getRefuelDailyDonations(
  { chain, poolAddress, start, end }: PoolParams & WindowParams,
  options?: Options,
) {
  const host = getHost(options)
  const query = addQueryString({ start, end })
  const response = await fetch(`${host}/v1/refuel/${chain}/${poolAddress}/donations/daily${query}`)

  return Schema.refuelDailyDonationsResponse.parse(response)
}
