import { getHost, type Options } from '..'
import { fetchJson as fetch } from '../fetch'
import { paginate } from '../paginate'
import type * as Responses from './responses'
import * as Parsers from './parsers'

const API_URL_OLD = Promise.resolve('https://api-py.llama.airforce/curve/v1')

export async function getByChain(options?: Options) {
  const host = await getHost(options?.host ? options : { host: API_URL_OLD })
  const resp = await fetch<Responses.GetByChainResponse>(`${host}/protocol/revenue/chains`, undefined, options?.signal)

  return resp.revenue.map(Parsers.parseChainRevenue)
}

export async function getTopPools(chain: string, numPools = 10, options?: Options) {
  const chainStr = chain === 'ethereum' ? 'mainnet' : chain
  const host = await getHost(options?.host ? options : { host: API_URL_OLD })

  const resp = await fetch<Responses.GetTopPoolsResponse>(`${host}/protocol/revenue/${chainStr}/toppools/${numPools}`)

  return resp.revenue.map(Parsers.parseTopPools)
}

export async function getCrvUsdWeekly(options?: Options) {
  const host = await getHost(options)
  const resp = await fetch<Responses.GetCrvUsdWeeklyResponse>(`${host}/v1/dao/fees/crvusd/weekly`)

  return resp.fees.map(Parsers.parseCrvUsdWeekly)
}

export async function getPoolsWeekly(options?: Options) {
  const host = await getHost(options)
  const resp = await fetch<Responses.GetPoolsWeeklyResponse>(`${host}/v1/dao/fees/pools/weekly`)

  return resp.fees.map(Parsers.parsePoolsWeekly)
}

export async function getCushions(chain: string, options?: Options) {
  const host = await getHost(options)
  const resp = await fetch<Responses.GetCushionsResponse>(`${host}/v1/dao/fees/${chain}/pending`)

  return resp.data.map(Parsers.parseCushion)
}

export async function getDistributions(options?: Options) {
  const host = await getHost(options)
  const fs = (page: number) =>
    fetch<Responses.GetDistributionsResponse>(`${host}/v1/dao/fees/distributions?page=${page}&per_page=100`).then(
      (resp) => resp.distributions.map(Parsers.parseDistribution),
    )

  const distributions = await paginate(fs, 1, 100)

  return distributions
}

export async function getCowSwapSettlements(timestamp?: number, options?: Options) {
  const host = await getHost(options)
  const resp = await fetch<Responses.GetCowSwapSettlementsResponse>(
    `${host}/v1/dao/fees/settlements${timestamp ? '?timestamp=' + timestamp.toString() : ''}`,
  )

  return resp.data.map(Parsers.parseCowSwapSettlement)
}

export async function getFeesCollected(options?: Options) {
  const host = await getHost(options)
  const resp = await fetch<Responses.GetFeesCollectedResponse>(`${host}/v1/dao/fees/collected`)

  return resp.data.map(Parsers.parseFeesCollected)
}

export async function getFeesStaged(options?: Options) {
  const host = await getHost(options)
  const resp = await fetch<Responses.GetFeesStagedResponse>(`${host}/v1/dao/fees/staged`)

  return resp.data.map(Parsers.parseFeesStaged)
}
