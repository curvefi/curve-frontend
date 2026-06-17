import { fetchJson as fetch } from '@primitives/fetch.utils'
import { getHost, type Options } from '..'
import { paginate } from '../paginate'
import * as Schema from './schema'

export type * from './schema'

export async function getByChain(options?: Options) {
  const host = getHost(options)
  const response = await fetch(`${host}/v1/chains/fees`, undefined, options?.signal)

  return Schema.getByChainResponse.parse(response)
}

export async function getTopPools(chain: string, numPools = 10, options?: Options) {
  const chainStr = chain === 'mainnet' ? 'ethereum' : chain
  const host = getHost(options)

  const response = await fetch(`${host}/v1/chains/${chainStr}`)

  return Schema.getTopPoolsResponse.parse(response).slice(0, numPools)
}

export async function getCrvUsdWeekly(options?: Options) {
  const host = getHost(options)
  const response = await fetch(`${host}/v1/dao/fees/crvusd/weekly`)

  return Schema.getCrvUsdWeeklyResponse.parse(response)
}

export async function getPoolsWeekly(options?: Options) {
  const host = getHost(options)
  const response = await fetch(`${host}/v1/dao/fees/pools/weekly`)

  return Schema.getPoolsWeeklyResponse.parse(response)
}

export async function getCushions(chain: string, options?: Options) {
  const host = getHost(options)
  const response = await fetch(`${host}/v1/dao/fees/${chain}/pending`)

  return Schema.getCushionsResponse.parse(response)
}

export async function getDistributions(perPage = 100, options?: Options) {
  const host = getHost(options)
  const getPage = (page: number) =>
    fetch(`${host}/v1/dao/fees/distributions?page=${page}&per_page=${perPage}`).then(response =>
      Schema.getDistributionsResponse.parse(response),
    )

  return paginate(getPage, 1, perPage)
}

export async function getCowSwapSettlements(timestamp?: number, options?: Options) {
  const host = getHost(options)
  const response = await fetch(
    `${host}/v1/dao/fees/settlements${timestamp ? '?timestamp=' + timestamp.toString() : ''}`,
  )

  return Schema.getCowSwapSettlementsResponse.parse(response)
}

export async function getFeesCollected(options?: Options) {
  const host = getHost(options)
  const response = await fetch(`${host}/v1/dao/fees/collected`)

  return Schema.getFeesCollectedResponse.parse(response)
}

export async function getFeesStaged(options?: Options) {
  const host = getHost(options)
  const response = await fetch(`${host}/v1/dao/fees/staged`)

  return Schema.getFeesStagedResponse.parse(response)
}
