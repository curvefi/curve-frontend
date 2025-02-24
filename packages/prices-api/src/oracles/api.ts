import { getHost, type Options } from '..'
import { fetchJson as fetch } from '../fetch'
import type * as Responses from './responses'
import * as Parsers from './parsers'

export async function getOracles(options?: Options) {
  const host = getHost(options)
  const resp = await fetch<Responses.GetOraclesResponse>(`${host}/v1/oracles/all`)

  return Parsers.parseOracles(resp)
}
