import type { Address } from '@primitives/address.utils'
import { addQueryString, fetchJson as fetch } from '@primitives/fetch.utils'
import { getHost, type Chain, type Options } from '..'
import * as Schema from './schema'

export type * from './schema'

export async function getYieldBasisPools(blockchainId: Chain, options?: Options) {
  const host = getHost(options)
  const response = await fetch(`${host}/v1/yield_basis/${blockchainId}/pools`)

  return Schema.ybPoolsResponse.parse(response)
}

export async function getYieldBasisPoolVolume(blockchainId: Chain, poolAddress: Address, options?: Options) {
  const host = getHost(options)
  const response = await fetch(`${host}/v1/yield_basis/${blockchainId}/${poolAddress}/volume`)

  return Schema.ybPoolVolumeResponse.parse(response)
}

export async function getYieldBasisVolume(blockchainId: Chain, options?: Options) {
  const host = getHost(options)
  const response = await fetch(`${host}/v1/yield_basis/${blockchainId}/volume`)

  return Schema.ybAggregatedVolumeResponse.parse(response)
}

export async function getCrvUsdYieldBasisSupply(blockchainId: Chain, options?: Options) {
  const host = getHost(options)
  const response = await fetch(`${host}/v1/crvusd/yield_basis/${blockchainId}/supply`)

  return Schema.yieldBasisSupplyResponse.parse(response)
}

export async function getCrvUsdYieldBasisHistory(
  blockchainId: Chain,
  params: { start?: number; end?: number } = {},
  options?: Options,
) {
  const host = getHost(options)
  const response = await fetch(`${host}/v1/crvusd/yield_basis/${blockchainId}/history${addQueryString(params)}`)

  return Schema.yieldBasisHistoryResponse.parse(response)
}
