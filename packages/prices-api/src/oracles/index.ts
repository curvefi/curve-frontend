import { fetchJson as fetch } from '@primitives/fetch.utils'
import { getHost, type Options } from '..'
import * as Schema from './schema'

export type * from './schema'

export async function getOracles(options?: Options) {
  const host = getHost(options)
  const response = await fetch(`${host}/v1/oracles/all`)

  return Schema.getOraclesResponse.parse(response)
}
