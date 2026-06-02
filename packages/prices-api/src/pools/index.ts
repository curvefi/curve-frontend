import type { Address } from '@primitives/address.utils'
import { addQueryString, fetchJson as fetch } from '@primitives/fetch.utils'
import { getHost, type Chain, type Options } from '..'
import { getTimeRange } from '../timestamp'
import * as Schema from './schema'

export type * from './schema'

export async function getPools(chain: Chain, options?: Options) {
  const host = getHost(options)
  const response = await fetch(`${host}/v1/chains/${chain}`)

  return Schema.getPoolsResponse.parse(response)
}

export async function getPool(chain: Chain, poolAddr: string, options?: Options) {
  const host = getHost(options)
  const response = await fetch(`${host}/v1/pools/${chain}/${poolAddr}`)

  return Schema.getPoolResponse.parse(response)
}

export async function getVolume(chain: Chain, poolAddr: string, options?: Options) {
  const host = getHost(options)

  const { start, end } = getTimeRange({ daysRange: 90 })

  const response = await fetch(
    `${host}/v1/volume/usd/${chain}/${poolAddr}?` + `interval=day&` + `start=${start}&` + `end=${end}`,
  )

  return Schema.getVolumeResponse.parse(response)
}

export async function getTvl(chain: Chain, poolAddr: string, options?: Options) {
  const host = getHost(options)

  const { start, end } = getTimeRange({ daysRange: 90 })

  const response = await fetch(
    `${host}/v1/snapshots/${chain}/${poolAddr}/tvl?` + `interval=day&` + `start=${start}&` + `end=${end}`,
  )

  return Schema.getTvlResponse.parse(response)
}

type GetPoolTradesParams = {
  chain: Chain
  poolAddress: Address
  mainToken: Address
  referenceToken: Address
  page?: number
  perPage?: number
}

export async function getPoolTrades(
  { chain, poolAddress, mainToken, referenceToken, page = 1, perPage = 100 }: GetPoolTradesParams,
  options?: Options,
) {
  const host = getHost(options)
  const query = addQueryString({
    main_token: mainToken,
    reference_token: referenceToken,
    page,
    per_page: perPage,
  })

  const response = await fetch(`${host}/v1/trades/${chain}/${poolAddress}${query}`)

  return Schema.getPoolTradesResponse.parse(response)
}

export type GetAllPoolTradesParams = {
  chain: Chain
  poolAddress: Address
  page?: number
  perPage?: number
  includeState?: boolean
}

export async function getAllPoolTrades(
  { chain, poolAddress, page = 1, perPage = 100, includeState = false }: GetAllPoolTradesParams,
  options?: Options,
) {
  const host = getHost(options)
  const query = addQueryString({
    page,
    per_page: perPage,
    include_state: includeState,
  })

  const response = await fetch(`${host}/v1/trades/all/${chain}/${poolAddress}${query}`)

  return Schema.getAllPoolTradesResponse.parse(response)
}

export type GetPoolLiquidityEventsParams = {
  chain: Chain
  poolAddress: Address
  page?: number
  perPage?: number
}

export async function getPoolLiquidityEvents(
  { chain, poolAddress, page = 1, perPage = 100 }: GetPoolLiquidityEventsParams,
  options?: Options,
) {
  const host = getHost(options)
  const query = addQueryString({
    page,
    per_page: perPage,
  })

  const response = await fetch(`${host}/v1/liquidity/${chain}/${poolAddress}${query}`)

  return Schema.getPoolLiquidityEventsResponse.parse(response)
}

export type GetPoolMetadataParams = {
  chain: Chain
  poolAddress: Address
}

export async function getPoolMetadata({ chain, poolAddress }: GetPoolMetadataParams, options?: Options) {
  const host = getHost(options)

  const response = await fetch(`${host}/v1/pools/${chain}/${poolAddress}/metadata`)

  return Schema.getPoolMetadataResponse.parse(response)
}

export type GetPoolSnapshotsParams = {
  chain: Chain
  poolAddress: Address
  start: number
  end: number
  unit?: 'none' | 'day' | 'week'
}

export async function getPoolSnapshots(
  { chain, poolAddress, start, end, unit = 'none' }: GetPoolSnapshotsParams,
  options?: Options,
) {
  const host = getHost(options)
  const query = addQueryString({ start, end, unit })

  const response = await fetch(`${host}/v1/snapshots/${chain}/${poolAddress}${query}`)

  return Schema.getPoolSnapshotsResponse.parse(response)
}
