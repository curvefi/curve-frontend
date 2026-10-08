import type { Address } from '@primitives/address.utils'
import { addQueryString, fetchJson as fetch } from '@primitives/fetch.utils'
import { getHost, type Chain, type Options } from '..'
import * as Schema from './schema'

export type * from './schema'

type PoolParams = { blockchainId: Chain; poolAddress: Address }
type WindowParams = { start?: number; end?: number }
type PageParams = { page?: number; pageSize?: number }

export async function getRefuelTimeseries(
  { blockchainId, poolAddress, start, end, page, pageSize }: PoolParams & WindowParams & PageParams,
  options?: Options,
) {
  const host = getHost(options)
  const query = addQueryString({ start, end, page, page_size: pageSize })
  const response = await fetch(`${host}/v1/refuel/${blockchainId}/${poolAddress}/timeseries${query}`)

  return Schema.refuelTimeseriesResponse.parse(response)
}

export async function getRefuelIlTimeseries(
  {
    blockchainId,
    poolAddress,
    start,
    end,
    initialLp,
    initialUsd,
  }: PoolParams & WindowParams & { initialLp?: number; initialUsd?: number },
  options?: Options,
) {
  const host = getHost(options)
  const query = addQueryString({ start, end, initial_lp: initialLp, initial_usd: initialUsd })
  const response = await fetch(`${host}/v1/refuel/${blockchainId}/${poolAddress}/il_timeseries${query}`)

  return Schema.refuelIlTimeseriesResponse.parse(response)
}

export async function getRefuelDonationEvents(
  { blockchainId, poolAddress, start, end, page, pageSize }: PoolParams & WindowParams & PageParams,
  options?: Options,
) {
  const host = getHost(options)
  const query = addQueryString({ start, end, page, page_size: pageSize })
  const response = await fetch(`${host}/v1/refuel/${blockchainId}/${poolAddress}/donations/events${query}`)

  return Schema.refuelDonationEventsResponse.parse(response)
}

export async function getRefuelDonationLeaderboard(
  { blockchainId, poolAddress, start, end }: PoolParams & WindowParams,
  options?: Options,
) {
  const host = getHost(options)
  const query = addQueryString({ start, end })
  const response = await fetch(`${host}/v1/refuel/${blockchainId}/${poolAddress}/donations/leaderboard${query}`)

  return Schema.refuelDonationLeaderboardResponse.parse(response)
}

export async function getRefuelChains(options?: Options) {
  const host = getHost(options)
  const response = await fetch(`${host}/v1/refuel/chains`)

  return Schema.refuelChainsResponse.parse(response)
}

export async function getRefuelPools(blockchainId: Chain, options?: Options) {
  const host = getHost(options)
  const response = await fetch(`${host}/v1/refuel/${blockchainId}/pools`)

  return Schema.refuelPoolsResponse.parse(response)
}

export async function getRefuelDailyDonations(
  { blockchainId, poolAddress, start, end }: PoolParams & WindowParams,
  options?: Options,
) {
  const host = getHost(options)
  const query = addQueryString({ start, end })
  const response = await fetch(`${host}/v1/refuel/${blockchainId}/${poolAddress}/donations/daily${query}`)

  return Schema.refuelDailyDonationsResponse.parse(response)
}
