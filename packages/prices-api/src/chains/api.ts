import { fetchJson as fetch } from '@curvefi/primitives/fetch.utils'
import { getHost, type Options, type Chain } from '..'
import * as Parsers from './parsers'
import type * as Responses from './responses'

export async function getSupportedChains(options?: Options) {
  const host = getHost(options)
  const resp = await fetch<Responses.GetSupportedChainsResponse>(`${host}/v1/chains/`)

  return Parsers.parseSupportedChains(resp)
}

export async function getChainInfo(chain: Chain, options?: Options) {
  const host = getHost(options)
  const resp = await fetch<Responses.GetChainInfoResponse>(`${host}/v1/chains/${chain}`)

  return Parsers.parseChainInfo(resp)
}

export async function getTxs(options?: Options) {
  const host = getHost(options)
  const resp = await fetch<Responses.GetTransactionsResponse>(`${host}/v1/chains/activity/transactions`)

  return Parsers.parseTxs(resp)
}

export async function getUsers(options?: Options) {
  const host = getHost(options)
  const resp = await fetch<Responses.GetUsersResponse>(`${host}/v1/chains/activity/users`)

  return Parsers.parseUsers(resp)
}

export async function getPoolFilters(options?: Options) {
  const host = getHost(options)
  const resp = await fetch<Responses.GetPoolFilters>(`${host}/v1/chains/pool_filters`)

  return Parsers.parsePoolFilters(resp)
}
