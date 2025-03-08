import { getHost, type Options } from '..'
import { fetchJson as fetch } from '../fetch'
import * as Parsers from './parsers'
import type * as Responses from './responses'

export async function getOracles(options?: Options) {
  const host = getHost(options)
  const resp = await fetch<Responses.GetOraclesResponse>(`${host}/v1/oracles/all`)

  return Parsers.parseOracles(resp)
}
