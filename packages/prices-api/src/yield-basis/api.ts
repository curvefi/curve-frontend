import type { Address } from '@primitives/address.utils'
import { addQueryString, fetchJson as fetch } from '@primitives/fetch.utils'
import { getHost, type Chain, type Options } from '..'
import * as Parsers from './parsers'
import type * as Responses from './responses'

export async function getYieldBasisPools(chain: Chain, options?: Options) {
  const host = getHost(options)
  const resp = await fetch<Responses.YBPoolsResponse>(`${host}/v1/yield_basis/${chain}/pools`)

  return resp.data.map(Parsers.parsePool)
}

export async function getYieldBasisPoolVolume(chain: Chain, poolAddress: Address, options?: Options) {
  const host = getHost(options)
  const resp = await fetch<Responses.YBPoolVolumeResponse>(`${host}/v1/yield_basis/${chain}/${poolAddress}/volume`)

  return Parsers.parsePoolVolume(resp)
}

export async function getYieldBasisVolume(chain: Chain, options?: Options) {
  const host = getHost(options)
  const resp = await fetch<Responses.YBAggregatedVolumeResponse>(`${host}/v1/yield_basis/${chain}/volume`)

  return Parsers.parseAggregatedVolume(resp)
}

export async function getCrvUsdYieldBasisSupply(chain: Chain, options?: Options) {
  const host = getHost(options)
  const resp = await fetch<Responses.YieldBasisSupplyResponse>(`${host}/v1/crvusd/yield_basis/${chain}/supply`)

  return Parsers.parseCrvUsdYieldBasisSupply(resp)
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
  const resp = await fetch<Responses.YieldBasisHistoryResponse>(
    `${host}/v1/crvusd/yield_basis/${chain}/history${addQueryString(params)}`,
  )

  return Parsers.parseCrvUsdYieldBasisHistory(resp)
}
