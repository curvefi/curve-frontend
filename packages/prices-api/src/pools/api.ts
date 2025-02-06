import { getHost, type Options, type Chain } from '..'
import { fetchJson as fetch } from '../fetch'
import { getTimeRange } from '../timestamp'
import type * as Responses from './responses'
import * as Parsers from './parsers'

export async function getPools(chain: Chain, page: number = 1, perPage: number = 9999, options?: Options) {
  const host = getHost(options)
  const resp = await fetch<Responses.GetPoolsResponse>(`${host}/v1/chains/${chain}?page=${page}&per_page=${perPage}`)

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
