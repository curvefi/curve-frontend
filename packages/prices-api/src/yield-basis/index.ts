import type { Address } from '@primitives/address.utils'
import { addQueryString, fetchJson as fetch } from '@primitives/fetch.utils'
import { getHost, type Chain, type Options } from '..'
import * as Schema from './schema'

export type * from './schema'

export async function getYieldBasisPools(chain: Chain, options?: Options) {
  const host = getHost(options)
  const resp = await fetch(`${host}/v1/yield_basis/${chain}/pools`)

  return Schema.ybPoolsResponse.parse(resp)
}

export async function getYieldBasisPoolVolume(chain: Chain, poolAddress: Address, options?: Options) {
  const host = getHost(options)
  const resp = await fetch(`${host}/v1/yield_basis/${chain}/${poolAddress}/volume`)

  return Schema.ybPoolVolumeResponse.parse(resp)
}

export async function getYieldBasisVolume(chain: Chain, options?: Options) {
  const host = getHost(options)
  const resp = await fetch(`${host}/v1/yield_basis/${chain}/volume`)

  return Schema.ybAggregatedVolumeResponse.parse(resp)
}

export async function getCrvUsdYieldBasisSupply(chain: Chain, options?: Options) {
  const host = getHost(options)
  const resp = await fetch(`${host}/v1/crvusd/yield_basis/${chain}/supply`)

  return Schema.yieldBasisSupplyResponse.parse(resp)
}

export async function getCrvUsdYieldBasisHistory(
  chain: Chain,
  params: {
    start?: number
    end?: number
  } = {},
  options?: Options,
) {
  const host = getHost(options)
  const resp = await fetch(`${host}/v1/crvusd/yield_basis/${chain}/history${addQueryString(params)}`)

  return Schema.yieldBasisHistoryResponse.parse(resp)
}
