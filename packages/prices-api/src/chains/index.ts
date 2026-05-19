import { fetchJson as fetch } from '@primitives/fetch.utils'
import { getHost, type Chain, type Options } from '..'
import * as Schema from './schema'

export type * from './schema'

export async function getSupportedChains(options?: Options) {
  const host = getHost(options)
  const response = await fetch(`${host}/v1/chains/`)

  return Schema.getSupportedChainsResponse.parse(response)
}

export async function getChainInfo(chain: Chain, options?: Options) {
  const host = getHost(options)
  const response = await fetch(`${host}/v1/chains/${chain}`)

  return Schema.getChainInfoResponse.parse(response)
}

export async function getTxs(options?: Options) {
  const host = getHost(options)
  const response = await fetch(`${host}/v1/chains/activity/transactions`)

  return Schema.getTransactionsResponse.parse(response)
}

export async function getUsers(options?: Options) {
  const host = getHost(options)
  const response = await fetch(`${host}/v1/chains/activity/users`)

  return Schema.getUsersResponse.parse(response)
}

export async function getPoolFilters(options?: Options) {
  const host = getHost(options)
  const response = await fetch(`${host}/v1/chains/pool_filters`)

  return Schema.getPoolFiltersResponse.parse(response)
}
