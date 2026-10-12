import type { Address, Hex } from '@primitives/address.utils'
import { addQueryString, fetchJson as fetch } from '@primitives/fetch.utils'
import { getHost, type Chain, type Options } from '..'
import { getTimeRange } from '../timestamp'
import * as Schema from './schema'

export type * from './schema'
export { MAX_USER_POOL_PAGE_SIZE } from './constants'

const LITE_POOLS_HOST = 'https://api2.curve.finance'

export async function getPools(blockchainId: Chain, options?: Options) {
  const host = getHost(options)
  const response = await fetch(`${host}/v1/chains/${blockchainId}`)

  return Schema.getPoolsResponse.parse(response)
}

export async function getPool(blockchainId: Chain, poolAddr: string, options?: Options) {
  const host = getHost(options)
  const response = await fetch(`${host}/v1/pools/${blockchainId}/${poolAddr}`)

  return Schema.getPoolResponse.parse(response)
}

export async function listPoolChains(options?: Options) {
  const host = getHost(options)
  const response = await fetch(`${host}/v2/pools/chains/`)

  return Schema.listPoolChainsResponse.parse(response)
}

export async function listLitePoolChains(options?: Options) {
  const host = options?.host ?? LITE_POOLS_HOST
  const response = await fetch(`${host}/get_platforms`, { signal: options?.signal })

  return Schema.listLitePoolChainsResponse.parse(response)
}

export async function listLitePools({ chainId }: { chainId: number }, options?: Options) {
  const host = options?.host ?? LITE_POOLS_HOST
  const response = await fetch(`${host}/get_pools/${chainId}`, { signal: options?.signal })

  return Schema.listLitePoolsResponse.parse(response)
}

export type ListPoolsParams = {
  chainId: number
  page?: number
  pagination?: number
  searchString?: string
  poolType?: string
  minTvl?: number
  maxTvl?: number
  minVolume?: number
  maxVolume?: number
  minApy?: number
  maxApy?: number
  minCreationDate?: number
  maxCreationDate?: number
  sortBy?: Schema.V2PoolSortField
  sortDirection?: Schema.SortDirection
}

export async function listPools(
  {
    page = 1,
    pagination = 50,
    searchString,
    poolType,
    minTvl,
    maxTvl,
    minVolume,
    maxVolume,
    minApy,
    maxApy,
    minCreationDate,
    maxCreationDate,
    chainId,
    sortBy = 'tvl',
    sortDirection = 'desc',
  }: ListPoolsParams,
  options?: Options,
) {
  const host = getHost(options)
  const query = addQueryString({
    page,
    pagination,
    search_string: searchString,
    pool_type: poolType,
    min_tvl: minTvl,
    max_tvl: maxTvl,
    min_volume: minVolume,
    max_volume: maxVolume,
    min_apy: minApy,
    max_apy: maxApy,
    min_creation_date: minCreationDate,
    max_creation_date: maxCreationDate,
    chain_id: chainId,
    sort_by: sortBy,
    sort_direction: sortDirection,
  })
  const response = await fetch(`${host}/v2/pools/${query}`)

  return Schema.listPoolsResponse.parse(response)
}

export async function listPoolRegistries({ chainId }: { chainId: number }, options?: Options) {
  const host = getHost(options)
  const query = addQueryString({ chain_id: chainId })
  const response = await fetch(`${host}/v2/pools/registries/${query}`)

  return Schema.listPoolRegistriesResponse.parse(response)
}

export async function getUserPoolPositions(
  {
    chainId,
    userAddress,
    newTx,
    page,
    pagination,
  }: { chainId: number; userAddress: Address; newTx?: Hex; page?: number; pagination?: number },
  options?: Options,
) {
  const host = getHost(options)
  const query = addQueryString({ new_tx: newTx, page, pagination })
  const response = await fetch(`${host}/v2/pools/${chainId}/users/${userAddress}/positions${query}`, {
    signal: options?.signal,
  })

  return Schema.getUserPoolPositionsResponse.parse(response)
}

export async function getVolume(blockchainId: Chain, poolAddr: string, options?: Options) {
  const host = getHost(options)

  const { start, end } = getTimeRange({ daysRange: 90 })

  const response = await fetch(
    `${host}/v1/volume/usd/${blockchainId}/${poolAddr}?` + `interval=day&` + `start=${start}&` + `end=${end}`,
  )

  return Schema.getVolumeResponse.parse(response)
}

export async function getTvl(blockchainId: Chain, poolAddr: string, options?: Options) {
  const host = getHost(options)

  const { start, end } = getTimeRange({ daysRange: 90 })

  const response = await fetch(
    `${host}/v1/snapshots/${blockchainId}/${poolAddr}/tvl?` + `interval=day&` + `start=${start}&` + `end=${end}`,
  )

  return Schema.getTvlResponse.parse(response)
}

type GetPoolTradesParams = {
  blockchainId: Chain
  poolAddress: Address
  mainToken: Address
  referenceToken: Address
  page?: number
  perPage?: number
}

export async function getPoolTrades(
  { blockchainId, poolAddress, mainToken, referenceToken, page = 1, perPage = 100 }: GetPoolTradesParams,
  options?: Options,
) {
  const host = getHost(options)
  const query = addQueryString({ main_token: mainToken, reference_token: referenceToken, page, per_page: perPage })

  const response = await fetch(`${host}/v1/trades/${blockchainId}/${poolAddress}${query}`)

  return Schema.getPoolTradesResponse.parse(response)
}

export type GetAllPoolTradesParams = {
  blockchainId: Chain
  poolAddress: Address
  page?: number
  perPage?: number
  includeState?: boolean
}

export async function getAllPoolTrades(
  { blockchainId, poolAddress, page = 1, perPage = 100, includeState = false }: GetAllPoolTradesParams,
  options?: Options,
) {
  const host = getHost(options)
  const query = addQueryString({ page, per_page: perPage, include_state: includeState })

  const response = await fetch(`${host}/v1/trades/all/${blockchainId}/${poolAddress}${query}`)

  return Schema.getAllPoolTradesResponse.parse(response)
}

export type GetPoolLiquidityEventsParams = {
  blockchainId: Chain
  poolAddress: Address
  page?: number
  perPage?: number
}

export async function getPoolLiquidityEvents(
  { blockchainId, poolAddress, page = 1, perPage = 100 }: GetPoolLiquidityEventsParams,
  options?: Options,
) {
  const host = getHost(options)
  const query = addQueryString({ page, per_page: perPage })

  const response = await fetch(`${host}/v1/liquidity/${blockchainId}/${poolAddress}${query}`)

  return Schema.getPoolLiquidityEventsResponse.parse(response)
}

export type GetPoolMetadataParams = { blockchainId: Chain; poolAddress: Address }

export async function getPoolMetadata({ blockchainId, poolAddress }: GetPoolMetadataParams, options?: Options) {
  const host = getHost(options)

  const response = await fetch(`${host}/v1/pools/${blockchainId}/${poolAddress}/metadata`)

  return Schema.getPoolMetadataResponse.parse(response)
}

export type GetPoolSnapshotsParams = {
  blockchainId: Chain
  poolAddress: Address
  start: number
  end: number
  unit?: 'none' | 'day' | 'week'
}

export async function getPoolSnapshots(
  { blockchainId, poolAddress, start, end, unit = 'none' }: GetPoolSnapshotsParams,
  options?: Options,
) {
  const host = getHost(options)
  const query = addQueryString({ start, end, unit })

  const response = await fetch(`${host}/v1/snapshots/${blockchainId}/${poolAddress}${query}`)

  return Schema.getPoolSnapshotsResponse.parse(response)
}
