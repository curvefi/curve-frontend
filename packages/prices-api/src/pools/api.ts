import { getHost, type Options, type Chain, type Address } from '..'
import { addQueryString, fetchJson as fetch } from '../fetch'
import { getTimeRange } from '../timestamp'
import * as Parsers from './parsers'
import type * as Responses from './responses'

export async function getPools(chain: Chain, options?: Options) {
  const host = getHost(options)
  const resp = await fetch<Responses.GetPoolsResponse>(`${host}/v1/chains/${chain}`)

  return {
    chain: resp.chain,
    totals: Parsers.parsePoolTotals(resp.total),
    pools: resp.data.map(Parsers.parsePool),
  }
}

export async function getPool(chain: Chain, poolAddr: string, options?: Options) {
  const host = getHost(options)
  const resp = await fetch<Responses.GetPoolResponse>(`${host}/v1/pools/${chain}/${poolAddr}`)

  return Parsers.parsePool(resp)
}

export async function getVolume(chain: Chain, poolAddr: string, options?: Options) {
  const host = getHost(options)

  const { start, end } = getTimeRange({ daysRange: 90 })

  const resp = await fetch<Responses.GetVolumeResponse>(
    `${host}/v1/volume/usd/${chain}/${poolAddr}?` + `interval=day&` + `start=${start}&` + `end=${end}`,
  )

  return resp.data.map(Parsers.parseVolume)
}

export async function getTvl(chain: Chain, poolAddr: string, options?: Options) {
  const host = getHost(options)

  const { start, end } = getTimeRange({ daysRange: 90 })

  const resp = await fetch<Responses.GetTvlResponse>(
    `${host}/v1/snapshots/${chain}/${poolAddr}/tvl?` + `interval=day&` + `start=${start}&` + `end=${end}`,
  )

  return resp.data.map(Parsers.parseTvl)
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

  const resp = await fetch<Responses.GetPoolTradesResponse>(`${host}/v1/trades/${chain}/${poolAddress}${query}`)

  return {
    chain: resp.chain,
    address: resp.address,
    mainToken: Parsers.parseTradeToken(resp.main_token),
    referenceToken: Parsers.parseTradeToken(resp.reference_token),
    trades: resp.data.map(Parsers.parsePoolTrade),
    page: resp.page,
    perPage: resp.per_page,
    count: resp.count,
  }
}

type GetPoolLiquidityEventsParams = {
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

  const resp = await fetch<Responses.GetPoolLiquidityEventsResponse>(
    `${host}/v1/liquidity/${chain}/${poolAddress}${query}`,
  )

  return {
    chain: resp.chain,
    address: resp.address,
    events: resp.data.map(Parsers.parsePoolLiquidityEvent),
    page: resp.page,
    perPage: resp.per_page,
    count: resp.count,
  }
}
